import { Router } from "express";
import categoryController from "../controllers/categoryController.ts";

const router = Router();

router.get("/", categoryController.getActiveCategories);

export default router;
