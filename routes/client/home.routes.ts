import { Router } from "express";
import * as homeController from "../../controller/client/home.controller";

const router = Router();

router.get("/", homeController.home);

export default router;