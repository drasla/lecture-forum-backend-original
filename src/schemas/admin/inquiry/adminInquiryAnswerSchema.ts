import { z } from "zod";

export const adminInquiryAnswerSchema = z.object({
    answer: z.string().min(1, "답변 내용을 입력해주세요."),
});
export type AdminInquiryAnswerInputType = z.infer<typeof adminInquiryAnswerSchema>;
