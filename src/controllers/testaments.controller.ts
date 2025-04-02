//imports
import { Response } from "express";
import {
  getAllTestaments,
  getTestamentById,
  createTestament,
  updateTestament,
  deleteTestament,
} from "@src/services/testaments.service";
import { testUuid } from "@src/utils/regexId";
import { AuthRequest } from "@src/middleware/authMiddleware";

/**
 * controller to fetch all testaments
 * @param _req - user request object, not used
 * @param res - server response
 * @returns all testaments from the database
 */
export const getAllTestamentsController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    //get the client from the request
    const client = req.dbClient;

    if (!client) {
      res.status(400).json({ error: "Invalid session" });
      return;
    }

    const testaments = await getAllTestaments(client);
    res.json(testaments);
  } catch (error) {
    res.status(500).json({ error });
  }
};

/**
 * controller to fetch a single testament by ID
 * @param req - user request object includes id
 * @param res - the server response
 * @returns a single testament
 */
export const getTestamentByIdController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { id } = req.params;
    const client = req.dbClient;
    //id is not in valid uuid syntax
    if (!testUuid(id)) {
      res.status(400).json({ error: "Invalid testament ID" });
      return;
    }

    if (!client) {
      res.status(400).json({ error: "Invalid session" });
      return;
    }

    const testament = await getTestamentById(id, client);

    //Not Found
    if (!testament) {
      res.status(404).json({ error: "Testament not found" });
      return;
    }

    res.json(testament);
  } catch (error) {
    res.status(500).json(error);
  }
};

/**
 * Controller to create a new testament
 * @param req - user request object, {title, content, created_by, members}
 * @param res - server response
 * @returns the newly created testament
 */
export const createTestamentController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { title, content, created_by, members } = req.body;
    const client = req.dbClient;

    if (!client) {
      res.status(400).json({ error: "Invalid session" });
      return;
    }

    //basic validation
    //members are optional during creation, default empty object in the dabase
    if (!title || !content || !created_by) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const newTestament = await createTestament(
      title,
      content,
      created_by,
      members,
      client
    );

    res.status(201).json(newTestament);
  } catch (error) {
    res.status(500).json(error);
  }
};

/**
 * Controller to update the testament
 * @param req - user request object, testament id from the req params, {title, content, members} from the req body
 * @param res - server response
 * @returns updated testament
 */
export const updateTestamentController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { title, content, members } = req.body;
    const client = req.dbClient;

    if (!client) {
      res.status(400).json({ error: "Invalid session" });
      return;
    }

    //id is not in valid uuid syntax
    if (!testUuid(id)) {
      res.status(400).json({ error: "Invalid testament ID" });
      return;
    }

    //ensure at east one field is provided for the update
    if (title === undefined && content === undefined && members === undefined) {
      res
        .status(400)
        .json({ error: "At least one field must be provided for update" });
      return;
    }

    const existingTestament = await getTestamentById(id, client);

    if (!existingTestament) {
      res.status(404).json({ error: "Testament not found" });

      return;
    }

    //use existing values if a field is not provided
    const updatedTitle = title ?? existingTestament.title;
    const updatedContent = content ?? existingTestament.content;
    const updatedMembers = members ?? existingTestament.members;

    const updatedTestament = await updateTestament(
      id,
      updatedTitle,
      updatedContent,
      updatedMembers,
      client
    );

    res.json(updatedTestament);
  } catch (error) {
    res.status(500).json(error);
  }
};

/**
 * controller to delete the testament
 * @param req - user request object, id from the params
 * @param res - server response
 * @returns success message
 */
export const deleteTestamentController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { id } = req.params;
    const client = req.dbClient;

    const { rows } = await req.dbClient!.query(
      "SELECT current_setting('myapp.user_id') as user_id"
    );
    console.log("Session user_id:", rows[0].user_id);

    if (!client) {
      res.status(400).json({ error: "Invalid session" });
      return;
    }

    //id is not in valid uuid syntax
    if (!testUuid(id)) {
      res.status(400).json({ error: "Invalid testament ID" });
      return;
    }

    const deleted = await deleteTestament(id, client);

    if (!deleted) {
      res.status(404).json({ error: "Testament not found" });
      return;
    }

    res.json({ message: "Testament deleted successfully" });
  } catch (error) {
    res.status(500).json(error);
  }
};
