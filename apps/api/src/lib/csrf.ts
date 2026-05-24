import { createHmac, timingSafeEqual } from "node:crypto";

export function createCsrfToken(tokenHash: string, secret: string): string {
  return createHmac("sha256", secret).update(tokenHash).digest("base64url");
}

export function verifyCsrfToken(tokenHash: string, secret: string, candidate: string | undefined): boolean {
  if (!candidate) {
    return false;
  }

  const expected = createCsrfToken(tokenHash, secret);
  const expectedBuffer = Buffer.from(expected);
  const candidateBuffer = Buffer.from(candidate);

  return expectedBuffer.length === candidateBuffer.length && timingSafeEqual(expectedBuffer, candidateBuffer);
}
