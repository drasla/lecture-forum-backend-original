import { Router } from "express";
import postController from "../controllers/postController";
import { validate } from "../middlewares/validate.ts";
import { createPostSchema } from "../schemas/post/createPostSchema.ts";
import { updatePostSchema } from "../schemas/post/updatePostSchema.ts";
import { authenticate, optionalAuthenticate } from "../middlewares/auth.ts";
import { votePostSchema } from "../schemas/post/votePostSchema.ts";

const router = Router();

// GET /api/posts/category/:categoryId?page=1&size=10
router.get("/list/:categoryId", postController.getPostsByCategory);
router.get("/:id", optionalAuthenticate, postController.getPostById);
router.post("/create", validate(createPostSchema), authenticate, postController.createPost);
router.patch("/:id", validate(updatePostSchema), authenticate, postController.updatePost);
router.delete("/:id", authenticate, postController.deletePost);
router.post("/:id/vote", validate(votePostSchema), authenticate, postController.votePost);
router.delete("/:id/vote", authenticate, postController.deleteVote);

export default router;
