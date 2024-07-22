
const ua: string = navigator.userAgent.toLowerCase();

export const isEdge: boolean = /edge\/(\d+)/.test(ua);
export const isIELower: boolean =
  ua.indexOf("compatible") > -1 && ua.indexOf("msie") > -1;
export const isIE11: boolean = ua.indexOf("trident") > -1 && ua.indexOf("rv:11.0") > -1;
export const isIpadOS: boolean = ua.includes("mac") && "ontouchend" in document;
