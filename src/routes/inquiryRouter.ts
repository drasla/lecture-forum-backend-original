import { Router } from "express";
import inquiryController from "../controllers/inquiryController.ts";
import { authenticate } from "../middlewares/auth.ts";
import { validate } from "../middlewares/validate.ts";
import { inquirySchema } from "../schemas/inquiry/inquirySchema.ts";

const router = Router();

router.get("/list", authenticate, inquiryController.getInquiryList);
router.get("/:inquiryId", authenticate, inquiryController.getInquiryById);
router.post("/create", authenticate, validate(inquirySchema), inquiryController.createInquiry);
router.patch("/:inquiryId", authenticate, validate(inquirySchema), inquiryController.updateInquiry);
router.delete("/:inquiryId", authenticate, inquiryController.deleteInquiry);

export default router;
