//imports
import { Router } from "express";
import { authenticate } from "@src/middleware/authMiddleware";
import {
  canCreateVerses,
  canDeleteVerses,
  canReadVerses,
  canUpdateVerses,
} from "@src/middleware/versesMiddleware";
import {
  createVerseController,
  deleteVerseController,
  getAllVersesController,
  getVerseByIdController,
  updateVerseController,
} from "@src/controllers/verses.controller";
import { attachDbClient } from "@src/middleware/attachDbClientMiddleware";

//verses routes
//authentication middleare + verses RBAC middleware
const router = Router();

//route to get all the verses under a testament
router.get(
  "/:testament_id",
  authenticate,
  attachDbClient,
  canReadVerses,
  getAllVersesController
);

//route to get a single verse using the verse id
router.get(
  "/:testament_id/:verse_id",
  authenticate,
  attachDbClient,
  canReadVerses,
  getVerseByIdController
);

//route to create a verse
router.post(
  "/new",
  authenticate,
  attachDbClient,
  canCreateVerses,
  createVerseController
);

//route to update verses
router.put(
  "/updated/:testament_id/:verse_id",
  authenticate,
  attachDbClient,
  canUpdateVerses,
  updateVerseController
);

//route to delete a verse
router.delete(
  "/deleted/:testament_id/:verse_id",
  authenticate,
  attachDbClient,
  canDeleteVerses,
  deleteVerseController
);

export default router;
