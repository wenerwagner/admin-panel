import type { NextFunction, Request, Response } from "express";

import { RateLimitedError } from "../errors/index.js";

const loginWindowMs = 15 * 60 * 1000;
const maxLoginAttempts = 5;

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

export function loginRateLimit(request: Request, _response: Response, next: NextFunction): void {
  const now = Date.now();
  const keys = loginRateLimitKeys(request);

  if (keys.some((key) => isLimited(key, now))) {
    next(new RateLimitedError());
    return;
  }

  for (const key of keys) {
    increment(key, now);
  }

  next();
}

export function resetLoginRateLimitStore(): void {
  buckets.clear();
}

function loginRateLimitKeys(request: Request): string[] {
  return [`ip:${clientIp(request)}`, `email:${normalizedLoginEmail(request)}`];
}

function clientIp(request: Request): string {
  return request.ip || request.socket.remoteAddress || "unknown";
}

function normalizedLoginEmail(request: Request): string {
  const body = request.body as unknown;

  if (!body || typeof body !== "object" || !("email" in body)) {
    return "unknown";
  }

  const email = (body as { email?: unknown }).email;
  return typeof email === "string" ? email.trim().toLowerCase() || "unknown" : "unknown";
}

function isLimited(key: string, now: number): boolean {
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    return false;
  }

  return bucket.count >= maxLoginAttempts;
}

function increment(key: string, now: number): void {
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, {
      count: 1,
      resetAt: now + loginWindowMs,
    });
    return;
  }

  bucket.count += 1;
}
