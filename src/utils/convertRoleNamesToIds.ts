//imports
import { Pool } from "pg";

/**
 * function to convert role names in the databes to UUIDs, since they are stored as UUIDs
 * @param pool - query pool
 * @param rolesArray - all of user roles (sub - main)
 * @returns Promise<user's roles as UUIDs>
 */
export const convertRoleNamesToIds = async (
  pool: Pool,
  rolesArray: string[]
) => {
  const roleIdQuery = `
    SELECT id FROM roles WHERE role = ANY($1::text[])
    `;
  const roleIdResult = await pool.query(roleIdQuery, [rolesArray]);

  return roleIdResult;
};
