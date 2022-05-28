import { RenderedCard } from "./process";

export type AnkiCard = {
  ankiNoteId: number;
  ankiCardId: number;
  id: string;
  front: string;
  back: string;
  deck: string;
};

export interface Anki {
  getCard(id: string): Promise<AnkiCard | null>;
  addNote(
    note: Omit<AnkiCard, "ankiCardId" | "ankiNoteId">
  ): Promise<undefined>;
  updateNote(
    ankiId: number,
    fields: { front: string; back: string }
  ): Promise<undefined>;
  changeDeck(ankiId: number, deckName: string): Promise<undefined>;
}

async function ensureCard(card: RenderedCard, anki: Anki) {
  const ankiCard = await anki.getCard(card.id);
  if (!ankiCard) {
    await anki.addNote({
      front: card.question,
      back: card.answer,
      deck: card.deck,
      id: card.id,
    });
    return;
  }

  if (ankiCard.deck !== card.deck) {
    await anki.changeDeck(ankiCard.ankiCardId, card.deck);
  }

  if (ankiCard.front !== card.question || ankiCard.back !== card.answer) {
    await anki.updateNote(ankiCard.ankiNoteId, {
      front: card.question,
      back: card.answer,
    });
  }
}

export async function ensureCards(cards: RenderedCard[], anki: Anki) {
  for (const card of cards) {
    await ensureCard(card, anki);
  }
}
