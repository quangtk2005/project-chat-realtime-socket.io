import { Router } from "express";
import * as roomChatController from "../../controller/client/room-chat.controller";
import * as middlewares from "../../middlewares/client/middlewares";

const router = Router();

router.get("/create", roomChatController.create);
router.post("/create", roomChatController.createPost);
export default router;