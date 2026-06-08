// /src/routes/inquiryRouter.ts
import { Router } from "express";
import inquiryController from "../controllers/inquiryController.ts";
import { authenticate } from "../middlewares/auth.ts";
import { validate } from "../middlewares/validate.ts";
import { inquirySchema } from "../schemas/inquiry/inquirySchema.ts";

const router = Router();

router.use(authenticate);

router.post("/create", validate(inquirySchema), inquiryController.createInquiry);
router.get("/list", inquiryController.getMyInquiries);
router.get("/:id", inquiryController.getInquiryById);

export default router;
