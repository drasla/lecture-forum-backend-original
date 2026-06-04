import z from "zod";

export const updateReplySchema = z.object({
    content: z.string().min(1, "댓글 내용을 입력해주세요."),
});

export type UpdateReplyInputType = z.infer<typeof updateReplySchema>;
