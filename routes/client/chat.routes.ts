import { Router } from "express";
import * as chatController from "../../controller/client/chat.controller";
import * as middlewares from "../../middlewares/client/middlewares";
import multer from "multer";

const router = Router();
const upload = multer();
router.get("/:roomChatId", upload.array("images"), middlewares.isAccess, chatController.index);

export default router;