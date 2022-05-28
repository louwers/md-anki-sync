import hljs from "highlight.js";
import { marked } from "@louwers/marked";
import { MarkdownCard, RenderedCard } from "./process";

export function renderCard(unrenderedCard: MarkdownCard): RenderedCard {
  const options: Parameters<typeof marked.parser>[1] = {
    highlight(code, lang) {
      console.log('lang', lang);
      console.log('code', code);
      if (lang && hljs.getLanguage(lang)) {
        try {
          const highlightedCode = hljs.highlight(code, { language: lang }).value;
          console.log('highlightedCode', highlightedCode);
          return highlightedCode;
        } catch (__) {}
      }

      return ""; // use external default escaping
    },
  };
  return {
    ...unrenderedCard,
    question: marked.parser(unrenderedCard.question, options),
    answer: marked.parser(unrenderedCard.answer, options),
  };
}

export function renderCards(unrenderedCards: MarkdownCard[]): RenderedCard[] {
  return unrenderedCards.map(renderCard);
}