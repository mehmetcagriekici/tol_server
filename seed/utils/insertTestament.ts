//imports
import { PoolClient } from "pg";
import { TestamentContent, TestamentMembers } from "../types/testaments.types";

/**
 * Seed helper function to insert a testament into the database
 * @param client - database connection
 * @param title - testament title
 * @param content - testament content
 * @param created_by - testament creator
 * @param members - optional, testament members
 * @param id - assigned testament id
 */
export const insertTestament = async (
  client: PoolClient,
  title: string,
  content: { [id: string]: TestamentContent },
  created_by: string,
  members: { [id: string]: TestamentMembers },
  id: string
) => {
  await client.query(
    `
    INSERT INTO testaments (title, content, created_by, members, id)
    VALUES ($1, $2, $3, $4, $5)
    `,
    [title, content, created_by, members, id]
  );
};
