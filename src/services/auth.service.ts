//imports
import pool from "@src/config/db";
import { hashPassword, comparePassword } from "@src/utils/password";
import { generateToken } from "@src/utils/jwt";

/**
 * Registers a new user in the database
 * @param email - User's email
 * @param username - User's username
 * @param password - User's password
 * @returns The registered user (excluding password)
 */
export const registerUser = async (
  email: string,
  username: string,
  password: string
) => {
  const hashedPassword = await hashPassword(password); //Hash password before storing

  const result = await pool.query(
    `
    INSERT INTO romans (email, username, password)
    VALUES ($1, $2, $3)
    RETURNING id, email, username`,
    [email, username, hashedPassword]
  );

  const user = result.rows[0];

  const token = generateToken(user.id);

  return {
    token,
    user: { id: user.id, email: user.email, username: user.username },
  }; //Return the user and the token
};

/**
 * Logs a user by verifying credentials and generating a JWT token
 * @param email -User's email
 * @param password - User's password
 * @returns the JWT token and user info
 */
export const loginUser = async (email: string, password: string) => {
  const result = await pool.query(`SELECT * FROM romans WHERE email = $1`, [
    email,
  ]);
  const user = result.rows[0];

  if (!user) throw new Error("Invalid credentials");

  const isMatch = await comparePassword(password, user.password);

  if (!isMatch) throw new Error("Invalid credentials");

  //Generate JWT
  const token = generateToken(user.id);

  return {
    token,
    user: { id: user.id, email: user.email, username: user.username },
  };
};
