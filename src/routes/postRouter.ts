import { Router } from "express";
import postController from "../controllers/postController.ts";
import { validate } from "../middlewares/validate.ts";
import { createPostSchema } from "../schemas/post/createPostSchema.ts";
import { authenticate, checkUser } from "../middlewares/auth.ts";
import { votePostSchema } from "../schemas/post/votePostSchema.ts";

const router = Router();

router.get("/list/:categoryId", postController.getPostsByCategory);
router.get("/recent", postController.getRecentPosts);
router.get("/:id", checkUser, postController.getPostById);
router.post("/create", authenticate, validate(createPostSchema), postController.createPost);

router.post("/:postId/vote", authenticate, validate(votePostSchema), postController.votePost);
router.delete("/:postId/vote", authenticate, postController.cancelVotePost);

// authenticate : 로그인이 되어져 있는 사용자만 컨트롤러로 가게 하겠다 (req.user)
// checkUser : 로그인이 되어져 있든 안 되어져있든 컨트롤러로 가게 하겠다 (req.user)
// requiredAdmin : 로그인도 되어져 있고, 관리자만 컨트롤러로 가게 하겠다
// validate : req.body에 담겨 오는 내용에 대한 체크

// 주소값   : 동적 라우팅을 통한 params, 쿼리스트링
// 헤더
// 바디

export default router;
