//imports
import pool from "../config/db";
import {
  Testament,
  TestamentContent,
  TestamentMembers,
} from "@src/types/testaments.types";
import { QueryResult } from "pg";

/**
 * function to fetch all testaments from the database
 * @returns Promise<Testament[]>
 */
export const getAllTestaments = async (): Promise<Testament[]> => {
  const result: QueryResult = await pool.query("SELECT * FROM testaments");

  return result.rows;
};

/**
 * function to fetch a single testament by ID
 * @param id - testament id
 * @returns Promise<Testament>
 */
export const getTestamentById = async (
  id: string
): Promise<Testament | null> => {
  const result: QueryResult = await pool.query(
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
 * @returns Promise<Testament>
 */
export const createTestament = async (
  title: string,
  content: TestamentContent,
  created_by: string,
  members: TestamentMembers
): Promise<Testament> => {
  const result: QueryResult = await pool.query(
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
 * @returns Promise<Testament | null>
 */
export const updateTestament = async (
  id: string,
  title: string,
  content: TestamentContent,
  members: TestamentMembers
): Promise<Testament | null> => {
  const result: QueryResult = await pool.query(
    "UPDATE testaments SET title = $1, content = $2, members = $3 WHERE id = $4 RETURNING *",
    [title, content, members, id]
  );

  return result.rows.length > 0 ? result.rows[0] : null;
};

/**
 * Function to delete a testament by id
 * @param id - string
 * @returns Promise<boolean>
 */
export const deleteTestament = async (id: string): Promise<boolean> => {
  const result: QueryResult = await pool.query(
    "DELETE FROM testaments WHERE id = $1 RETURNING *",
    [id]
  );

  return result.rows.length > 0;
};
