//imports
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string;

//Generate tokens after login
/**
 * Generates a JWT token for a user
 * @param userId - The user's unique ID
 * @returns A signed JWT token
 */
export const generateToken = (userId: string): string =>
  jwt.sign({ userId }, JWT_SECRET, { expiresIn: "1h" });

//Verify JWT tokens and gives users acess protected routes
/**
 * Verifies a JWT token and returns decoded data
 * @param token - The JWT token to verify
 * @returns The decoded token payload
 * @throws If the token is invalid or expired
 */
export const verifyToken = (token: string) => jwt.verify(token, JWT_SECRET);
