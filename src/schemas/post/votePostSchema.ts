import z from "zod";

export const votePostSchema = z.object({
    option: z.union([z.literal(1), z.literal(2)], {
        message: "투표 항목은 1 또는 2만 가능합니다.",
    }),
});

export type VotePostInputType = z.infer<typeof votePostSchema>;
