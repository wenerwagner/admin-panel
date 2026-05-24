import { describe, expect, it } from "vitest";

import { formatCpf, isValidCpf, normalizeCpf } from "../../src/utils/cpf.js";

describe("CPF helpers", () => {
  it("normalizes formatted CPF values to digits only", () => {
    expect(normalizeCpf("529.982.247-25")).toBe("52998224725");
  });

  it("validates CPF check digits", () => {
    expect(isValidCpf("529.982.247-25")).toBe(true);
    expect(isValidCpf("529.982.247-26")).toBe(false);
  });

  it("rejects repeated-digit CPF values", () => {
    expect(isValidCpf("000.000.000-00")).toBe(false);
    expect(isValidCpf("11111111111")).toBe(false);
  });

  it("formats normalized CPF values for detail responses", () => {
    expect(formatCpf("52998224725")).toBe("529.982.247-25");
  });
});
