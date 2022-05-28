import * as readline from "node:readline";
import * as fs from "node:fs/promises";
import { temporaryFile } from "tempy";

function addIdToLine(line: string, id: string) {
  return `${line} <!-- id:${id} -->`;
}

export function newIdListToRecord(
  newIds: { id: string; ln: number }[]
): Record<number, string> {
  const result: Record<number, string> = {};
  for (const { id, ln } of newIds) {
    result[ln] = id;
  }
  return result;
}

export async function createNewFileWithNewIds(
  fileName: string,
  newIds: Record<number, string>
) {
  const tempFile = temporaryFile();

  const fdIn = await fs.open(fileName, "r");
  const fileStream = fdIn.createReadStream();

  const fdOut = await fs.open(tempFile, "w");
  const outStream = fdOut.createWriteStream();

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let ln = 0;
  let started = false; // make sure we don't put a newline after EOF

  for await (const line of rl) {
    ++ln;

    if (started) {
      outStream.write("\n");
    }
    started = true;

    if (ln in newIds) {
      outStream.write(addIdToLine(line, newIds[ln]));
    } else {
      outStream.write(line);
    }
  }

  await Promise.all([fdIn.close(), fdOut.close()]);
  return tempFile;
}

export async function addNewIdsToFile(...[fileName, newIds]: Parameters<typeof createNewFileWithNewIds>) {
  if (Object.keys(newIds).length === 0) return; // no need to add any new ids
  const newFile = await createNewFileWithNewIds(fileName, newIds);
  console.log(newFile);
  await fs.copyFile(newFile, fileName);
}
