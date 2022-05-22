import * as readline from 'node:readline';
import * as fs from 'node:fs/promises';
import * as crypto from 'node:crypto';
import {temporaryFile} from 'tempy';

export function isQuestion(line: string) {
  return line.startsWith('## ');
}

const ID_REGEX = /<!-- id:(\w+) -->/

export function getQuestion(line: string) {
  return line.replace(ID_REGEX, '');
}

export function getQuestionId(line: string) {
  const matches = line.match(ID_REGEX);
  return matches?.length == 2 ? matches[1] : null;
}

export function addQuestionId(line: string) {
  const id = crypto.randomBytes(16).toString('hex');
  return `${line} <!-- id:${id} -->`;
}

export async function addMissingIds(fileName: string) {
  const fdIn = await fs.open(fileName, 'r');
  const fileStream = fdIn.createReadStream();
  
  const tempFile = temporaryFile();
  const fdOut = await fs.open(tempFile, 'w');
  const outStream = fdOut.createWriteStream();

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    if (isQuestion(line) && !getQuestionId(line)) {
      outStream.write(addQuestionId(line));
    } else {
      outStream.write(line);
    }
    outStream.write('\n');
  }

  await Promise.all([fdIn.close(), fdOut.close()]);

  await fs.copyFile(tempFile, fileName);
}

function isDeckName(line: string) {
  return line.startsWith('# ');
}


export async function parseMd(fileName: string) {
  const fdIn = await fs.open(fileName, 'r');
  const fileStream = fdIn.createReadStream();
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let deckName = '';

  let question = '';
  let answer = '';
  let id = '';

  const cards: {front: string, back: string, id: string}[] = [];

  function reset() {
    question = '';
    answer = '';
    id = '';
  }

  function finishCard() {
    if (!question || !answer || !id) {
      reset();
      return;
    }
    cards.push({front: question.trim(), back: answer.trim(), id});
    reset();
  }

  for await (const line of rl) {
    if (isDeckName(line)) {
      if (deckName) throw new Error("Can only have one deck name.");
      deckName = line.slice(2);
      continue;
    }

    if (isQuestion(line)) {
      finishCard();
      question = getQuestion(line);
      const questionId = getQuestionId(line);
      if (!questionId) throw new Error(`Found question without id: ${question}`);
      id = questionId;
      continue;
    }

    if (question) {
      answer += line;
      answer += '\n';
    }
  }
  finishCard();
  return {
    deckName,
    cards
  };
}