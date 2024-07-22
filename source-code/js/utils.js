
import { isEqual, sortBy } from "lodash-es";

export function pregQuote(str: string, delimiter?: string): string {
  return (str + "").replace(
    new RegExp(
      "[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\" + (delimiter || "") + "-]",
      "g"
    ),
    "\\$&"
  );
}

export function debounce<T extends (...args: any[]) => void>(func: T, delay: number): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;

  return function (...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

const padZero = (n: number): string => (n < 10 ? `0${n}` : n.toString());

export function escapeReg(str: string, delimiter?: string): string {
  return (str + "").replace(
    new RegExp(
      "[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\" + (delimiter || "") + "-]",
      "g"
    ),
    "\\$&"
  );
}

const DE_XSS_MAPPING: Record<string, string> = {
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&amp;": "&",
};

const DE_XSS_PATTERN = new RegExp(Object.keys(DE_XSS_MAPPING).join("|"), "g");

const XSS_MAPPING: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

const XSS_PATTERN = new RegExp(Object.keys(XSS_MAPPING).join("|"), "g");

export function xss(str: string): string | undefined {
  if (!str) return;
  return str.replace(XSS_PATTERN, (match) => XSS_MAPPING[match]);
}

export function deXss(str: string): string | undefined {
  if (!str) return;
  return str.replace(DE_XSS_PATTERN, (match) => DE_XSS_MAPPING[match]);
}

export function isPromise(value: any): value is Promise<any> {
  return (
    value !== undefined && value !== null && typeof value.then === "function"
  );
}

export function silencePromise(value: any): void {
  if (isPromise(value)) {
    value.then(null, () => {});
  }
}

export const toInt = (n: any): number => (n ? parseInt(n, 10) : 0);

export const convertSecondsToTime = (
  seconds: number,
  showHours = true,
  showMilliseconds = false
): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds - hours * 3600) / 60);
  const paddedMinutes = padZero(minutes);
  const paddedSeconds = padZero(Math.floor(seconds % 60));
  let timeStr = `${padZero(hours)}:${paddedMinutes}:${paddedSeconds}`;

  if (!showHours && hours === 0) {
    timeStr = `${paddedMinutes}:${paddedSeconds}`;
  }

  if (showMilliseconds) {
    const milliseconds = Math.floor((seconds - Math.floor(seconds)) * 1000);
    timeStr += `.${padZero(milliseconds)}`;
  }

  return timeStr;
};

export function convertTimeToSeconds(time = "00:00:00"): number {
  const [seconds = 0, minutes = 0, hours = 0] = time
    .trim()
    .split(":")
    .reverse()
    .map(toInt);

  return seconds + hours * 3600 + minutes * 60;
}

export function parseTime(timeStr: string): number {
  const [time, millisecond] = timeStr.split(".");
  return convertTimeToSeconds(time) * 1000 + toInt(millisecond);
}

export const formatAriaTime = (time: string | number | undefined): string | undefined => {
  if (time === undefined || time === null) {
    return;
  }
  if (typeof time === "number") {
    time = convertSecondsToTime(time);
  }
  const nums = time.trim().split(":").reverse();
  const seconds = toInt(nums[0]);
  const minutes = toInt(nums[1]);
  const hours = toInt(nums[2]);

  let formatted = "";
  if (hours > 0) {
    formatted += `${hours} hours `;
  }
  if (minutes > 0) {
    formatted += `${minutes} minutes `;
  }
  if (seconds > 0) {
    formatted += `${seconds} seconds`;
  }
  return formatted;
};

export function formatMillisecondsTime(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  // Convert total seconds to total minutes
  const totalMinutes = Math.floor(totalSeconds / 60);
  // Convert total minutes to total hours
  const totalHours = Math.floor(totalMinutes / 60);

  // Calculate hours, minutes, and seconds
  const hours = padZero(totalHours % 24);
  const minutes = padZero(totalMinutes % 60);
  const seconds = padZero(totalSeconds % 60);

  // Format time as "HH:mm:ss" or "mm:ss" or "ss"
  let time = "00:1";
  if (hours > 0) {
    time = `${hours}:${minutes}:${seconds}`;
  } else if (minutes > 0) {
    time = `${minutes}:${seconds}`;
  } else if (seconds > 0) {
    time = `00:${seconds}`;
  }

  return time;
}

export const userAgent = navigator.userAgent.toLowerCase();
export const isWin = /windows/.test(userAgent);
export const isIPad = /ipad/.test(userAgent);
export const isIPhone = !isIPad && /(iphone|ipod)/.test(userAgent);
export const isMac = !isIPad && !isIPhone && /macintosh/.test(userAgent);

export function copyTextToClipboard(text: string, noReplace?: boolean): void {
  const el = document.createElement("textarea");
  el.value = noReplace ? text : text.replace("/client", "");
  document.body.appendChild(el);
  el.select();
  document.execCommand("copy");
  document.body.removeChild(el);
}

/**
 * Transform number to price, like 2000 -> 2,000
 *
 * @param {Number} number
 * @return {String} price
 */
export function formatCurrency(amount) {
  if (isNaN(Number(amount))) return amount;
  const [integerPart, decimalPart] = String(amount).split(".");
  return `${Number(integerPart).toLocaleString()}${
    decimalPart ? `.${decimalPart}` : ""
  }`;
}

// not change type of number, and not auto add '0' such as '0.1' -> '0.10'
export function roundToDecimalPlaces(number: number, decimalPlaces = 0): number {
  let roundedNumber = parseFloat(number.toString());
  if (isNaN(roundedNumber)) {
    return 0;
  }
  const multiplier = Math.pow(10, decimalPlaces);
  roundedNumber = Math.round(number * multiplier) / multiplier;
  return roundedNumber;
}

export function isArrayLooseEquals(a: any[], b: any[]): boolean {
  return isEqual(sortBy(a), sortBy(b));
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function byteToSize(bytes: number): string {
  if (bytes === 0) return "0 KB";

  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  let sizeIndex = Math.floor(Math.log(bytes) / Math.log(1024));
  if (sizeIndex < 0) sizeIndex = 0;
  if (sizeIndex >= sizes.length) sizeIndex = sizes.length - 1;

  return `${(bytes / 1024 ** sizeIndex).toFixed(1)} ${sizes[sizeIndex]}`;
}

export function downloadCsvContent(filename: string, content: string | Blob): void {
  const downloadFilename = (filename || "sample").replace(
    /(\.csv|\b)$/,
    ".csv"
  );
  const element = document.createElement("a");
  const url =
    content instanceof Blob
      ? URL.createObjectURL(content)
      : URL.createObjectURL(
          new Blob(["\uFEFF" + content], { type: "text/plain;charset=utf-8" })
        );
  element.setAttribute("href", url);
  element.setAttribute("download", downloadFilename);
  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
  URL.revokeObjectURL(url);
}

export function downloadServerFile(url = "", filename = ""): void {
  fetch(url, {
    headers: new Headers({
      Origin: location.origin,
    }),
    mode: "cors",
  })
    .then((res) => {
      if (res.status == 200) {
        return res.blob();
      }
      throw new Error(`download error`);
    })
    .then((blob) => {
      downloadCsvContent(filename, blob);
    });
}

export function maskEmail(email = ""): string {
  if (!email.length || typeof email !== "string") return "";
  const [host = "", domain = ""] = email.split("@");
  const username =
    host.substring(0, 3) + "***" + host.substring(host.length - 3);
  const maskedDomain =
    domain.substring(0, 3) + "***" + domain.substring(domain.length - 3);
  return username + "@" + maskedDomain;
}

export function maskPhone(phone = ""): string {
  // first, trim any whitespace
  phone = phone.trim();
  let realPhone = phone;
  let code = "";
  // check if the phone number contains a country code
  if (phone.indexOf(" ") !== -1) {
    const phoneArr = phone.split(" ");
    realPhone = phoneArr[1];
    code = phoneArr[0];
  }
  if (realPhone.length === 0) {
    return "";
  }
  // mask the phone number
  return (
    code + " " + realPhone.substring(0, 3) + "*****" + realPhone.substring(8)
  );
}

export function uniqueFunc<T>(arr: T[], uniId: keyof T): T[] {
  const seenIds = new Set();
  return arr.filter((item) => {
    if (seenIds.has(item[uniId])) {
      return false;
    }
    seenIds.add(item[uniId]);
    return true;
  });
}

export function capitalizeWords(text: string): string {
  const words = text.split(" ");

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const firstChar = word.charAt(0);
    const restOfWord = word.slice(1);

    words[i] = firstChar.toUpperCase() + restOfWord;
  }

  return words.join(" ");
}

// Measuring the number of characters difference(insert/delete/update) between two strings
export function levenshteinDistance(str1: string, str2: string): number {
  if (!str1.length) return str2.length;
  if (!str2.length) return str1.length;
  const matrix: number[][] = [];
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
    for (let j = 1; j <= str1.length; j++) {
      matrix[i][j] =
        i === 0
          ? j
          : Math.min(
              matrix[i - 1][j] + 1,
              matrix[i][j - 1] + 1,
              matrix[i - 1][j - 1] + (str1[j - 1] === str2[i - 1] ? 0 : 1)
            );
    }
  }
  return matrix[str2.length][str1.length];
}
