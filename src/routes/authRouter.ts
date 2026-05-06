import { Router } from "express";
import authController from "../controllers/authController";
import { validate } from "../middlewares/validate";
import { loginSchema } from "../schemas/user/login.ts";

const router = Router();

router.post("/login", validate(loginSchema), authController.login);

export default router;
