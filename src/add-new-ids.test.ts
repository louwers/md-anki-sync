import { test, expect } from "vitest";
import { temporaryFile } from "tempy";
import * as fs from "node:fs/promises";
import { createNewFileWithNewIds } from "./add-new-ids";

async function temporaryFileWithContents(contents: string) {
  const tempFile = temporaryFile();
  const fdOut = await fs.open(tempFile, "w");
  fdOut.write(contents);
  return tempFile;
}

test("createNewFileWithNewIds", async () => {
  const mdFile = await temporaryFileWithContents(`
  # Hello world
  
  ## Some other line`);

  const newFile = await createNewFileWithNewIds(mdFile, {
    2: "someid",
    4: "someotherid",
  });

  const newFileContents = (await fs.readFile(newFile)).toString();
  expect(newFileContents).toEqual(`
  # Hello world <!-- id:someid -->
  
  ## Some other line <!-- id:someotherid -->`);
});
