//imports
import { Pool } from "pg";

/**
 * function to get user permissions for a specific action
 * @param pool - query pool
 * @param roleIds - user's roles as UUIDs
 * @param permission - target action
 * @param tableName - target table
 * @returns - Promise<if the user has permission, return the permission>
 */
export const getUserPermissions = async (
  pool: Pool,
  roleIds: string[],
  permission: string,
  tableName: string
) => {
  const permissionQuery = `
    SELECT 1
    FROM role_permissions rp
    JOIN permissions p ON rp.permission_id = p.id
    WHERE rp.role_id = ANY($1::uuid[])
    AND p.permission = '${permission}'
    AND '${tableName}' = ANY(rp.table_names)
    LIMIT 1;
    `;
  const permissionResult = await pool.query(permissionQuery, [roleIds]);

  return permissionResult;
};
