import { z } from "zod";
import { GenderType } from "../../generated/prisma/enums.ts";

export const createUserSchema = z.object({
    username: z.string().min(4),
    password: z.string().min(8),
    name: z.string().min(2),
    nickname: z.string().min(2).max(50),
    email: z.email(),
    phoneNumber: z.string().optional(),
    birthdate: z.string().optional(),
    gender: z.enum(GenderType),
});

export type CreateUserInputType = z.infer<typeof createUserSchema>;
