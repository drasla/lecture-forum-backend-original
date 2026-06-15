import { Router } from "express";
import adminInquiryController from "../../../controllers/admin/adminInquiryController.ts";
import { validate } from "../../../middlewares/validate.ts";
import { inquiryAnswerSchema } from "../../../schemas/inquiry/inquiryAnswerSchema.ts";

const router = Router();

router.get("/list", adminInquiryController.getInquiryList);
router.get("/:inquiryId", adminInquiryController.getInquiryById);
// 답변 등록 : post여도 되고, patch로 해도 됨
// 주소를 /admin/inquiry/글번호 할 경우  -> post
// 주소를 /admin/inquiry/글번호/create 할 경우 -> patch
// 처음 설계할 때에는 "수정 기능"을 만들기로 생각했는데 다시금 따져보니 이 API를 생성과 수정이 같이 이용하게 되어서
// post방식이 아닌 patch 변경
router.patch("/:inquiryId", validate(inquiryAnswerSchema), adminInquiryController.answerInquiry);

// 답변 삭제 : patch여도 되고, delete로 해도 됨
// 주소를 /admin/inquiry/글번호 할 경우  -> delete
// 주소를 /admin/inquiry/글번호/delete 할 경우  -> patch
router.delete("/:inquiryId", adminInquiryController.deleteInquiry);

export default router;
