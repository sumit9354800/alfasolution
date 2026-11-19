
import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
  randomInt,
} from "node:crypto";

const CHARACTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const CAPTCHA_EXPIRY = 5 * 60 * 1000;

function getEncryptionKey() {
  const secret = process.env.CAPTCHA_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("CAPTCHA_SECRET must be at least 32 characters.");
  }

  return createHash("sha256").update(secret).digest();
}

export function generateCaptchaCode() {
  return Array.from(
    { length: 5 },
    () => CHARACTERS[randomInt(CHARACTERS.length)]
  ).join("");
}

export function createCaptchaToken(answer: string) {
  const payload = JSON.stringify({
    answer,
    expiresAt: Date.now() + CAPTCHA_EXPIRY,
  });

  const iv = randomBytes(12);

  const cipher = createCipheriv(
    "aes-256-gcm",
    getEncryptionKey(),
    iv
  );

  const encrypted = Buffer.concat([
    cipher.update(payload, "utf8"),
    cipher.final(),
  ]);

  const tag = cipher.getAuthTag();

  return [
    iv.toString("base64url"),
    tag.toString("base64url"),
    encrypted.toString("base64url"),
  ].join(".");
}

export function verifyCaptchaToken(
  token: string,
  answer: string
): boolean {
  try {
    const [ivPart, tagPart, encryptedPart] = token.split(".");

    if (!ivPart || !tagPart || !encryptedPart) {
      return false;
    }

    const decipher = createDecipheriv(
      "aes-256-gcm",
      getEncryptionKey(),
      Buffer.from(ivPart, "base64url")
    );

    decipher.setAuthTag(Buffer.from(tagPart, "base64url"));

    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encryptedPart, "base64url")),
      decipher.final(),
    ]);

    const payload = JSON.parse(decrypted.toString("utf8"));

    if (
      typeof payload.answer !== "string" ||
      typeof payload.expiresAt !== "number" ||
      payload.expiresAt < Date.now()
    ) {
      return false;
    }

    return payload.answer === answer.trim().toUpperCase();
  } catch {
    return false;
  }
}
