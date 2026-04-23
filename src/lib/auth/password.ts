import bcrypt from "bcryptjs";

export async function verifyPassword(
  password: string,
  passwordHash: string,
) {
  if (!password || !passwordHash) {
    return false;
  }

  return bcrypt.compare(password, passwordHash);
}