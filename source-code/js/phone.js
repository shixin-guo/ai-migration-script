
import { PhoneNumberFormat, PhoneNumberUtil } from "google-libphonenumber";

export const PhoneDirectionType = {
  INBOUND: "inbound",
  OUTBOUND: "outbound",
} as const;

export const PhoneType = {
  Ext: 1,
  Main: 2,
} as const;

export function tryFormatPhoneNumber(phoneNumber: string): string {
  // todo remove this function don't try , only you know it is a phone number then format it
  const includeNumberReg = /\d/;
  if (includeNumberReg.test(phoneNumber)) {
    if (isPhoneNumber(phoneNumber)) {
      return formatPhoneNumber(phoneNumber, "US");
    }
  }
  return phoneNumber;
}

export function formatPhoneNumber(arg: string, state?: string[]): string {
  try {
    const phoneUtil = PhoneNumberUtil.getInstance();
    if (arg.length > 6) {
      const plus = arg.startsWith("+");
      const number = phoneUtil.parseAndKeepRawInput(plus ? arg : "+" + arg);
      if (!phoneUtil.isValidNumber(number)) {
        return arg;
      }
      const getIsoCode = phoneUtil.getRegionCodeForNumber(number);
      if (state && state.includes(getIsoCode)) {
        return phoneUtil.format(number, PhoneNumberFormat.NATIONAL);
      } else {
        return phoneUtil.format(number, PhoneNumberFormat.INTERNATIONAL);
      }
    } else {
      return arg;
    }
  } catch (err) {
    return arg;
  }
}

export function isPhoneNumber(phone: string, countryCode: string = ""): boolean {
  const phoneUtil = PhoneNumberUtil.getInstance();
  const number =
    (phone.indexOf("+") === 0 || countryCode.indexOf("+") === 0
      ? countryCode
      : "+" + countryCode) + phone;

  try {
    const phoneNumber = phoneUtil.parseAndKeepRawInput(number);
    return (
      phoneUtil.isValidNumber(phoneNumber) ||
      phoneUtil.isPossibleNumber(phoneNumber)
    );
  } catch (e) {
    return false;
  }
}

export function getPhoneRegion(phone: string, countryCode: string): string {
  const phoneUtil = PhoneNumberUtil.getInstance();
  const number =
    (countryCode.indexOf("+") === 0 ? countryCode : "+" + countryCode) + phone;
  try {
    const phoneNumber = phoneUtil.parseAndKeepRawInput(number);
    if (
      !(
        phoneUtil.isValidNumber(phoneNumber) ||
        phoneUtil.isPossibleNumber(phoneNumber)
      )
    ) {
      return "";
    }
    return phoneUtil.getRegionCodeForNumber(phoneNumber);
  } catch (e) {
    return "";
  }
}

export function maskPhone(phone: string): string {
  phone = phone.trim();
  let realPhone = phone;
  let code = "";
  if (phone.indexOf(" ") !== -1) {
    const phoneArr = phone.split(" ");
    realPhone = phoneArr[1];
    code = phoneArr[0];
  }
  if (realPhone.length === 0) {
    return "";
  }
  return (
    code + " " + realPhone.substring(0, 3) + "*****" + realPhone.substring(8)
  );
}
