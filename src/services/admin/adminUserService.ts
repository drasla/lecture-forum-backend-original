import prisma from "../../config/prisma.ts";
import { UserCreateInput, UserUpdateInput } from "../../generated/prisma/models/User.ts";
import errorUtil from "../../utils/error/errorUtil.ts";

const userSelectFields = {
    id: true,
    username: true,
    name: true,
    nickname: true,
    email: true,
    phoneNumber: true,
    birthdate: true,
    gender: true,
    role: true,
    createdAt: true,
    deletedAt: true,
};

const createUser = async (data: UserCreateInput) => {
    try {
        return await prisma.user.create({
            data,
            select: userSelectFields,
        });
    } catch (error) {
        errorUtil.handlePrismaDuplicateError(error);
    }
};

const getUserList = async (page: number = 1, size: number = 10) => {
    const skip = (page - 1) * size;
    const take = size;

    // 💡 1. 전체 유저 수 구하기 (트랜잭션으로 묶거나 개별로 호출)
    const total = await prisma.user.count();

    // 💡 2. 페이지네이션이 적용된 데이터 조회
    const list = await prisma.user.findMany({
        select: userSelectFields,
        orderBy: { createdAt: "desc" },
        skip,
        take,
    });

    // 💡 3. 요청하신 객체 형태로 반환
    return {
        page,
        size,
        total,
        list,
    };
};

// 3. 단일 유저 조회
const getUserById = async (id: number) => {
    const user = await prisma.user.findUnique({
        where: { id },
        select: userSelectFields,
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
            select: userSelectFields,
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
