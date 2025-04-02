//imports
import { AuthRequest } from "@src/middleware/authMiddleware";
import {
  createVerse,
  deleteVerse,
  getAllVerses,
  getVerseById,
  updateVerse,
} from "@src/services/verses.service";
import { testUuid } from "@src/utils/regexId";
import { Response } from "express";

/**
 * Get all verses from a testament
 * @param req - user request object gets(testaments id from the URL)
 * @param res - server response
 * @returns all the verses inside the testament
 */
export const getAllVersesController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    //get the testament id from the request URL
    const { testament_id } = req.params;
    const client = req.dbClient;

    if (!client) {
      res.status(400).json({ error: "Invalid session" });
      return;
    }

    //check if the testament id exists, a verse can not exist without a testament
    if (!testament_id) {
      //Throw 404 not found
      res.status(404).json({ error: "Testament not found" });
      return;
    }

    //check if the id is in valid format (uuid)
    if (!testUuid(testament_id)) {
      res.status(400).json({ error: "Invalid testament ID" });
      return;
    }

    //get the verses
    const verses = await getAllVerses(testament_id, client);
    res.json(verses);
  } catch (error) {
    //internal server error
    res.status(500).json({ error });
  }
};

/**
 * Get a single verse by id
 * @param req - user request object - verse id is stored in the request URL get it from the params
 * @param res - the server response
 * @returns a single verse
 */
export const getVerseByIdController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    //get the id from the params
    const { verse_id } = req.params;
    const client = req.dbClient;

    if (!client) {
      res.status(400).json({ error: "Invalid session" });
      return;
    }

    //check if the verse id is in valid format
    if (!testUuid(verse_id)) {
      res.status(400).json({ error: "Invalid testament ID" });
      return;
    }

    //get the verse
    const verse = await getVerseById(verse_id, client);

    //check if the verse exists (null otherwise)
    if (!verse) {
      //throw 404 Not Found
      res.status(404).json({ error: "Verse not found" });
      return;
    }

    //send the verse
    res.json(verse);
  } catch (error) {
    //internal server error
    res.status(500).json({ error });
  }
};

/**
 * Create a verse
 * @param req - user request object, client payload includes required items to create a verse
 * @param res - server response
 * @returns the newly created verse
 */
export const createVerseController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    //get the required parts from the request body
    const { subtitle, content, created_by, subscribers, testament_id } =
      req.body;

    const client = req.dbClient;

    if (!client) {
      res.status(400).json({ error: "Invalid session" });
      return;
    }

    //check if the testament_id is in valid format
    if (!testUuid(testament_id)) {
      res.status(400).json({ error: "Invalid testament ID" });
      return;
    }

    //bacis validation for required fields (subscribers, default empty object)
    if (!subtitle || !content || !created_by || !testament_id) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }
    //create the new verse
    const newVerse = await createVerse(
      subtitle,
      content,
      created_by,
      subscribers,
      testament_id,
      client
    );
    //send the response with 201
    res.status(201).json(newVerse);
  } catch (error) {
    //unexpected internal server error
    res.status(500).json({ error });
  }
};

/**
 * Update a verse
 * @param req - get the verse_id and the testament_id from the URL, get the update fields from the payload
 * @param res - the server response
 * @returns updated verse
 */
export const updateVerseController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    //get the verse id from the params
    const { verse_id } = req.params;

    const client = req.dbClient;

    if (!client) {
      res.status(400).json({ error: "Invalid session" });
      return;
    }

    //check if the id is in valid format
    if (!testUuid(verse_id)) {
      res.status(400).json({ error: "Invalid verse ID" });
      return;
    }

    //get the current verse that will be updated
    const oldVerse = await getVerseById(verse_id, client);

    //check if the oldVerse exist
    if (!oldVerse) {
      res.status(404).json({ error: "Verse not found" });
      return;
    }

    //get the update fields from the body
    const { subtitle, content, subscribers } = req.body;

    //validate that at least one field is updated
    if (
      subtitle === undefined &&
      content === undefined &&
      subscribers === undefined
    ) {
      res
        .status(400)
        .json({ error: "At least one field must be provided for update" });
      return;
    }

    //use the updated values or the existing values
    const updatedSubtitle = subtitle ?? oldVerse.subtitle;
    const updatedContent = content ?? oldVerse.content;
    const updatedSubscribers = subscribers ?? oldVerse.subscribers;

    //update the verse with the updated values
    const newVerse = await updateVerse(
      verse_id,
      updatedSubtitle,
      updatedContent,
      updatedSubscribers,
      client
    );

    //send the updated verse
    res.json(newVerse);
  } catch (error) {
    //internal server error
    res.status(500).json({ error });
  }
};

/**
 * Delete a verse
 * @param req - get the id of the verse that is about to be deleted
 * @param res - ther server response
 * @returns a success message
 */
export const deleteVerseController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    //get the verse id from the request URL
    const { verse_id } = req.params;
    const client = req.dbClient;

    if (!client) {
      res.status(400).json({ error: "Invalid session" });
      return;
    }

    //control the id syntax
    if (!testUuid(verse_id)) {
      res.status(400).json({ error: "Invalid verse ID" });
      return;
    }

    //check if the deleted verse existed before, if not the deleteVerse service fucntion will return false
    const canBeDeleted = await getVerseById(verse_id, client);
    if (!canBeDeleted) {
      res.status(404).json({ error: "Verse not found" });
      return;
    }

    //delete the verse
    deleteVerse(verse_id, client);

    //return a success message that implies the verse is deleted successully
    res.json({ message: "Verse deleted successfully" });
  } catch (error) {
    //unexpected internal server error
    res.status(500).json({ error });
  }
};
