//imports
import bcrypt from "bcryptjs";

//salt rounds from .env file or by default 10
//how many times bcrypt will process (or "salt") the password before hashing it.
const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10);

//Hashing passwords before storing them
/**
 * Hashes a plain text password before storing it in the database
 * @param password - The plain text password
 * @returns The hashed password
 */
export const hashPassword = async (password: string): Promise<string> =>
  await bcrypt.hash(password, saltRounds);

//Comparing hashed passwords during login
/**
 * Compares a plain text password with a hashed password
 * @param password - The plain text password
 * @param hash - The hashed password stored in the database
 * @returns True if the passwords mathes, false otherwise
 */
export const comparePassword = async (
  password: string,
  hash: string
): Promise<boolean> => await bcrypt.compare(password, hash);
