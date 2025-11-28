import homeRoutes from "./home.routes";
import { Router } from "express";
import authenRoutes from "./account.routes";
import chatRoutes from "./chat.routes";
import * as middlewares from "../../middlewares/client/middlewares";
import roomChatRoute from "./room-chat.route";
import testRoutes from "./test.routes";

const router = Router();

router.use(middlewares.runAllRouters);

router.use("/test", testRoutes);

router.use("/account", authenRoutes);

router.use("/chat", middlewares.requireLogin, middlewares.roomFriendsAccess, chatRoutes);

router.use("", middlewares.requireLogin, middlewares.roomFriendsAccess, homeRoutes);

router.use("/room-chat", middlewares.requireLogin, roomChatRoute);
// comment
export default router;