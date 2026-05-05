import { createHash, randomBytes } from "node:crypto";

export function createPkceCodeVerifier() {
  return randomBytes(64).toString("base64url");
}

export function createPkceCodeChallenge(codeVerifier: string) {
  return createHash("sha256").update(codeVerifier).digest("base64url");
}
