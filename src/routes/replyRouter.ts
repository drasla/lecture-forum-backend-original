import { Router } from "express";
import replyController from "../controllers/replyController.ts";
import { authenticate } from "../middlewares/auth.ts";
import { validate } from "../middlewares/validate.ts";
import { createReplySchema } from "../schemas/reply/createReplySchema.ts";
import { updateReplySchema } from "../schemas/reply/updateReplySchema.ts";

const router = Router();

router.get("/:postId", replyController.getReplies);
router.post("/:postId", authenticate, validate(createReplySchema), replyController.createReply);
router.patch("/:id", authenticate, validate(updateReplySchema), replyController.updateReply);
router.delete("/:id", authenticate, replyController.deleteReply);

export default router;
