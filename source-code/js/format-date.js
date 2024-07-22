
import cookie from "js-cookie";
import { formatInTimeZone as dateFnsFormatInTimeZone } from "date-fns-tz";

const formatDate = (date: string | number | Date): string => {
  let formatDate = new Date(date);
  let year = formatDate.getFullYear();
  let month =
    formatDate.getMonth() > 8
      ? formatDate.getMonth() + 1
      : `0${formatDate.getMonth() + 1}`;
  let day =
    formatDate.getDate() > 9
      ? formatDate.getDate()
      : `0${formatDate.getDate()}`;
  let formattedDate = `${month}/${day}/${year}`;
  return formattedDate;
};

const getformatDateTime = (dateTime: string): string => {
  const formatList: { [key: string]: string[] } = {
    defaultValue: ["AM", "PM"],
    "ko-KO": ["오전", "오후"],
    "zh-CN": ["上午", "下午"],
    "zh-TW": ["上午", "下午"],
  };
  const locale = cookie.get("_zm_lang");
  let separator: string[];
  if (locale !== "ko-KO" && locale !== "zh-CN" && locale !== "zh-TW") {
    separator = formatList["defaultValue"];
  } else {
    separator = formatList[locale];
  }
  if (dateTime.match(separator[0])) {
    return dateTime.split(separator[0])[0] + separator[0];
  } else if (dateTime.match(separator[1])) {
    return dateTime.split(separator[1])[0] + separator[1];
  }
  return dateTime.substring(0, dateTime.indexOf(":") + 3);
};

const getformatDate = (dateTime: string): string | undefined => {
  let formatDateTime = getformatDateTime(dateTime);
  let DelimiterIndex = formatDateTime.indexOf(":");
  if (DelimiterIndex > 2) {
    return formatDateTime.slice(0, DelimiterIndex - 2);
  }
};

const formatSecondsToMinute = (seconds: number): string | number => {
  return seconds
    ? `${Math.floor(seconds / 60)}:${padTo2Digits(Math.round(seconds % 60))}`
    : 0;
};

function padTo2Digits(number: number): string {
  return number.toString().padStart(2, "0");
}

const convertSecondsToReadableTime = (seconds: number = 0): string => {
  const hoursUnit = "h";
  const minutesUnit = "m";
  const secondsUnit = "s";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds - hours * 3600) / 60);
  const restSeconds = Math.floor(seconds - hours * 3600 - minutes * 60);
  if (seconds === 0) {
    return "0m";
  }
  return `${hours > 0 ? `${hours}${hoursUnit}` : ""} ${
    minutes > 0 ? `${minutes}${minutesUnit}` : ""
  } ${restSeconds > 0 ? `${restSeconds}${secondsUnit}` : ""}`;
};

const convertSecondsToLongReadableTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds - hours * 3600) / 60);
  const restSeconds = Math.floor(seconds - hours * 3600 - minutes * 60);
  if (hours === 0 && minutes === 0) {
    return `${restSeconds} sec`;
  }
  return `${hours > 0 ? `${hours}h` : ""} ${
    minutes > 0 ? `${minutes} min` : ""
  } ${restSeconds > 0 ? `${restSeconds} dec` : ""}`;
};

const secToTimeString = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds - hours * 3600) / 60);
  if (hours === 0 && minutes === 0) {
    return " <1 min";
  }
  return `${hours > 0 ? `${hours}h` : ""} ${
    minutes > 0 ? `${minutes} min` : ""
  }`;
};

const isValidDate = (dateString: string): boolean => {
  var dateObject = new Date(dateString);
  var milliseconds = dateObject.getTime();
  if (isNaN(milliseconds)) {
    return false;
  }
  return true;
};

const isValidTimeZone = (tz: string): boolean => {
  try {
    if (!Intl || !Intl.DateTimeFormat().resolvedOptions().timeZone) {
      return false;
    }

    if (typeof tz !== "string") {
      return false;
    }

    // throws an error if timezone is not valid
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return true;
  } catch (error) {
    return false;
  }
};

const formatInTimeZone = (data: Date | number, f: string): string => {
  let tz =
    (window as any).__kiwi__.timeZone ||
    Intl?.DateTimeFormat()?.resolvedOptions()?.timeZone;
  if (!isValidTimeZone(tz)) {
    tz = "America/Los_Angeles";
  }
  return dateFnsFormatInTimeZone(data, tz, f);
};

export {
  formatDate,
  getformatDateTime,
  getformatDate,
  formatSecondsToMinute,
  convertSecondsToReadableTime,
  convertSecondsToLongReadableTime,
  secToTimeString,
  formatInTimeZone,
  padTo2Digits,
  isValidDate,
};
