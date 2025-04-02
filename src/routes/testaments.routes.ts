//imports
import { Router } from "express";
import {
  getAllTestamentsController,
  getTestamentByIdController,
  createTestamentController,
  updateTestamentController,
  deleteTestamentController,
} from "@src/controllers/testaments.controller";
import {
  canReadTestaments,
  canCreateTestament,
  canDeleteTestament,
  canModifyTestament,
} from "@src/middleware/testamentsMiddleware";
import { authenticate } from "@src/middleware/authMiddleware";
import { attachDbClient } from "@src/middleware/attachDbClientMiddleware";

//routes
const router = Router();

//Requires authorization, canReadTestaments ensures use has SELECT permission
//Calls getAllTestaments to fetch all testaments
router.get(
  "/all",
  authenticate,
  attachDbClient,
  canReadTestaments,
  getAllTestamentsController
);

//Requires authorization, canReadTestaments ensures use has SELECT permission
//Calls getTestamentById to fetch a specific testament
router.get(
  "/single/:id",
  authenticate,
  attachDbClient,
  canReadTestaments,
  getTestamentByIdController
);

//canCreateTestament ->Ensures the user has INSERT permission for testaments
//createTestament -> Handles the request to add a new testament
router.post(
  "/new",
  authenticate,
  attachDbClient,
  canCreateTestament,
  createTestamentController
);

//canModifyTestament -> Ensure the user has UPDATE permission for testaments
//updateTestament -> Handles the request to update an existing testament
router.put(
  "/modified/:id",
  authenticate,
  attachDbClient,
  canModifyTestament,
  updateTestamentController
);

//canDeleteTestament -> Esnures the user thas DELETE permission for testaments
//deleteTestament -> Handles the request to delete and existing testament
router.delete(
  "/expired/:id",
  authenticate,
  attachDbClient,
  canDeleteTestament,
  deleteTestamentController
);

export default router;
