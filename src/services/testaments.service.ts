//imports
import {
  Testament,
  TestamentContent,
  TestamentMembers,
} from "@src/types/testaments.types";
import { PoolClient, QueryResult } from "pg";

/**
 * function to fetch all testaments from the database
 * @param client - current client
 * @returns Promise<Testament[]>
 */
export const getAllTestaments = async (
  client: PoolClient
): Promise<Testament[]> => {
  const result: QueryResult = await client.query("SELECT * FROM testaments");

  return result.rows;
};

/**
 * function to fetch a single testament by ID
 * @param id - testament id
 * @param client - current cllient
 * @returns Promise<Testament>
 */
export const getTestamentById = async (
  id: string,
  client: PoolClient
): Promise<Testament | null> => {
  const result: QueryResult = await client.query(
    "SELECT * FROM testaments WHERE id = $1",
    [id]
  );

  return result.rows.length > 0 ? result.rows[0] : null;
};

/**
 * Function to create a new testament
 * @param title - string
 * @param content - TestamentContent
 * @param created_by - string
 * @param members - TestamentMembers
 * @param client - current client
 * @returns Promise<Testament>
 */
export const createTestament = async (
  title: string,
  content: TestamentContent,
  created_by: string,
  members: TestamentMembers,
  client: PoolClient
): Promise<Testament> => {
  const result: QueryResult = await client.query(
    "INSERT INTO testaments (title, content, created_by, members) VALUES ($1, $2, $3, $4) RETURNING *",
    [title, content, created_by, members]
  );

  return result.rows[0];
};

/**
 * Function to update an existing testament
 * @param id - string
 * @param title - string
 * @param content - TestamentContent
 * @param members - TestamentMembers
 * @param client - current client
 * @returns Promise<Testament | null>
 */
export const updateTestament = async (
  id: string,
  title: string,
  content: TestamentContent,
  members: TestamentMembers,
  client: PoolClient
): Promise<Testament | null> => {
  const result: QueryResult = await client.query(
    "UPDATE testaments SET title = $1, content = $2, members = $3 WHERE id = $4 RETURNING *",
    [title, content, members, id]
  );

  return result.rows.length > 0 ? result.rows[0] : null;
};

/**
 * Function to delete a testament by id
 * @param id - string
 * @param client - current client
 * @returns Promise<boolean>
 */
export const deleteTestament = async (
  id: string,
  client: PoolClient
): Promise<boolean> => {
  const result: QueryResult = await client.query(
    "DELETE FROM testaments WHERE id = $1 RETURNING *",
    [id]
  );

  return result.rows.length > 0;
};
