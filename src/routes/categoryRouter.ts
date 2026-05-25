import categoryController from "../controllers/categoryController.ts";
import { Router } from "express";

const router = Router();

router.get("/", categoryController.getActiveCategories);

export default router;
