//imports
import { PoolClient } from "pg";
import { VerseContent, VerseSubscribers } from "../types/verses.types";

/**
 * Seed helper function to insert verses
 * @param client - pool connection
 */
export const insertVerse = async (
  client: PoolClient,
  subtitle: string,
  content: { [index: number]: VerseContent },
  created_by: string,
  subscribers: { [id: string]: VerseSubscribers },
  testament_id: string,
  id: string
) => {
  await client.query(
    `
    INSERT INTO verses (subtitle, content, created_by, subscribers, testament_id, id)
    VALUES ($1, $2, $3, $4, $5, $6)
    `,
    [subtitle, content, created_by, subscribers, testament_id, id]
  );
};
