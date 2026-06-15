import prisma from "../../../config/prisma.ts";
import { UserCreateInput, UserUpdateInput } from "../../../generated/prisma/models/User.ts";
import { Prisma } from "../../../generated/prisma/client.ts";

const getUserList = async (page: number, size: number) => {
    // prisma에게 페이지네이션을 한 정보를 요청을 하기 위해서는
    // skip, take라는 정보가 필요함. skip은 지나쳐야되는 항목 갯수 take는 가져와야 되는 항목 갯수
    const skip = (page - 1) * size;
    const take = size;

    // SELECT COUNT(*) FROM user;
    const total = await prisma.user.count();

    const list = await prisma.user.findMany({
        orderBy: {
            id: "desc",
        },
        take,
        skip,
    });

    return {
        page,
        size,
        total,
        list,
    }
};

const getUserById = async (id: number) => {
    const user = prisma.user.findUnique({
        where: {
            id,
        },
    });

    if (!user) {
        throw new Error("USER_NOT_FOUND");
    }

    return user;
};

const createUser = async (input: UserCreateInput) => {
    try {
        return await prisma.user.create({
            data: input,
        })
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2002") {
                const errorMessage = error.message;

                if (errorMessage.includes("username")) {
                    throw new Error("USERNAME_EXISTS_USERNAME");
                }
                if (errorMessage.includes("email")) {
                    throw new Error("EMAIL_EXISTS_EMAIL");
                }
                if (errorMessage.includes("nickname")) {
                    throw new Error("NICKNAME_EXISTS_NICKNAME");
                }
            }
        }
        throw new Error("UNKNOWN_ERROR");
    }
}

const updateUser = async (input: UserUpdateInput, id: number) => {
    const user = await prisma.user.findUnique({
        where: {
            id,
        }
    });

    if (!user) {
        throw new Error("USER_NOT_FOUND");
    }

    try {
        return await prisma.user.update({
            where: {
                id,
            },
            data: input,
        })
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2002") {
                const errorMessage = error.message;
                if (errorMessage.includes("username")) {
                    throw new Error("USERNAME_EXISTS_USERNAME");
                }
                if (errorMessage.includes("email")) {
                    throw new Error("EMAIL_EXISTS_EMAIL");
                }
                if (errorMessage.includes("nickname")) {
                    throw new Error("NICKNAME_EXISTS_NICKNAME");
                }
            }
        }
        throw new Error("UNKNOWN_ERROR");
    }
}

const toggleUser = async (id: number) => {
    // 실제 데이터베이스에 DELETE 로 요청하는게 아닌,
    // UPDATE로 deletedAt만 날짜를 기록할 것임 (소프트삭제)
    const user = await prisma.user.findUnique({
        where: {
            id,
        }
    });
    if (!user) {
        throw new Error("USER_NOT_FOUND");
    }
    if (user.deletedAt) {
        throw new Error("USER_ALREADY_DELETED");
    }
    return prisma.user.update({
        where: {
            id,
        },
        data: {
            deletedAt: new Date(),
        }
    });
}

export default {
    getUserList,
    getUserById,
    createUser,
    updateUser,
    toggleUser,
};
