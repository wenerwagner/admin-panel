import { describe, expect, it } from "vitest";

import {
  formatSensitiveStudentFields,
  maskCpf,
  maskEmail,
  maskPhone,
  maskSensitiveStudentFields,
} from "../../src/utils/mask-pii.js";

describe("PII masking helpers", () => {
  it("masks email, CPF, and phone for list responses", () => {
    expect(maskEmail("ana@example.com")).toBe("a***@example.com");
    expect(maskCpf("52998224725")).toBe("***.982.247-**");
    expect(maskPhone("+5581999998888")).toBe("(**) *****-8888");
  });

  it("masks sensitive fields while preserving non-sensitive student fields", () => {
    expect(
      maskSensitiveStudentFields({
        id: "student-id",
        name: "Ana Silva",
        email: "ana@example.com",
        cpf: "52998224725",
        phone: "+5581999998888",
        subscribedPlan: "basic",
      }),
    ).toEqual({
      id: "student-id",
      name: "Ana Silva",
      email: "a***@example.com",
      cpf: "***.982.247-**",
      phone: "(**) *****-8888",
      subscribedPlan: "basic",
    });
  });

  it("formats sensitive fields for detail responses", () => {
    expect(
      formatSensitiveStudentFields({
        email: "ana@example.com",
        cpf: "52998224725",
        phone: "+5581999998888",
      }),
    ).toEqual({
      email: "ana@example.com",
      cpf: "529.982.247-25",
      phone: "+55 81 99999 8888",
    });
  });
});
