import { Router } from "express";
import userController from "../controllers/userController.ts";
import { validate } from "../middlewares/validate.ts";
import { createUserSchema } from "../schemas/user.ts";

const router = Router();

router.post("/", validate(createUserSchema), userController.createUser);

export default router;
