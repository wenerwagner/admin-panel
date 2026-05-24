import { parsePhoneNumberFromString } from "libphonenumber-js";

export function normalizePhone(value: string): string | undefined {
  const phone = parsePhoneNumberFromString(value, "BR");

  if (!phone?.isValid() || phone.country !== "BR") {
    return undefined;
  }

  return phone.number;
}

export function formatPhone(value: string): string {
  const phone = parsePhoneNumberFromString(value, "BR");

  if (!phone?.isValid()) {
    return value;
  }

  return phone.formatInternational();
}
