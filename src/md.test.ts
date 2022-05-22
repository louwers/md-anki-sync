import exp from 'constants';
import {test, expect} from 'vitest';

import {addMissingIds,getQuestionId, addQuestionId, parseMd} from './md'

// test('addMissingIds', async () => {
//   await addMissingIds(`${__dirname}/../data/first.md`);
// })

// test('getQuestionId', () => {
//   expect(getQuestionId('## Hello world <!-- id:someid -->')).toEqual('someid');
//   expect(getQuestionId('## Hello world')).toEqual(null);
// });

// test('addQuestionId', () => {
//   const lineWithQuestionId = addQuestionId('## Hello world');
//   expect(lineWithQuestionId.startsWith('## Hello world <!-- id:')).toBe(true);
//   expect(lineWithQuestionId.endsWith('-->')).toBeTruthy();
// })

test('parseMd', async () => {
  const parsedMd = await parseMd(`${__dirname}/../data/second.md`);
  expect(parsedMd).toEqual({
    deckName: 'Deck Name',
    cards: [{
      id: '67da3a0fe59f3b71b5a4f78d51cc67b1',
      front: 'Question 1',
      back: 'Answer 1'
    }, {
      id: 'c72ec3b33c89c5f55e77cc7e9408bd86',
      front: 'Question 2',
      back: 'Answer 2'
    }]
  })
})