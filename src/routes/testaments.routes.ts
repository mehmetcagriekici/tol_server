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

//routes
const router = Router();

//Requires authorization, canReadTestaments ensures use has SELECT permission
//Calls getAllTestaments to fetch all testaments
router.get("/all", authenticate, canReadTestaments, getAllTestamentsController);

//Requires authorization, canReadTestaments ensures use has SELECT permission
//Calls getTestamentById to fetch a specific testament
router.get(
  "/single/:id",
  authenticate,
  canReadTestaments,
  getTestamentByIdController
);

//canCreateTestament ->Ensures the user has INSERT permission for testaments
//createTestament -> Handles the request to add a new testament
router.post(
  "/new",
  authenticate,
  canCreateTestament,
  createTestamentController
);

//canModifyTestament -> Ensure the user has UPDATE permission for testaments
//updateTestament -> Handles the request to update an existing testament
router.put(
  "/modified/:id",
  authenticate,
  canModifyTestament,
  updateTestamentController
);

//canDeleteTestament -> Esnures the user thas DELETE permission for testaments
//deleteTestament -> Handles the request to delete and existing testament
router.delete(
  "/expired/:id",
  authenticate,
  canDeleteTestament,
  deleteTestamentController
);

export default router;
