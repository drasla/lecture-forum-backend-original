import { z } from "zod";

// 1. 사용자: 문의 작성 스키마
export const inquirySchema = z.object({
    title: z.string().min(1, "문의 제목을 입력해주세요."),
    content: z.string().min(1, "문의 내용을 입력해주세요."),
});
export type InquiryInputType = z.infer<typeof inquirySchema>;