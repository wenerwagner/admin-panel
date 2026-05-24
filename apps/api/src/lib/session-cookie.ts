import type { Request } from "express";

export type SessionCookieOptions = {
  name: string;
  secure: boolean;
};

export function sessionTokenFrom(request: Request, cookieName: string): string | undefined {
  const cookieHeader = request.get("cookie");

  if (!cookieHeader) {
    return undefined;
  }

  for (const cookie of cookieHeader.split(";")) {
    const [rawName, ...rawValueParts] = cookie.trim().split("=");

    if (rawName === cookieName) {
      const value = rawValueParts.join("=");

      if (!value) {
        return undefined;
      }

      try {
        return decodeURIComponent(value);
      } catch {
        return undefined;
      }
    }
  }

  return undefined;
}

export function sessionCookie(value: string, expiresAt: Date, options: SessionCookieOptions): string {
  const maxAgeSeconds = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000));
  return [
    `${options.name}=${encodeURIComponent(value)}`,
    "HttpOnly",
    `Max-Age=${maxAgeSeconds}`,
    `Expires=${expiresAt.toUTCString()}`,
    "Path=/",
    "SameSite=Lax",
    ...(options.secure ? ["Secure"] : []),
  ].join("; ");
}

export function clearSessionCookie(options: SessionCookieOptions): string {
  return [
    `${options.name}=`,
    "HttpOnly",
    "Max-Age=0",
    "Expires=Thu, 01 Jan 1970 00:00:00 GMT",
    "Path=/",
    "SameSite=Lax",
    ...(options.secure ? ["Secure"] : []),
  ].join("; ");
}
