import { Router } from "express";
import * as accountController from "../../controller/client/account.controller";
import * as middlewares from "../../middlewares/client/middlewares";

const router = Router();

router.get("/not-friend", middlewares.requireLogin, accountController.notFriend);

// router.get("/friends", accountController.friends);

router.get("/request", middlewares.requireLogin, accountController.request);

router.get("/accept", middlewares.requireLogin, accountController.accept);


export default router;