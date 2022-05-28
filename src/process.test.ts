import { test, expect } from "vitest";
import { getCards, RenderedCard, renderCard, isDeck, shouldIncludeHeaderInQuestion } from "./process";
import { htmlToText } from "html-to-text";

const mdNoIds = `# Deck: My Deck

## First question?

First answer`;

test("Markdown without ids", () => {
  const {cards, newIds} = getCards(mdNoIds, {
    genId: () => 'newId'
  });
  expect(cards).toHaveLength(1);
  expect(newIds).toHaveLength(1);
  expect(newIds[0].ln).toBe(3);
  expect(newIds[0].id).toBe('newId');

  const renderedCard = renderCard(cards[0]);
  const plainCard = makePlainCard(renderedCard);

  const expectedCard = {
    question: "First question?",
    answer: "First answer",
    id: "newId",
    deck: "My Deck",
  };

  expect(plainCard).toEqual(expectedCard);
});

const md2 = `
# Deck: My Deck

## First question? <!-- id:c72ec3b33c89c5f55e77cc7e9408bd86 -->

First answer`;

function makePlainText(html: string) {
  return htmlToText(html, {
    uppercaseHeadings: false,
  });
}

function makePlainCard({ question, answer, id, deck }: RenderedCard) {
  return {
    id,
    question: makePlainText(question),
    answer: makePlainText(answer),
    deck,
  };
}

test("md2", () => {
  const {cards} = getCards(md2);
  expect(cards).toHaveLength(1);

  const renderedCard = renderCard(cards[0]);
  const plainCard = makePlainCard(renderedCard);

  const expectedCard = {
    question: "First question?",
    answer: "First answer",
    id: "c72ec3b33c89c5f55e77cc7e9408bd86",
    deck: "My Deck",
  };

  expect(plainCard).toEqual(expectedCard);
});

const md3 = `
# Deck: My Deck

## This is a question <!-- id:c72ec3b33c89c5f55e77cc7e9408bd86 -->

Some more context of the question.

### Answer

This is the answer to the question.
`;

test("md3", () => {
  const {cards} = getCards(md3);
  expect(cards).toHaveLength(1);

  const renderedCard = renderCard(cards[0]);
  const plainCard = makePlainCard(renderedCard);

  const expectedCard = {
    question: "This is a question\n\nSome more context of the question.",
    answer: "This is the answer to the question.",
    id: "c72ec3b33c89c5f55e77cc7e9408bd86",
    deck: "My Deck",
  };

  expect(plainCard).toEqual(expectedCard);
});

test("isDeck", () => {
  expect(isDeck("Deck: Test")).toBe(true);
});

test("shouldIncludeHeaderInQuestion", () => {
  expect(shouldIncludeHeaderInQuestion("Question")).toBe(false);
})

const md4 = `
# Deck: Upper Deck

## Deck: Nested

### Some Question  <!-- id:c72ec3b33c89c5f55e77cc7e9408bd86 -->

Some Answer
`;

test("md4", () => {
  const {cards} = getCards(md4);
  expect(cards).toHaveLength(1);

  const renderedCard = renderCard(cards[0]);
  const plainCard = makePlainCard(renderedCard);

  const expectedCard = {
    question: "Some Question",
    answer: "Some Answer",
    id: "c72ec3b33c89c5f55e77cc7e9408bd86",
    deck: "Upper Deck::Nested",
  };

  expect(plainCard).toEqual(expectedCard);
});


const md5 = `
# Deck: My Deck

### Some Question  <!-- id:yyy -->

Some Answer

### Some Other Question  <!-- id:zzz -->

Another answer
`;

test("Multiple Questions", () => {
  const {cards} = getCards(md5);
  expect(cards).toHaveLength(2);

  const renderedCard0 = renderCard(cards[0]);
  const plainCard0 = makePlainCard(renderedCard0);
  const expectedCard0 = {
    question: "Some Question",
    answer: "Some Answer",
    id: "yyy",
    deck: "My Deck",
  };

  expect(plainCard0).toEqual(expectedCard0);

  const renderedCard1 = renderCard(cards[1]);
  const plainCard1 = makePlainCard(renderedCard1);
  const expectedCard1 = {
    question: "Some Other Question",
    answer: "Another answer",
    id: "zzz",
    deck: "My Deck",
  };
  expect(plainCard1).toEqual(expectedCard1);
});

const md6 = `
# Deck: My Deck

## Question  <!-- id:yyy -->

Some Question

### Answer

Some Answer`;

test("Question without heading", () => {
  const {cards} = getCards(md6);
  expect(cards).toHaveLength(1);

  const renderedCard = renderCard(cards[0]);
  const plainCard = makePlainCard(renderedCard);
  const expectedCard = {
    question: "Some Question",
    answer: "Some Answer",
    id: "yyy",
    deck: "My Deck",
  };
  expect(plainCard).toEqual(expectedCard);
});