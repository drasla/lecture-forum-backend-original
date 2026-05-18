import { Router } from "express";
import { authenticate, requireAdmin } from "../../middlewares/auth.ts";
import adminCategoryRouter from "./category/adminCategoryRouter.ts";
import adminUserRouter from "./category/adminUserRouter.ts";

const router = Router();

// 💡 /admin 하위의 모든 요청에 대해 토큰 및 관리자 권한을 먼저 검사합니다.
router.use(authenticate, requireAdmin);

router.use("/user", adminUserRouter);
router.use("/category", adminCategoryRouter);

export default router;
