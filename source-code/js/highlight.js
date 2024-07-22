
export function getHighlightContent({ text = "", span = [], utterance = "" }: { text?: string; span?: number[]; utterance?: string }): string {
  // todo confirm this logic with backend later
  // when sometime utterance is null ?
  // when span is null ?
  // todo refactor this function later and replace zm-highlight with this function
  const content = utterance || text;
  if (!content) {
    return "";
  }
  if (span.length === 2 && (span[0] === -1 || span[1] === -1)) {
    // when span is [0, -1] highlight all
    return content;
  }
  try {
    // // indicator span maybe [0, 6, 17, 23]
    // const highlightKeywords = chunk(span, 2).reduce((acc, curr) => {
    //   let [start, end] = curr.slice();
    //   if (end === -1) {
    //     return [String.raw`${content}`];
    //   }
    //   if (start > end) {
    //     [start, end] = [end, start];
    //   }
    //   const basic = content.slice(start, end);
    //   if (content.match(RegExp(basic, "gi")).length > 1) {
    //     // content: "this is isaac's logic",  we want to highlight  'is'
    //     return [...acc, "\\b" + String.raw`${basic}` + "\\b"];
    //   } else {
    //     return [...acc, String.raw`${basic}`];
    //   }
    // }, []);
    // const regexFromMyArray = new RegExp(highlightKeywords.join("|"), "gi");
    // return regexFromMyArray;
    return span;
  } catch (error) {
    // illegal regex, such as "+123567789" phone number or "aa***bb" password
    if (span.length === 2) {
      return content.slice(span[0], span[1]);
    }
    return content;
  }
}
