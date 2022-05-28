import { processMarkdown } from "./process";
import * as fs from "node:fs/promises";
import { ankiConnect, createModel, modelNames, updateModelStyling } from "./anki-connect";
import { ensureCards } from "./anki";
import { renderCards } from "./render";
import { addNewIdsToFile, newIdListToRecord } from "./add-new-ids";
import { MODEL_NAME } from "./constants";

const css = `
pre {
  background-color: white;
}

.card {
  font-size: 1.05em;
}

.hljs{color:#24292e;background:#fff}.hljs-doctag,.hljs-keyword,.hljs-meta .hljs-keyword,.hljs-template-tag,.hljs-template-variable,.hljs-type,.hljs-variable.language_{color:#d73a49}.hljs-title,.hljs-title.class_,.hljs-title.class_.inherited__,.hljs-title.function_{color:#6f42c1}.hljs-attr,.hljs-attribute,.hljs-literal,.hljs-meta,.hljs-number,.hljs-operator,.hljs-selector-attr,.hljs-selector-class,.hljs-selector-id,.hljs-variable{color:#005cc5}.hljs-meta .hljs-string,.hljs-regexp,.hljs-string{color:#032f62}.hljs-built_in,.hljs-symbol{color:#e36209}.hljs-code,.hljs-comment,.hljs-formula{color:#6a737d}.hljs-name,.hljs-quote,.hljs-selector-pseudo,.hljs-selector-tag{color:#22863a}.hljs-subst{color:#24292e}.hljs-section{color:#005cc5;font-weight:700}.hljs-bullet{color:#735c0f}.hljs-emphasis{color:#24292e;font-style:italic}.hljs-strong{color:#24292e;font-weight:700}.hljs-addition{color:#22863a;background-color:#f0fff4}.hljs-deletion{color:#b31d28;background-color:#ffeef0}
`;

async function ensureModel() {
  const allModelNames = await modelNames();
  if (allModelNames.find((el) => el === MODEL_NAME)) return;
  await createModel(MODEL_NAME);
}

export async function syncMarkdown(fileName: string) {
  const markdown = (await fs.readFile(fileName)).toString();
  const { cards, newIds } = processMarkdown(markdown);
  await addNewIdsToFile(fileName, newIdListToRecord(newIds));
  const renderedCards = renderCards(cards);

  await ensureModel();
  updateModelStyling(MODEL_NAME, css);
  ensureCards(renderedCards, ankiConnect);
}

(async () => {
  if (process.argv.length !== 3) {
    console.log("usage:");
    console.log("    npm run md-anki-sync -- somefile.md");
  }
  await syncMarkdown(process.argv[2]);
})();
