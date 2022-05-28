import { expect, test } from "vitest";
import { RenderedCard } from './process';
import { ensureCard, AnkiCard } from "./anki";
import { AnkiDummy } from "./anki-dummy";

type Card = Parameters<typeof ensureCard>[0];

test("ensureCard adds card when no card exists yet", async () => {
  const ankiDummy = new AnkiDummy();
  const card: Card = {
    id: 'id',
    answer: 'answer',
    question: 'question',
    deck: 'deck'
  };
  await ensureCard(card, ankiDummy);

  expect(ankiDummy.cards).toHaveLength(1);
  const expectedCard: Omit<AnkiCard, 'ankiCardId' | 'ankiNoteId'> = {
    id: card.id,
    front: card.question,
    back: card.answer,
    deck: card.deck
  }
  expect(ankiDummy.cards[0]).toMatchObject(expectedCard);
})

test("ensureCard changes deck when needed", async () => {
  const ankiDummy = new AnkiDummy([{
    ankiCardId: 0,
    ankiNoteId: 0,
    id: 'id',
    deck: 'deck',
    back: 'back',
    front: 'front'
  }]);
  await ensureCard({
    deck: 'newDeck',
    answer: 'back',
    id: 'id',
    question: 'front'
  }, ankiDummy);

  expect(ankiDummy.cards).toHaveLength(1);
  expect(ankiDummy.cards[0].deck).toBe('newDeck');
})