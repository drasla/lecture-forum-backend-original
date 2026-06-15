import { Router } from "express";
import adminCategoryRouter from "./category/adminCategoryRouter.ts";
import adminUserRouter from "./user/adminUserRouter.ts";
import { authenticate, requiredAdmin } from "../../middlewares/auth.ts";
import adminNoticeRouter from "./notice/adminNoticeRouter.ts";
import adminInquiryRouter from "./inquiry/adminInquiryRouter.ts";

const router = Router();

router.use(authenticate);
router.use(requiredAdmin);

router.use("/category", adminCategoryRouter);
router.use("/user", adminUserRouter);
router.use("/notice", adminNoticeRouter);
router.use("/inquiry", adminInquiryRouter);

export default router;
