import { test, expect } from "vitest";
import { getCards, RenderedCard, renderCard, isDeck } from "./process";
import { htmlToText } from "html-to-text";

const md1 = `
# Deck: My Deck

## First question?

First answer`;

test.skip("md1", () => {
  expect(() => {
    getCards(md1);
  }).toThrowError(/Question .* missing ID./);
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
  const cards = getCards(md2);
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
  const cards = getCards(md3);
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

const md4 = `
# Deck: Upper Deck

## Deck: Nested

### Some Question  <!-- id:c72ec3b33c89c5f55e77cc7e9408bd86 -->

Some Answer
`;

test("md4", () => {
  const cards = getCards(md4);
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
