//imports
import { Pool } from "pg";

/**
 * used to get  user's roles from the romans table (role names)
 * @param pool - query pool
 * @param userId - current user id
 * @returns promise<user roles>
 */
export const getUserRoles = async (pool: Pool, userId: string) => {
  const roleQuery = `
    SELECT testament_role, acts_roles
    FROM romans
    WHERE id = $1
    `;
  const roleResult = await pool.query(roleQuery, [userId]);

  return roleResult;
};
