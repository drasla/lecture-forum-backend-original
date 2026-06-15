import { z } from "zod";

export const createReplySchema = z.object({
    postId: z.number().positive("유효한 카테고리 ID가 필요합니다."),
    content: z.string().min(1, "댓글 내용은 필수입니다.")
});

export type CreateReplyInputType = z.infer<typeof createReplySchema>;