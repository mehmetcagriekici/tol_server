//impots
import { Response, NextFunction } from "express";
import pool from "../config/db";
import { AuthRequest } from "./authMiddleware";
import { getUserRoles } from "@src/utils/getUserRoles";
import { convertRoleNamesToIds } from "@src/utils/convertRoleNamesToIds";
import { getUserPermissions } from "@src/utils/getUserPermissions";

/**
 * Middleware to check if the user has SELECT permission for the testaments table
 * @param req - request object, contains user id
 * @param res - middleware response object
 * @param next - next function, if everything is smooth, proceed to next middleware/controller
 */
export const canReadTestaments = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    //Step 1: Fetch user's main_role and sub_roles
    const roleResult = await getUserRoles(pool, userId);

    if (roleResult.rows.length === 0) {
      res.status(403).json({ error: "Forbidden: User not found" });
      return;
    }

    const { testament_role, acts_roles } = roleResult.rows[0];

    //Step 2: Convert role names to role IDs (because roles are stored as uuids in the database)
    const roleIdResult = await convertRoleNamesToIds(pool, [
      testament_role,
      ...Object.values(acts_roles),
    ]);

    if (roleIdResult.rows.length === 0) {
      res.status(403).json({ error: "Forbidden: Role IDs not found" });
      return;
    }

    const roleIds = roleIdResult.rows.map((row) => row.id);

    //Step 3: Query role_permissions to check if the user has SELECT permission for testaments
    const permissionResult = await getUserPermissions(
      pool,
      roleIds,
      "SELECT",
      "testaments"
    );

    if (permissionResult.rows.length === 0) {
      res.status(403).json({ error: "Forbidden: Insufficient permissions" });
      return;
    }

    next(); //User has SELECT permission for testaments, proceed with the next middleware/controller
  } catch (error) {
    res.status(500).json({ error });
  }
};

/**
 * Middleware to check if the user has INSERT permission for the testaments table
 * @param req - request object, contains userId
 * @param res - middleware response
 * @param next - next function
 */
export const canCreateTestament = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    //Step 1: Fetch user's testament_role and acts_roles (role name, not UUIDs)
    const roleResult = await getUserRoles(pool, userId);

    if (roleResult.rows.length === 0) {
      res.status(403).json({ error: "Forbidden: User not found" });
      return;
    }

    const { testament_role, acts_roles } = roleResult.rows[0];

    //Step 2: Convert role names to role IDs
    const roleIdResult = await convertRoleNamesToIds(pool, [
      testament_role,
      ...Object.values(acts_roles),
    ]);

    if (roleIdResult.rows.length === 0) {
      res.status(403).json({ error: "Forbidden: Role IDs not found" });
      return;
    }

    const roleIds = roleIdResult.rows.map((row) => row.id);

    //Step 3: Query role permissions to check if the user has INSERT permission for testaments
    const permissionResult = await getUserPermissions(
      pool,
      roleIds,
      "INSERT",
      "testaments"
    );

    if (permissionResult.rows.length === 0) {
      res.status(403).json({ error: "Forbidden: Insufficient permissions" });
      return;
    }

    next(); //User has INSERT permission for testaments -> Proceed to the next middleware/testament
  } catch (error) {
    res.status(500).json({ error });
  }
};

/**
 * Middleware to check if the user has UPDATE permission for the testaments table
 * @param req user request, contains user id
 * @param res middleware response
 * @param next next function
 */
export const canModifyTestament = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    //Step 1: Fetch user's main_role and sub_role (testaments_role and acts_role) (role names not uuids)
    const roleResult = await getUserRoles(pool, userId);

    if (roleResult.rows.length === 0) {
      res.status(403).json({ error: "Forbidden: User not found" });
      return;
    }

    const { testament_role, acts_roles } = roleResult.rows[0];

    //Step 2: Convert role names to role IDs
    const roleIdResult = await convertRoleNamesToIds(pool, [
      testament_role,
      ...Object.values(acts_roles),
    ]);

    if (roleIdResult.rows.length === 0) {
      res.status(403).json({ error: "Forbidden: Role IDs not found" });
      return;
    }

    const roleIds = roleIdResult.rows.map((row) => row.id);

    //Step 3: Query role_permssions to check if the user has UPDATE permission for testaments
    const permissionResult = await getUserPermissions(
      pool,
      roleIds,
      "UPDATE",
      "testaments"
    );

    if (permissionResult.rows.length === 0) {
      res.status(403).json({ error: "Forbidden: Insufficient permissions" });
      return;
    }
    next(); //User has UPDATE permission for testaments -> Proceed to the next middleware/testament
  } catch (error) {
    res.status(500).json({ error });
  }
};

/**
 * Middleware to check if the user has DELETE permission for the testaments table
 * @param req - request object, contains user id
 * @param res - middleware response object
 * @param next - next function, if everything is smooth, proceed to next middleware/controller
 */
export const canDeleteTestament = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    //Step 1: Fetch user's main_role and sub_role (testaments_role and acts_role) (role names not uuids)
    const roleResult = await getUserRoles(pool, userId);

    if (roleResult.rows.length === 0) {
      res.status(403).json({ error: "Forbidden: User not found" });
      return;
    }

    const { testament_role, acts_roles } = roleResult.rows[0];

    //Step 2: Convert role names to role IDs
    const roleIdResult = await convertRoleNamesToIds(pool, [
      testament_role,
      ...Object.values(acts_roles),
    ]);

    if (roleIdResult.rows.length === 0) {
      res.status(403).json({ error: "Forbidden: Role IDs not found" });
      return;
    }

    const roleIds = roleIdResult.rows.map((row) => row.id);

    //Step 3: Query role_permssions to check if the user has UPDATE permission for testaments
    const permissionResult = await getUserPermissions(
      pool,
      roleIds,
      "DELETE",
      "testaments"
    );

    if (permissionResult.rows.length === 0) {
      res.status(403).json({ error: "Forbidden: Insufficient permissions" });
      return;
    }
    next(); //User has UPDATE permission for testaments -> Proceed to the next middleware/testament
  } catch (error) {
    res.status(500).json({ error });
  }
};
