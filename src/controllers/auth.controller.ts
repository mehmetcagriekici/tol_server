//imports
import { Request, Response } from "express";
import { registerUser, loginUser } from "@src/services/auth.service";

/**
 * handles user registration
 */
export const register = async (req: Request, res: Response) => {
  try {
    //extract user info
    const { email, username, password } = req.body;

    //validate required fields
    if (!email || !password || !username) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    //hash and store the user and generate a token
    const data = await registerUser(email, username, password);

    //set the cookie
    res.cookie("token", data.token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false, // true in production
      path: "/",
    });

    //return user info (excluding the password)
    res.status(201).json({ message: "User registered successfully", ...data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Handles user login
 */
export const login = async (req: Request, res: Response) => {
  try {
    //extract email and password from the request body
    const { email, password } = req.body;

    //validate required fileds
    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    //check credentials and generate a JWT token
    const data = await loginUser(email, password);

    //set the cookie
    res.cookie("token", data.token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false, // true in production
      path: "/",
    });
    //return user
    res.json({ message: "Login successful", ...data });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};
