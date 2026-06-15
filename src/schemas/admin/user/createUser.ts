import { z } from "zod";
import { GenderType, RoleType } from "../../../generated/prisma/enums.ts";

export const adminCreateUserSchema = z.object({
    username: z.string().min(4),
    password: z.string().min(6),
    name: z.string().min(2),
    nickname: z.string().min(2).max(10),
    email: z.email(),
    phoneNumber: z.string().optional(),
    birthdate: z.string().optional(),
    gender: z.enum(GenderType),
    role: z.enum(RoleType),
});

export type AdminCreateUserInputType = z.infer<typeof adminCreateUserSchema>;
