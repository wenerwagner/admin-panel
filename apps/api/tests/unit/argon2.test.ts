import { describe, expect, it } from "vitest";

import { hashPassword, verifyPassword } from "../../src/lib/argon2.js";

describe("argon2 password hashing", () => {
  it("hashes passwords without storing plaintext and verifies the original password", async () => {
    const password = "correct horse battery staple";

    const hash = await hashPassword(password);

    expect(hash).not.toBe(password);
    expect(hash).toContain("$argon2id$");
    await expect(verifyPassword(hash, password)).resolves.toBe(true);
    await expect(verifyPassword(hash, "wrong password")).resolves.toBe(false);
  });
});
