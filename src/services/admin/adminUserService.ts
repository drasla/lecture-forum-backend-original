import prisma from "../../config/prisma.ts";
import { UserCreateInput, UserUpdateInput } from "../../generated/prisma/models/User.ts";
import errorUtil from "../../utils/error/errorUtil.ts";

const createUser = async (data: UserCreateInput) => {
    try {
        return await prisma.user.create({
            data,
        });
    } catch (error) {
        errorUtil.handlePrismaDuplicateError(error);
    }
};

const getUserList = async () => {
    return prisma.user.findMany({
        orderBy: { createdAt: "desc" },
    });
};

// 3. 단일 유저 조회
const getUserById = async (id: number) => {
    const user = await prisma.user.findUnique({
        where: { id },
    });

    if (!user) throw new Error("USER_NOT_FOUND");
    return user;
};

// 4. 유저 정보 수정
const updateUser = async (id: number, data: UserUpdateInput) => {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new Error("USER_NOT_FOUND");

    try {
        return await prisma.user.update({
            where: { id },
            data,
        });
    } catch (error) {
        errorUtil.handlePrismaDuplicateError(error);
    }
};

// 5. 유저 삭제 (소프트 삭제)
const deleteUser = async (id: number) => {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new Error("USER_NOT_FOUND");
    if (user.deletedAt) throw new Error("ALREADY_DELETED");

    return prisma.user.update({
        where: { id },
        data: { deletedAt: new Date() },
    });
};

export default {
    createUser,
    getUserList,
    getUserById,
    updateUser,
    deleteUser,
};
