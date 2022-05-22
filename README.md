# Markdown ➡️ Anki Sync

> **Warning**
> This should be considered a quickly-hacked together 'proof of concept'. Not really ready to be used yet. 

This script allows you to sync Markdown files to Anki.

For example the following Markdown file:

````md
# Node.js Deck

## What events to all  implementations emit? How can you listen for events on implementations of `EventEmitter`?

- `'newListener'`
- `'removeListener'`

You can listen to an event using the `on` method as follows.

```js
myEmitter.on('event', () => {
  console.log('an event occurred!');
});
```
````

Will create a deck titled 'Node.js deck' with one card that contains the second heading as question and the body of the heading as answer.

The 'killer feature' of this script compared to the other scripts that I came across, is that an identifier will get added to every question:

```md
## What events to all  implementations emit? How can you listen for events on implementations of `EventEmitter`? <!-- id:67da3a0fe59f3b71b5a4f78d51cc67b1 -->
```

This allows the script to update any existing questions.

You can run it as follows.


```sh
$ npm run md-anki-sync -- filename.md
```

## Links

- Anki Docs: https://docs.ankiweb.net/
- Anki Connect: https://foosoft.net/projects/anki-connect/

### Similar tools

- Python tool: https://github.com/lukesmurray/markdown-anki-decks