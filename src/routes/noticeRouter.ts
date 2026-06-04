import { Router } from "express";
import noticeController from "../controllers/noticeController.ts";

const router = Router();

router.get("/list", noticeController.getNotices);
router.get("/:id", noticeController.getNoticeById);

export default router;
