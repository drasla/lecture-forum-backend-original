import { z } from "zod";

export const updateUserSchema = z.object({
    nickname: z.string().min(2, "닉네임은 2글자 이상이어야 합니다."),
    email: z.email("올바른 이메일 형식이 아닙니다."),
    phoneNumber: z.string().optional(),
});

export type UpdateUserInputType = z.infer<typeof updateUserSchema>;