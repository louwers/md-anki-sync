import { marked } from "@louwers/marked";
import * as crypto from "node:crypto";

export type MarkdownCard = {
  question: marked.Token[];
  answer: marked.Token[];
  id: string;
  deck: string;
};

type UnfinishedCard = MarkdownCard & {
  questionDepth: number;
  gathering: "question" | "answer";
};

export type RenderedCard = {
  question: string;
  answer: string;
  id: string;
  deck: string;
};

type Heading = marked.Token & { type: "heading" };

type Functions = {
  genId: () => string;
};

const DECK_HEADING_START = "Deck: ";

export function isDeck(headingText: string) {
  return headingText.startsWith(DECK_HEADING_START);
}

function deckNameFromHeading(headingText: string) {
  return headingText.slice(DECK_HEADING_START.length);
}

function isDeckHeading(token: marked.Token) {
  return token.type === "heading" && isDeck(token.text);
}

const ID_REGEX = /<!-- id:(\w+) -->/;

export function getQuestion(line: string) {
  return line.replace(ID_REGEX, "");
}

export function getQuestionId(line: string) {
  const matches = line.match(ID_REGEX);
  return matches?.length == 2 ? matches[1] : null;
}

function genId() {
  return crypto.randomBytes(16).toString("hex");
}

function getDeckName(deckHeadings: Heading[]) {
  if (deckHeadings.length === 0) return "";
  const deckNameParts = [
    deckNameFromHeading(deckHeadings[deckHeadings.length - 1].text),
  ];
  let lastDepth = deckHeadings[deckHeadings.length - 1].depth;

  for (let idx = deckHeadings.length - 2; idx >= 0; --idx) {
    if (lastDepth == 1) break;
    if (deckHeadings[idx].depth >= lastDepth) continue;
    deckNameParts.push(deckNameFromHeading(deckHeadings[idx].text));
    lastDepth = deckHeadings[idx].depth;
  }
  return deckNameParts.reverse().join("::");
}

function finishCard(
  card: null | UnfinishedCard,
): MarkdownCard[] {
  return card ? [card] : [];
}

function questionHasContext(
  questionToken: marked.Token & { type: "heading" },
  nextTokens: marked.Token[]
) {
  for (const token of nextTokens) {
    if (token.type !== "heading") continue;

    if (token.depth === questionToken.depth + 1) return token.text === "Answer";

    if (token.depth <= questionToken.depth) return false;
  }
  return false;
}

type Context = Parameters<typeof _processMarkdown>[0];

export function shouldIncludeHeaderInQuestion(headerText: string) {
  return !headerText.startsWith("Question");
}

function encounteredQuestion(
  ctx: Context,
  headToken: marked.Token & { type: "heading" },
  tailTokens: marked.Token[]
): Context {
  const gathering = questionHasContext(headToken, tailTokens)
    ? "question"
    : "answer";
  const questionId = getQuestionId(headToken.text);
  const newId = questionId ? false : true;
  const id = questionId ? questionId : ctx.functions.genId();
  const ln = (headToken as unknown as { ln: number }).ln;

  return {
    ...ctx,
    tokens: tailTokens,
    cards: [...ctx.cards, ...finishCard(ctx.unfinishedCard)],
    unfinishedCard: {
      id: id,
      questionDepth: headToken.depth,
      gathering,
      question: shouldIncludeHeaderInQuestion(headToken.text)
        ? [headToken]
        : [],
      answer: [],
      deck: getDeckName(ctx.deckHeadings)
    },
    newIds: newId ? [...ctx.newIds, { id, ln }] : ctx.newIds,
  };
}

function encounteredDeck(
  ctx: Context,
  headToken: Heading,
  tailTokens: marked.Token[]
): Context {
  if (ctx.unfinishedCard && ctx.unfinishedCard.gathering === "answer")
    return {
      ...ctx,
      errors: [
        ...ctx.errors,
        `Found Deck heading '${headToken.text}' while gathering answer for question. Ignoring question.`,
      ],
      tokens: tailTokens,
      deckHeadings: [...ctx.deckHeadings, headToken],
    };

  return {
    ...ctx,
    cards: [...ctx.cards, ...finishCard(ctx.unfinishedCard)],
    tokens: tailTokens,
    deckHeadings: [...ctx.deckHeadings, headToken],
  };
}

function _processMarkdown(ctx: {
  tokens: marked.Token[];
  cards: MarkdownCard[];
  deckHeadings: (marked.Token & { type: "heading" })[];
  unfinishedCard: UnfinishedCard | null;
  errors: string[];
  newIds: { ln: number; id: string }[];
  functions: Functions;
}): { cards: MarkdownCard[]; newIds: { ln: number; id: string }[] } {
  const { tokens, cards, deckHeadings, errors, unfinishedCard, newIds } = ctx;
  if (tokens.length === 0) {
    return {
      cards: [...cards, ...finishCard(unfinishedCard, deckHeadings)],
      newIds,
    };
  }
  const [headToken, ...tailTokens] = tokens;

  if (headToken.type === "heading") {
    if (isDeckHeading(headToken)) {
      return _processMarkdown(encounteredDeck(ctx, headToken, tailTokens));
    }

    if (
      unfinishedCard &&
      unfinishedCard.gathering === "question" &&
      headToken.depth === unfinishedCard.questionDepth + 1 &&
      headToken.text === "Answer"
    ) {
      // switch to gathering answer
      return _processMarkdown({
        ...ctx,
        tokens: tailTokens,
        unfinishedCard: {
          ...unfinishedCard,
          gathering: "answer",
        },
      });
    }

    if (!unfinishedCard || headToken.depth <= unfinishedCard.questionDepth) {
      return _processMarkdown(encounteredQuestion(ctx, headToken, tailTokens));
    }
  }

  return _processMarkdown({
    ...ctx,
    tokens: tailTokens,
    unfinishedCard: unfinishedCard
      ? {
          ...unfinishedCard,
          question:
            unfinishedCard.gathering === "question"
              ? [...unfinishedCard.question, headToken]
              : unfinishedCard.question,
          answer:
            unfinishedCard.gathering === "answer"
              ? [...unfinishedCard.answer, headToken]
              : unfinishedCard.answer,
        }
      : null,
  });
}

const defaultFunctions: Functions = {
  genId,
};

export function processMarkdown(
  markdown: string,
  functions: Functions = defaultFunctions
) {
  const tokens = marked.lexer(markdown, {
    headerIds: true,
  });
  return _processMarkdown({
    tokens,
    cards: [],
    deckHeadings: [],
    errors: [],
    unfinishedCard: null,
    newIds: [],
    functions,
  });
}
