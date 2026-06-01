import { Router } from "express";
import replyController from "../controllers/replyController.ts";
import { authenticate } from "../middlewares/auth.ts";
import { validate } from "../middlewares/validate.ts";
import { createReplySchema } from "../schemas/reply/createReplySchema.ts";

const router = Router();

// 💡 1. 특정 게시글의 댓글 목록 조회 (비로그인도 조회 가능하므로 인증 미들웨어 없음)
// GET /api/replies/post/:postId?page=1&size=10
router.get("/post/:postId", replyController.getReplies);

// 💡 2. 댓글 작성
// POST /api/replies/post/:postId
router.post(
    "/post/:postId",
    authenticate,
    validate(createReplySchema),
    replyController.createReply,
);

// 💡 3. 댓글 삭제 (본인 댓글만 삭제)
// DELETE /api/replies/:id
router.delete("/:id", authenticate, replyController.deleteReply);

export default router;
