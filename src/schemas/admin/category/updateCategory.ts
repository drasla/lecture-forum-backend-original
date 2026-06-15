import { z } from "zod";

export const adminUpdateCategorySchema = z.object({
    name: z
        .string()
        .min(1, "카테고리명을 입력해주세요.")
        .max(50, "카테고리명은 최대 50자를 초과할 수 없습니다."),
});

export type AdminUpdateCategoryInputType = z.infer<typeof adminUpdateCategorySchema>;
