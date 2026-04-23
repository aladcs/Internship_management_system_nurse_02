import bcrypt from "bcryptjs";
import { randomInt } from "node:crypto";

const LOWERCASE_CHARS = "abcdefghijkmnopqrstuvwxyz";
const UPPERCASE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const NUMBER_CHARS = "23456789";
const SYMBOL_CHARS = "!@#$%^&*";
const PASSWORD_ALPHABET =
  LOWERCASE_CHARS + UPPERCASE_CHARS + NUMBER_CHARS + SYMBOL_CHARS;

function randomChar(source: string) {
  return source[randomInt(0, source.length)];
}

function shuffleChars(chars: string[]) {
  for (let index = chars.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInt(0, index + 1);
    const current = chars[index];

    chars[index] = chars[swapIndex];
    chars[swapIndex] = current;
  }

  return chars;
}

export function generatePassword(length = 12) {
  const targetLength = Math.max(length, 8);
  const chars = [
    randomChar(LOWERCASE_CHARS),
    randomChar(UPPERCASE_CHARS),
    randomChar(NUMBER_CHARS),
    randomChar(SYMBOL_CHARS),
  ];

  while (chars.length < targetLength) {
    chars.push(randomChar(PASSWORD_ALPHABET));
  }

  return shuffleChars(chars).join("");
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  passwordHash: string,
) {
  if (!password || !passwordHash) {
    return false;
  }

  return bcrypt.compare(password, passwordHash);
}