import fetch from "node-fetch";

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

export async function notesInfo(noteId: number): Promise<any[]> {
  const res = await getResult({
    action: "notesInfo",
    params: {
      notes: [noteId],
    },
  });
  return res;
}
