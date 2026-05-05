import { Router } from "express";
import userController from "../controllers/userController.ts";

const router = Router();

router.post("/", userController.createUser);

export default router;
