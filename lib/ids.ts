import { nanoid } from "nanoid";

// Generate unique IDs
export const generateId = (): string => {
  return nanoid();
};

// Generate short IDs for public use
export const generateShortId = (): string => {
  return nanoid(8);
};

// Generate long IDs for internal use
export const generateLongId = (): string => {
  return nanoid(21);
};

// Generate IDs with custom length
export const generateCustomId = (length: number): string => {
  return nanoid(length);
};

// Generate IDs with custom alphabet
export const generateCustomAlphabetId = (alphabet: string, length: number): string => {
  return nanoid(length, alphabet);
};

// Re-export nanoid for direct use
export { nanoid };