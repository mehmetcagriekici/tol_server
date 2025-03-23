//impots
import { Response, NextFunction } from "express";
import pool from "../config/db";
import { AuthRequest } from "./authMiddleware";
import { getUserRoles } from "@src/utils/getUserRoles";
import { convertRoleNamesToIds } from "@src/utils/convertRoleNamesToIds";
import { getUserPermissions } from "@src/utils/getUserPermissions";

/**
 * Middleware to check if the user has SELECT permissions for the verses table
 * @param req - request object contains user id
 * @param res - middleware response object
 * @param next - next function, if the user has permission, proceed to the next middlware or controller
 */
export const canReadVerses = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    //get user id from the request
    const userId = req.user?.userId;
    //check if the userId exists
    if (!userId) {
      //non-authenticated user
      res.status(401).json({ error: "Unauthenticated" });

      return;
    }

    //Step 1: Fetch the user's roles (testaments_role and the acts_roles)
    const rolesResult = await getUserRoles(pool, userId);

    //check if the user has any role ? if not user does not exist, testament_role "user" is the defaut role that is assigned by the related query
    if (rolesResult.rows.length === 0) {
      //failed RBAC, throws 403 Forbidden
      res.status(403).json({ error: "Forbidden: User not found" });
      return;
    }

    //get the user's roles
    const { testament_role, acts_roles } = rolesResult.rows[0];

    //Step 2: Convert role names to role IDs since they are stores as uuid on the users table in the database
    const rolesIdsResult = await convertRoleNamesToIds(pool, [
      testament_role,
      ...Object.values(acts_roles), //acts_roles is not iterable by default
    ]);

    //check if the role_ids exist in the database on the related table, if not the roles are invalid
    if (rolesIdsResult.rows.length === 0) {
      //Failded RBAC, throws 403 Forbidden
      //invalid role IDs
      res.status(403).json({ error: "Forbidden: Role IDs not found" });
      return;
    }

    //get the IDs from the result
    const roleIds = rolesIdsResult.rows.map((row) => row.id);

    //Step 3: Query the role_permissions to check if the user has SELECT permission for the verses
    const permissionResult = await getUserPermissions(
      pool,
      roleIds,
      "SELECT",
      "verses"
    );

    //check if the user has permissions, at least one of the required roles
    if (permissionResult.rows.length === 0) {
      //Failed RBAC, throws 403 Forbidden
      res.status(403).json({ error: "Forbidden: Insufficient permissions" });
      return;
    }

    next(); //if the reques passes all the check then it is valid, procced with the next middleware/controller
  } catch (error) {
    //internal server error
    res.status(500).json({ error });
  }
};

/**
 * Middleware to check if the user has INSERT permission for the verses table
 * @param req - request object contains user id
 * @param res - middleware response object
 * @param next - next function, if the user has permission, proceed to the next middlware or controller
 */
export const canCreateVerses = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    //get user id from the request
    const userId = req.user?.userId;
    //check if the userId exists
    if (!userId) {
      //non-authenticated user
      res.status(401).json({ error: "Unauthenticated" });
      return;
    }

    //Step 1: Fetch the user's roles (testaments_role and the acts_roles)
    const rolesResult = await getUserRoles(pool, userId);

    //check if the user has any role ? if not user does not exist, testament_role "user" is the defaut role that is assigned by the related query
    if (rolesResult.rows.length === 0) {
      //failed RBAC, throws 403 Forbidden
      res.status(403).json({ error: "Forbidden: User not found" });
      return;
    }

    //get the user's roles
    const { testament_role, acts_roles } = rolesResult.rows[0];

    //Step 2: Convert role names to role IDs since they are stores as uuid on the users table in the database
    const rolesIdsResult = await convertRoleNamesToIds(pool, [
      testament_role,
      ...Object.values(acts_roles), //acts_roles is not iterable by default
    ]);

    //check if the role_ids exist in the database on the related table, if not the roles are invalid
    if (rolesIdsResult.rows.length === 0) {
      //Failded RBAC, throws 403 Forbidden
      //invalid role IDs
      res.status(403).json({ error: "Forbidden: Role IDs not found" });
      return;
    }

    //get the IDs from the result
    const roleIds = rolesIdsResult.rows.map((row) => row.id);

    //Step 3: Query the role_permissions to check if the user has INSERT permission for the verses
    const permissionResult = await getUserPermissions(
      pool,
      roleIds,
      "INSERT",
      "verses"
    );

    //check if the user has permissions, at least one of the required roles
    if (permissionResult.rows.length === 0) {
      //Failed RBAC, throws 403 Forbidden
      res.status(403).json({ error: "Forbidden: Insufficient permissions" });
      return;
    }

    next(); //if the reques passes al
  } catch (error) {
    //internal server error
    res.status(500).json({ error });
  }
};

/**
 * Middleware to check if the user has UPDATE permission for the verses table
 * @param req - request object contains user id
 * @param res - middleware response object
 * @param next - next function, if the user has permission, proceed to the next middlware or controller
 */
export const canUpdateVerses = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    //get user id from the request
    const userId = req.user?.userId;
    //check if the userId exists
    if (!userId) {
      //non-authenticated user
      res.status(401).json({ error: "Unauthenticated" });
      return;
    }

    //Step 1: Fetch the user's roles (testaments_role and the acts_roles)
    const rolesResult = await getUserRoles(pool, userId);

    //check if the user has any role ? if not user does not exist, testament_role "user" is the defaut role that is assigned by the related query
    if (rolesResult.rows.length === 0) {
      //failed RBAC, throws 403 Forbidden
      res.status(403).json({ error: "Forbidden: User not found" });
      return;
    }

    //get the user's roles
    const { testament_role, acts_roles } = rolesResult.rows[0];

    //Step 2: Convert role names to role IDs since they are stores as uuid on the users table in the database
    const rolesIdsResult = await convertRoleNamesToIds(pool, [
      testament_role,
      ...Object.values(acts_roles), //acts_roles is not iterable by default
    ]);

    //check if the role_ids exist in the database on the related table, if not the roles are invalid
    if (rolesIdsResult.rows.length === 0) {
      //Failded RBAC, throws 403 Forbidden
      //invalid role IDs
      res.status(403).json({ error: "Forbidden: Role IDs not found" });
      return;
    }

    //get the IDs from the result
    const roleIds = rolesIdsResult.rows.map((row) => row.id);

    //Step 3: Query the role_permissions to check if the user has UPDATE permission for the verses
    const permissionResult = await getUserPermissions(
      pool,
      roleIds,
      "UPDATE",
      "verses"
    );

    //check if the user has permissions, at least one of the required roles
    if (permissionResult.rows.length === 0) {
      //Failed RBAC, throws 403 Forbidden
      res.status(403).json({ error: "Forbidden: Insufficient permissions" });
      return;
    }

    next(); //if the reques passes al
  } catch (error) {
    //internal server error
    res.status(500).json({ error });
  }
};

/**
 * Middleware to check if the user has DELETE permission for the verses table
 * @param req - request object contains user id
 * @param res - middleware response object
 * @param next - next function, if the user has permission, proceed to the next middlware or controller
 */
export const canDeleteVerses = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    //get user id from the request
    const userId = req.user?.userId;
    //check if the userId exists
    if (!userId) {
      //non-authenticated user
      res.status(401).json({ error: "Unauthenticated" });
      return;
    }

    //Step 1: Fetch the user's roles (testaments_role and the acts_roles)
    const rolesResult = await getUserRoles(pool, userId);

    //check if the user has any role ? if not user does not exist, testament_role "user" is the defaut role that is assigned by the related query
    if (rolesResult.rows.length === 0) {
      //failed RBAC, throws 403 Forbidden
      res.status(403).json({ error: "Forbidden: User not found" });
      return;
    }

    //get the user's roles
    const { testament_role, acts_roles } = rolesResult.rows[0];

    //Step 2: Convert role names to role IDs since they are stores as uuid on the users table in the database
    const rolesIdsResult = await convertRoleNamesToIds(pool, [
      testament_role,
      ...Object.values(acts_roles), //acts_roles is not iterable by default
    ]);

    //check if the role_ids exist in the database on the related table, if not the roles are invalid
    if (rolesIdsResult.rows.length === 0) {
      //Failded RBAC, throws 403 Forbidden
      //invalid role IDs
      res.status(403).json({ error: "Forbidden: Role IDs not found" });
      return;
    }

    //get the IDs from the result
    const roleIds = rolesIdsResult.rows.map((row) => row.id);

    //Step 3: Query the role_permissions to check if the user has DELETE permission for the verses
    const permissionResult = await getUserPermissions(
      pool,
      roleIds,
      "DELETE",
      "verses"
    );

    //check if the user has permissions, at least one of the required roles
    if (permissionResult.rows.length === 0) {
      //Failed RBAC, throws 403 Forbidden
      res.status(403).json({ error: "Forbidden: Insufficient permissions" });
      return;
    }

    next(); //if the reques passes al
  } catch (error) {
    //internal server error
    res.status(500).json({ error });
  }
};
