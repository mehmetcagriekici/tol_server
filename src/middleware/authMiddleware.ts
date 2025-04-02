//imports
import { Request, Response, NextFunction } from "express";
import { verifyToken } from "@src/utils/jwt";
import { JwtPayload } from "jsonwebtoken";
import { PoolClient } from "pg";

//extend Request interface with user
export interface AuthRequest extends Request {
  user?: { userId: string; email?: string };
  dbClient?: PoolClient;
}

/**
 * Middleware to authenticate requests using JWT.
 */
export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  let token: string | undefined;

  // Find the token (Authorization or cookies)
  const authHeader = req.header("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    res.status(401).json({ message: "Access denied. No token provided" });
    return;
  }

  try {
    const decoded = verifyToken("token") as JwtPayload;
    req.user = { userId: decoded.userId, email: decoded.email };
    next();
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};
