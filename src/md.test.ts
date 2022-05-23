import { test, expect } from "vitest";

import { parseMd } from "./md";

test("parseMd", async () => {
  const parsedMd = await parseMd(`${__dirname}/../data/second.md`);
  expect(parsedMd).toEqual({
    deckName: "Deck Name",
    cards: [
      {
        id: "67da3a0fe59f3b71b5a4f78d51cc67b1",
        front: "Question 1",
        back: "Answer 1",
      },
      {
        id: "c72ec3b33c89c5f55e77cc7e9408bd86",
        front: "Question 2",
        back: "Answer 2",
      },
    ],
  });
});
