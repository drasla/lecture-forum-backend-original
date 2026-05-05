import prisma from "../config/prisma.ts";
import { UserCreateInput } from "../generated/prisma/models/User.ts";
import passwordUtil from "../utils/password/passwordUtil.ts";

const createUser = async (data: UserCreateInput) => {
    const hashedPassword = await passwordUtil.hashPassword(data.password);

    return prisma.user.create({
        data: {
            ...data,
            password: hashedPassword,
        },
    });
};

export default {
    createUser,
};
