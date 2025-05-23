//imports
import { Verse, VerseContent, VerseSubscribers } from "@src/types/verses.types";
import { PoolClient, QueryResult } from "pg";

/**
 * function to fetch all verses of a testament
 * @param testamentId - id of the parent testament
 * @param client - current client
 * @returns Promise<verse[]>
 */
export const getAllVerses = async (
  testamentId: string,
  client: PoolClient
): Promise<Verse[]> => {
  const result: QueryResult = await client.query(
    "SELECT * FROM verses WHERE testament_id = $1",
    [testamentId]
  );

  return result.rows;
};

/**
 * function to fetch a single verse by id
 * @param id - verse id
 * @param client - current client
 * @returns Promise<Verse>
 */
export const getVerseById = async (
  id: string,
  client: PoolClient
): Promise<Verse | null> => {
  const result: QueryResult = await client.query(
    "SELECT * FROM verses WHERE id = $1",
    [id]
  );

  return result.rows.length > 0 ? result.rows[0] : null;
};

/**
 * function to create a new verse
 * @param subtitle - string
 * @param content VerseContent
 * @param created_by string
 * @param subscribers - VerseSubscribers
 * @param testament_id - string
 * @param client - current client
 * @returns Promise<verse>
 */
export const createVerse = async (
  subtitle: string,
  content: VerseContent,
  created_by: string,
  subscribers: VerseSubscribers,
  testament_id: string,
  client: PoolClient
): Promise<Verse> => {
  const result: QueryResult = await client.query(
    `
        INSERT INTO verses
        (subtitle, content, created_by, subscribers, testament_id)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
        `,
    [subtitle, content, created_by, subscribers, testament_id]
  );

  return result.rows[0];
};

/**
 * function to update an existing verse
 * @param id - verse id - string
 * @param content VerseContent
 * @param subscribers - VerseSubscribers
 * @param client - current client
 * @returns Promise <verse | null>
 */
export const updateVerse = async (
  id: string,
  subtitle: string,
  content: VerseContent,
  subscribers: VerseSubscribers,
  client: PoolClient
): Promise<Verse | null> => {
  const result: QueryResult = await client.query(
    `
    UPDATE verses 
    SET subtitle = $1, 
    content = $2,
    subscribers = $3
    WHERE id = $4
    RETURNING *  
    `,
    [subtitle, content, subscribers, id]
  );

  return result.rows.length > 0 ? result.rows[0] : null;
};

/**
 * function to delete a verse by id
 * @param id -stirg
 * @param client - current client
 * @returns Promise<boolean>
 */
export const deleteVerse = async (
  id: string,
  client: PoolClient
): Promise<boolean> => {
  const result: QueryResult = await client.query(
    "DELETE FROM verses WHERE id = $1 RETURNING *",
    [id]
  );

  return result.rows.length > 0;
};
