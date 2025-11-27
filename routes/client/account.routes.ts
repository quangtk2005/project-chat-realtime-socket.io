import { Router } from "express";
import * as accountController from "../../controller/client/account.controller";
import * as middlewares from "../../middlewares/client/middlewares";

const router = Router();

router.get("/login", accountController.login);

router.get("/register/google/callback", accountController.registerGoogleCallback);


router.get("/register", accountController.register);

router.get("/not-friend", middlewares.requireLogin, middlewares.roomFriendsAccess, accountController.notFriend);

// router.get("/friends", accountController.friends);

router.get("/request", middlewares.requireLogin, middlewares.roomFriendsAccess, accountController.request);

router.get("/accept", middlewares.requireLogin, middlewares.roomFriendsAccess, accountController.accept);



export default router;