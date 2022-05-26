import { marked } from "marked";

export type Card = {
  question: marked.Token[];
  answer: marked.Token[];
  id: string;
  deck: string;
};

type UnfinishedCard = Omit<Card, "deck"> & {
  questionDepth: number;
  gathering: "question" | "answer";
};

export type RenderedCard = {
  question: string;
  answer: string;
  id: string;
  deck: string;
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

export function renderCard(unrenderedCard: Card): RenderedCard {
  return {
    ...unrenderedCard,
    question: marked.parser(unrenderedCard.question),
    answer: marked.parser(unrenderedCard.answer),
  };
}

function getDeckName(deckHeadings: (marked.Token & { type: "heading" })[]) {
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
  deckHeadings: (marked.Token & { type: "heading" })[]
): Card[] {
  return card
    ? [
        {
          deck: getDeckName(deckHeadings),
          ...card,
        },
      ]
    : [];
}

function questionHasContext(
  questionToken: marked.Token & { type: "heading" },
  nextTokens: marked.Token[]
) {
  for (const token of nextTokens) {
    if (token.type !== "heading") continue;

    if (token.depth === questionToken.depth + 1) return token.text === "Answer";

    if (token.depth < questionToken.depth) return false;
  }
  return false;
}

type Context = Parameters<typeof processMarkdown>[0];

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
  const id = getQuestionId(headToken.text);
  if (!id)
    return {
      ...ctx,
      tokens: tailTokens,
      cards: [
        ...ctx.cards,
        ...finishCard(ctx.unfinishedCard, ctx.deckHeadings),
      ],
      errors: [
        ...ctx.errors,
        `Failed to get id for question '${headToken.text}'`,
      ],
    };

  return {
    ...ctx,
    tokens: tailTokens,
    cards: [...ctx.cards, ...finishCard(ctx.unfinishedCard, ctx.deckHeadings)],
    unfinishedCard: {
      id: id,
      questionDepth: headToken.depth,
      gathering,
      question: shouldIncludeHeaderInQuestion(headToken.text) ? [headToken] : [],
      answer: [],
    },
  };
}

function processMarkdown(ctx: {
  tokens: marked.Token[];
  cards: Card[];
  deckHeadings: (marked.Token & { type: "heading" })[];
  unfinishedCard: UnfinishedCard | null;
  errors: string[];
}): Card[] {
  const { tokens, cards, deckHeadings, errors, unfinishedCard } = ctx;
  if (tokens.length === 0) {
    // console.log(JSON.stringify(ctx, null, 2));
    return [...cards, ...finishCard(unfinishedCard, deckHeadings)];
  }
  const [headToken, ...tailTokens] = tokens;

  if (headToken.type === "heading") {
    if (isDeckHeading(headToken)) {
      if (unfinishedCard && unfinishedCard.gathering === "answer")
        return processMarkdown({
          ...ctx,
          errors: [
            ...errors,
            `Found Deck heading '${headToken.text}' while gathering answer for question. Ignoring question.`,
          ],
          tokens: tailTokens,
          deckHeadings: [...deckHeadings, headToken],
        });

      return processMarkdown({
        ...ctx,
        cards: [...cards, ...finishCard(unfinishedCard, deckHeadings)],
        tokens: tailTokens,
        deckHeadings: [...deckHeadings, headToken],
      });
    }

    if (
      unfinishedCard &&
      unfinishedCard.gathering === "question" &&
      headToken.depth === unfinishedCard.questionDepth + 1 &&
      headToken.text === "Answer"
    ) {
      // switch to gathering answer
      return processMarkdown({
        ...ctx,
        tokens: tailTokens,
        unfinishedCard: {
          ...unfinishedCard,
          gathering: "answer",
        },
      });
    }

    if (!unfinishedCard || headToken.depth <= unfinishedCard.questionDepth) {
      return processMarkdown(encounteredQuestion(ctx, headToken, tailTokens));
    }
  }

  return processMarkdown({
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

export function getCards(markdown: string) {
  const tokens = marked.lexer(markdown);
  // console.log(JSON.stringify(tokens, null, 2));
  return processMarkdown({
    tokens,
    cards: [],
    deckHeadings: [],
    errors: [],
    unfinishedCard: null,
  });
}
