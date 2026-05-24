import argon2 from "argon2";

const argon2Options: argon2.Options & { raw?: false } = {
  type: argon2.argon2id,
};

export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, argon2Options);
}

export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  return argon2.verify(hash, password);
}
