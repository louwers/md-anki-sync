import fetch from "node-fetch";
import type { Anki, AnkiCard } from "./anki";

async function getResult(body: any) {
  const res: any = await (
    await fetch("http://localhost:8765", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...body,
        version: 6,
      }),
    })
  ).json();

  if (res.error) {
    console.log(JSON.stringify(body, null, 2));
    throw new Error(`Operation '${body.action}' failed: ${res.error}`);
  }

  return res.result;
}

export async function getDeckNames(): Promise<string[]> {
  const res = await getResult({
    action: "deckNames",
  });

  return res;
}

export async function getModelFieldNames(modelName: string) {
  const res = await getResult({
    action: "modelFieldNames",
    params: {
      modelName: modelName,
    },
  });
  return res;
}

export async function createModel(modelName: string) {
  const res = await getResult({
    action: "createModel",
    params: {
      modelName,
      inOrderFields: ["Front", "Back", "Id"],
      isCloze: false,
      cardTemplates: [
        {
          Front: "{{Front}}",
          Back: "{{Front}}<hr>{{Back}}",
        },
      ],
    },
  });
  return res;
}

export async function modelNames(): Promise<string[]> {
  const res = await getResult({
    action: "modelNames",
  });
  return res;
}

export async function updateModelStyling(modelName: string, css: string) {
  const res = await getResult({
    action: "updateModelStyling",
    params: {
      model: {
        name: modelName,
        css,
      },
    },
  });
  return res;
}

export async function createDeck(deckName: string) {
  const res = await getResult({
    action: "createDeck",
    params: {
      deck: deckName,
    },
  });
  return res;
}

export async function addNote(
  deckName: string,
  { front, back, id }: { front: string; back: string; id: string }
) {
  const res = await getResult({
    action: "addNote",
    params: {
      note: {
        deckName: deckName,
        modelName: "MarkdownNote",
        fields: {
          Front: front,
          Back: back,
          Id: id,
        },
      },
    },
  });
  return res;
}

export async function findNotes(id: string): Promise<number[]> {
  const res = await getResult({
    action: "findNotes",
    params: {
      query: `"id:${id}"`,
    },
  });
  return res;
}

export async function updateNoteFields(
  id: number,
  { front, back }: { front: string; back: string }
) {
  const res = await getResult({
    action: "updateNoteFields",
    params: {
      note: {
        id,
        fields: {
          Front: front,
          Back: back,
        },
      },
    },
  });
  return res;
}

export async function notesInfo(noteId: number): Promise<
  {
    noteId: number;
    modelName: string;
    tags: string[];
    fields: {
      Front: string;
      Back: string;
      Id: string;
    };
    cards: number[];
  }[]
> {
  const res = await getResult({
    action: "notesInfo",
    params: {
      notes: [noteId],
    },
  });
  return res;
}

export async function cardsInfo(cardIds: number[]): Promise<
  {
    question: string;
    answer: string;
    deckName: string;
    modelName: string;
    fieldOrder: number;
    fields: {
      Front: { value: string; order: number };
      Back: { value: string; order: number };
    };
    css: string;
    cardId: number;
    interval: number;
    note: number;
  }[]
> {
  const res = await getResult({
    action: "cardsInfo",
    params: {
      cards: cardIds,
    },
  });
  return res;
}

async function ensureDeck(deck: string) {
  await createDeck(deck);
}

export const ankiConnect: Anki = {
  getCard: async function (id: string): Promise<AnkiCard | null> {
    const notes = await findNotes(id);
    if (notes.length === 0) return null;
    const notesInfoResult = await notesInfo(notes[0]);
    if (notesInfo.length === 0) return null;

    if (notesInfoResult[0].cards.length > 1)
      throw new Error("Found multiple cards for note.");

    if (notesInfoResult[0].cards.length == 0)
      throw new Error(`Found no corresponding card for note with id '${id}'.`);

    const ankiCardId = notesInfoResult[0].cards[0];
    const cardInfoList = await cardsInfo([ankiCardId]);
    const deck = cardInfoList[0].deckName;

    return {
      ankiNoteId: notesInfoResult[0].noteId,
      ankiCardId,
      front: notesInfoResult[0].fields.Front,
      back: notesInfoResult[0].fields.Back,
      id: notesInfoResult[0].fields.Id,
      deck,
    };
  },
  addNote: async function (note: Omit<AnkiCard, "ankiId">): Promise<undefined> {
    await ensureDeck(note.deck);

    await addNote(note.deck, {
      back: note.back,
      front: note.front,
      id: note.id,
    });
    return;
  },
  updateNote: async function (
    ankiId: number,
    { front, back }: { front: string; back: string }
  ): Promise<undefined> {
    await updateNoteFields(ankiId, {
      front,
      back,
    });
    return;
  },
  changeDeck: async function (
    ankiId: number,
    deckName: string
  ): Promise<undefined> {
    await this.changeDeck(ankiId, deckName);
    return;
  },
};
