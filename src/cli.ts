
import { getCards, renderCards } from "./process";
import * as fs from "node:fs/promises";
import { ankiConnect, findNotes } from "./anki-connect";
import { ensureCards } from "./anki";
import { ankiDummy } from "./anki-dummy";

// const md = new MarkdownIt({
//   highlight: function (str, lang) {
//     if (lang && hljs.getLanguage(lang)) {
//       try {
//         return hljs.highlight(str, { language: lang }).value;
//       } catch (__) {}
//     }

//     return ""; // use external default escaping
//   },
// });

// async function ensureDeck(deckName: string) {
//   const deckNames = await getDeckNames();
//   if (deckNames.find((el) => el === deckName)) return;
//   await createDeck(deckName);
// }

// const css = `
// pre {
//   background-color: white;
// }

// .card {
//   font-size: 1.05em;
// }

// .hljs{color:#24292e;background:#fff}.hljs-doctag,.hljs-keyword,.hljs-meta .hljs-keyword,.hljs-template-tag,.hljs-template-variable,.hljs-type,.hljs-variable.language_{color:#d73a49}.hljs-title,.hljs-title.class_,.hljs-title.class_.inherited__,.hljs-title.function_{color:#6f42c1}.hljs-attr,.hljs-attribute,.hljs-literal,.hljs-meta,.hljs-number,.hljs-operator,.hljs-selector-attr,.hljs-selector-class,.hljs-selector-id,.hljs-variable{color:#005cc5}.hljs-meta .hljs-string,.hljs-regexp,.hljs-string{color:#032f62}.hljs-built_in,.hljs-symbol{color:#e36209}.hljs-code,.hljs-comment,.hljs-formula{color:#6a737d}.hljs-name,.hljs-quote,.hljs-selector-pseudo,.hljs-selector-tag{color:#22863a}.hljs-subst{color:#24292e}.hljs-section{color:#005cc5;font-weight:700}.hljs-bullet{color:#735c0f}.hljs-emphasis{color:#24292e;font-style:italic}.hljs-strong{color:#24292e;font-weight:700}.hljs-addition{color:#22863a;background-color:#f0fff4}.hljs-deletion{color:#b31d28;background-color:#ffeef0}
// `;

// function renderedCard(card: { front: string; back: string }) {
//   return {
//     front: md.render(card.front),
//     back: md.render(card.back),
//   };
// }

// async function ensureModel() {
//   const allModelNames = await modelNames();
//   if (allModelNames.find((el) => el === MODEL_NAME)) return;
//   await createModel(MODEL_NAME);
// }

export async function syncMarkdown(fileName: string) {
  const markdown = (await fs.readFile(fileName)).toString();
  const { cards } = getCards(markdown);
  const renderedCards = renderCards(cards);

  ensureCards(renderedCards, ankiConnect);
  // console.log(cards);
  // await addMissingIds(fileName);
  // const parsedMd = await parseMd(fileName);

  // await ensureDeck(parsedMd.deckName);

  // await ensureModel();
  // updateModelStyling(MODEL_NAME, css);

  // for (const card of parsedMd.cards) {
  //   const foundNotes = await findNotes(card.id);
  //   if (foundNotes.length) {
  //     await updateNoteFields(foundNotes[0], renderedCard(card));
  //     continue;
  //   }
  //   await addNote(parsedMd.deckName, { id: card.id, ...renderedCard(card) });
  // }
}

(async () => {
  if (process.argv.length !== 3) {
    console.log("usage:");
    console.log("    npm run md-anki-sync -- somefile.md");
  }
  await syncMarkdown(process.argv[2]);
})();
