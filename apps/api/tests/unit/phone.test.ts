import { describe, expect, it } from "vitest";

import { formatPhone, normalizePhone } from "../../src/utils/phone.js";

describe("phone helpers", () => {
  it("normalizes Brazilian phone input to E.164 format", () => {
    expect(normalizePhone("(81) 99999-8888")).toBe("+5581999998888");
    expect(normalizePhone("+55 81 99999-8888")).toBe("+5581999998888");
  });

  it("rejects invalid or non-Brazilian phone input", () => {
    expect(normalizePhone("123")).toBeUndefined();
    expect(normalizePhone("+1 212 555 0100")).toBeUndefined();
  });

  it("formats valid phone values for detail responses", () => {
    expect(formatPhone("+5581999998888")).toBe("+55 81 99999 8888");
  });
});
