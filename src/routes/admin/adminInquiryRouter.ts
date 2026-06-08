import { Router } from "express";
import adminInquiryController from "../../controllers/admin/adminInquiryController.ts";
import { validate } from "../../middlewares/validate.ts";
import { adminInquiryAnswerSchema } from "../../schemas/admin/inquiry/adminInquiryAnswerSchema.ts";

const router = Router();

router.get("/list", adminInquiryController.getInquiryList);
router.get("/:id", adminInquiryController.getInquiryById);
router.patch(
    "/:id/answer",
    validate(adminInquiryAnswerSchema),
    adminInquiryController.answerInquiry,
);

export default router;
