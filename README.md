# Markdown ➡️ Anki Sync

> **Warning**
> This should be considered a quickly-hacked together 'proof of concept'. Not really ready to be used yet.

## Getting Started

Using this script, you can sync Markdown files with Anki.

For example, running the script on the following Markdown file:

```md
# Deck: Geography

## What is the capital of Finland?

Helsinki
```

Would result in a deck 'My Deck' being created. You will also notice that an identifier will get added to each question:

```md
# Deck: Geography

## What is the capital of Finland?  <!-- id:67da3a0fe59f3b71b5a4f78d51cc67b1 -->

Helsinki
```

You can update this question later, or delete it, in which case it will also be deleted from the deck. You can even change the deck and the card will be moved there!

### Subdecks

You can create [subdecks](https://docs.ankiweb.net/deck-options.html#subdecks) by creating subheadings:

```md
# Deck: Geography

## Deck: Europe

## What is the capital of Finland?

Helsinki
```

In this case, the question will go in the 'Geography::Europe' deck.

### Multi-line Questions

Questions can contain multiple lines. This way you can include images, code snippets, paragraphs of text or even subsections inside your question. When one of the subsequent subsections after your question is exactly the text 'Answer', like below, your question will be interpreted as consisting of multiple lines.

```md
# Deck: Celebrities

## Banksy

Banksy is a pseudonymous England-based street artist, political activist and film director whose real name and identity remain unconfirmed and the subject of speculation.

**Which UK city is Banksy from?**

### Answer

Bristol
```

When you have a question whose first heading is `Question`, the header is excluded from the question.

## Installation

Install [Anki Connect](https://foosoft.net/projects/anki-connect/). Run Anki before starting the script.

Not available on npm yet. Clone this repository. Then:

```
npm run build
npm install -g .
npx md-anki-sync filename.md
```

## Links

- Anki Docs: https://docs.ankiweb.net/

### Similar tools

- Python tool: https://github.com/lukesmurray/markdown-anki-decks
