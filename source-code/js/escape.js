
const DE_XSS_MAPPING: { [key: string]: string } = {
  "&lt;": "<",
  "&gt;": ">",
  "&amp;": "&",
};

const DE_XSS_PATTERN = new RegExp(Object.keys(DE_XSS_MAPPING).join("|"), "g");

const XSS_MAPPING: { [key: string]: string } = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
};

const XSS_PATTERN = new RegExp(Object.keys(XSS_MAPPING).join("|"), "g");

export function simpleXss(str: string): string | undefined {
  if (!str) return;
  return str.replace(XSS_PATTERN, (match) => XSS_MAPPING[match]);
}

export function simpleDeXss(str: string): string | undefined {
  if (!str) return;
  return str.replace(DE_XSS_PATTERN, (match) => DE_XSS_MAPPING[match]);
}
