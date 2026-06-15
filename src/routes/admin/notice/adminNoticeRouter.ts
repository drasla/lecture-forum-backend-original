import { Router } from "express";
import adminNoticeController from "../../../controllers/admin/adminNoticeController.ts";
import { validate } from "../../../middlewares/validate.ts";
import { noticeSchema } from "../../../schemas/notice/noticeSchema.ts";

const router = Router();

router.post("/create", validate(noticeSchema), adminNoticeController.createNotice);
router.patch("/:noticeId", validate(noticeSchema), adminNoticeController.updateNotice);
router.delete("/:noticeId", adminNoticeController.deleteNotice);

export default router;
