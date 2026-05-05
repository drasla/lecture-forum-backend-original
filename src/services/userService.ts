import prisma from "../config/prisma.ts";
import { UserCreateInput } from "../generated/prisma/models/User.ts";

const createUser = async (data: UserCreateInput) => {
    return prisma.user.create({
        data,
    });
};

export default {
    createUser,
};
