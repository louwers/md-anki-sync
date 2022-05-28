import type {Anki, AnkiCard} from './anki';

export class AnkiDummy implements Anki {
  cards: AnkiCard[] = []
  constructor(cards: AnkiCard[] = []) {
    this.cards = cards;
  }

  async getCard(id: string): Promise<AnkiCard | null> {
    const foundCard = this.cards.find(card => card.id === id);
    return foundCard || null;
  }

  async addNote(note: Omit<AnkiCard, 'ankiCardId' | 'ankiNoteId'>): Promise<undefined> {
    const foundCard = await this.getCard(note.id);
    if (foundCard) throw new Error(`Card with id=${note.id} already exists`);
    this.cards.push({
      ankiCardId: 0,
      ankiNoteId: 0,
      ...note,
    });
    return;
  }

  async updateNote(ankiNoteId: number, fields: { front: string; back: string; }): Promise<undefined> {
    const foundCard = this.cards.find(card => card.ankiNoteId === ankiNoteId);
    if (!foundCard) throw new Error(`No note with ankiNoteId=${ankiNoteId}.`);
    foundCard.front = fields.front;
    foundCard.back = fields.back;
    return;
  }

  async changeDeck(ankiCardId: number, deckName: string): Promise<undefined> {
    const foundCard = this.cards.find(card => card.ankiCardId === ankiCardId);
    if (!foundCard) throw new Error(`No note with ankiCardId=${ankiCardId}.`);
    foundCard.deck = deckName;
    return;
  }
}