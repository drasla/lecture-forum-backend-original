import { Router } from "express";
import postController from "../controllers/postController";

const router = Router();

// GET /api/posts/category/:categoryId?page=1&size=10
router.get("/category/:categoryId", postController.getPostsByCategory);

export default router;
