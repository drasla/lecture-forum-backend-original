import z from "zod";

export const createReplySchema = z.object({
    content: z.string().min(1, "댓글 내용을 입력해주세요."),
});

export type CreateReplyInputType = z.infer<typeof createReplySchema>;
