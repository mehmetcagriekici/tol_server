//imports
import express from "express";
import { register, login } from "@src/controllers/auth.controller";
import { authenticate, AuthRequest } from "@src/middleware/authMiddleware";
import { attachDbClient } from "@src/middleware/attachDbClientMiddleware";

const router = express.Router();

//public routes
router.post("/register", register);
router.post("/login", login);

//protected routes (only accessible with a valid JWT)
router.get("/me", authenticate, attachDbClient, (req, res) => {
  res.json({
    message: "You are authenticated",
    user: (req as AuthRequest).user,
  });
});

export default router;
