import { env } from "@/lib/env";
import { logger } from "@/lib/logger";

// Encryption utility for storing OAuth tokens at rest
export class TokenEncryption {
  private static readonly ALGORITHM = "AES-GCM";
  private static readonly KEY_LENGTH = 32; // 256 bits
  private static readonly IV_LENGTH = 12; // 96 bits
  private static readonly TAG_LENGTH = 16; // 128 bits

  private static getKey(): CryptoKey | null {
    if (!env.ENCRYPTION_KEY) {
      logger.warn("ENCRYPTION_KEY not configured, tokens will be stored in plain text");
      return null;
    }

    try {
      const keyBuffer = Buffer.from(env.ENCRYPTION_KEY, "base64");
      if (keyBuffer.length !== this.KEY_LENGTH) {
        throw new Error(`Invalid key length: expected ${this.KEY_LENGTH}, got ${keyBuffer.length}`);
      }
      
      return crypto.subtle.importKey(
        "raw",
        keyBuffer,
        { name: this.ALGORITHM },
        false,
        ["encrypt", "decrypt"]
      );
    } catch (error) {
      logger.error("Failed to import encryption key:", error);
      return null;
    }
  }

  static async encryptToken(plaintext: string): Promise<string> {
    const key = await this.getKey();
    if (!key) {
      // Return base64 encoded plaintext if encryption is not available
      return Buffer.from(plaintext).toString("base64");
    }

    try {
      const iv = crypto.getRandomValues(new Uint8Array(this.IV_LENGTH));
      const encodedText = new TextEncoder().encode(plaintext);
      
      const encrypted = await crypto.subtle.encrypt(
        {
          name: this.ALGORITHM,
          iv: iv,
          tagLength: this.TAG_LENGTH * 8,
        },
        key,
        encodedText
      );

      // Combine IV + encrypted data
      const combined = new Uint8Array(iv.length + encrypted.byteLength);
      combined.set(iv, 0);
      combined.set(new Uint8Array(encrypted), iv.length);

      return Buffer.from(combined).toString("base64");
    } catch (error) {
      logger.error("Failed to encrypt token:", error);
      throw new Error("Token encryption failed");
    }
  }

  static async decryptToken(encryptedData: string): Promise<string> {
    const key = await this.getKey();
    if (!key) {
      // Try to decode as base64 plaintext if encryption is not available
      try {
        return Buffer.from(encryptedData, "base64").toString("utf-8");
      } catch {
        throw new Error("Token decryption failed - invalid format");
      }
    }

    try {
      const combined = Buffer.from(encryptedData, "base64");
      const iv = combined.slice(0, this.IV_LENGTH);
      const encrypted = combined.slice(this.IV_LENGTH);

      const decrypted = await crypto.subtle.decrypt(
        {
          name: this.ALGORITHM,
          iv: iv,
          tagLength: this.TAG_LENGTH * 8,
        },
        key,
        encrypted
      );

      return new TextDecoder().decode(decrypted);
    } catch (error) {
      logger.error("Failed to decrypt token:", error);
      throw new Error("Token decryption failed");
    }
  }

  static generateEncryptionKey(): string {
    const key = crypto.getRandomValues(new Uint8Array(this.KEY_LENGTH));
    return Buffer.from(key).toString("base64");
  }
}

// Convenience functions
export const encryptToken = TokenEncryption.encryptToken;
export const decryptToken = TokenEncryption.decryptToken;
export const generateEncryptionKey = TokenEncryption.generateEncryptionKey;
