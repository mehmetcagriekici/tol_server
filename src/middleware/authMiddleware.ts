//imports
import { Request, Response, NextFunction } from "express";
import { verifyToken } from "@src/utils/jwt";
import { JwtPayload } from "jsonwebtoken";

//extend Request interface with user
export interface AuthRequest extends Request {
  user?: { userId: string };
}

/**
 * Middleware to authenticate requests using JWT.
 */
export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "Access denied. No token provided" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyToken(token) as JwtPayload;
    req.user = { userId: decoded.userId };
    next();
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};
