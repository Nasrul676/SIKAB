// lib/password.ts
import bcrypt from 'bcrypt';

const saltRounds = 10; // Adjust cost factor as needed (higher is slower but more secure)

/**
 * Hashes a plain text password.
 * @param plaintextPassword The password to hash.
 * @returns A promise that resolves with the hashed password.
 */
export async function hashPassword(plaintextPassword: string): Promise<string> {
  try {
    const hashedPassword = await bcrypt.hash(plaintextPassword, saltRounds);
    return hashedPassword;
  } catch (error) {
    console.error('Error hashing password:', error);
    throw new Error('Could not hash password.'); // Or handle more gracefully
  }
}

/**
 * Compares a plain text password with a stored hash.
 * @param plaintextPassword The password entered by the user.
 * @param storedHash The hashed password from the database.
 * @returns A promise that resolves with true if passwords match, false otherwise.
 */
export async function verifyPassword(plaintextPassword: string, storedHash: string): Promise<boolean> {
  try {
    const match = await bcrypt.compare(plaintextPassword, storedHash);
    return match;
  } catch (error) {
    console.error('Error verifying password:', error);
    // In case of error, treat as non-match for security
    return false;
  }
}
