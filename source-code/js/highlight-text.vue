<template>
<!-- eslint-disable-next-line vue/no-v-html -->
<span v-html="genHTML" />
</template>
    <script lang="ts">
import { defineComponent, computed, PropType } from "vue";
import { pregQuote } from "./utils";
import { simpleXss } from "shared/js/escape";
import { chunk } from "lodash-es";

export default defineComponent({
  name: "HighlightText",
  props: {
    content: {
      type: String,
      required: true,
    },
    highlight: {
      type: [String, RegExp, Array] as PropType<string | RegExp | Array<any>>,
      default: "",
    },
    highlightClass: {
      type: String,
      default: "highlight",
    },
    antiXss: {
      type: Boolean,
      default: true,
    },
    caseSensitive: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const genHTML = computed(() => {
      const { antiXss, content, highlight, highlightClass, caseSensitive } = props;
      if (!content) {
        return "";
      }

      const isString = typeof highlight === "string";
      const isRegExp = highlight instanceof RegExp;
      const isArray = Array.isArray(highlight);
      if (isArray) {
        const highlightTagLength = 29; // length of '<span class="matches"></span>';
        const spanList = highlight.sort((spanA, spanB) => spanA - spanB);
        const returnContentHTML = chunk(spanList, 2).reduce(
          (transcript, span, index) => {
            let newTranscriptRenderHTML = transcript;
            const [start, end] = span;
            if (start == 0 && end == -1) {
              return `<span class="matches">${transcript}</span>`;
            }
            let startTextIndex = start + index * highlightTagLength;
            let endTextIndex = end + index * highlightTagLength;
            const foundMatchText = transcript.slice(
              startTextIndex,
              endTextIndex
            );
            const startText = transcript.substr(0, startTextIndex);
            const endText = transcript.substr(endTextIndex);
            newTranscriptRenderHTML =
              startText +
              `<span class="matches">${foundMatchText}</span>` +
              endText;
            return newTranscriptRenderHTML;
          },
          simpleXss(content)
        );
        return returnContentHTML;
      }
      if (isString || isRegExp) {
        let reg;

        if (isString) {
          if (highlight.trim() === "") {
            return antiXss ? simpleXss(content) : content;
          }
          reg = new RegExp(
            `${pregQuote(highlight)}`,
            caseSensitive ? "g" : "gi"
          );
        } else {
          reg = highlight;
        }

        if (!antiXss) {
          const regTag = /<\s*[^>]*>(.*?)<\s*\/[^>]*\s*>|<\s*[^>]*\/>/gi;
          let tagNode: string[] = [];
          let index = 0;
          return content
            .replace(regTag, (match) => {
              tagNode.push(match);
              return "☃☃";
            })
            .replace(reg, (matches) => {
              return `<span class="${highlightClass}">${matches}</span>`;
            })
            .replace(/☃☃/g, () => {
              return tagNode[index++];
            });
        } else {
          const s: string[] = [];
          let contentByHTML = simpleXss(
            content.replace(reg, (matches) => {
              const mark = `☃☃${matches}☃☃`;
              s.push(mark);
              return mark;
            })
          );
          for (let i = 0; i < s.length; i++) {
            contentByHTML = contentByHTML.replace(
              simpleXss(s[i]),
              (matches) => {
                return `<span class="${highlightClass}">${matches.substring(
                  2,
                  matches.length - 2
                )}</span>`;
              }
            );
          }
          return contentByHTML;
        }
      }

      return content;
    });

    return {
      genHTML,
    };
  },
});
</script>
    