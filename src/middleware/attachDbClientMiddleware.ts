//imports
import { NextFunction } from "express";
import { AuthRequest } from "./authMiddleware";
import pool from "@src/config/db";

/**
 * Middleware to attach session variables
 */

export const attachDbClient = async (
  req: AuthRequest,
  res: NodeJS.EventEmitter,
  next: NextFunction
) => {
  //retrieve a dedicated database connection from the pool
  const client = await pool.connect();

  try {
    //Confirm that the user is authenticated
    if (req.user) {
      //set the session variables required by the RLS policies of the database
      await client.query(
        `
        SELECT set_config('myapp.user_id', $1, false)
        `,
        [req.user.userId]
      );

      await client.query(
        `
        SELECT set_config('myapp.user_email', $1, false)
        `,
        [req.user.email]
      );
    }

    //attach client to the request
    req.dbClient = client;

    next();
  } catch (error) {
    //if an error occurs during the session variable setup, the client is realased back to the pool to avaiod leaks
    client.release();
    next(error);
  }

  res.on("finish", () => {
    client.release();
  });
};
