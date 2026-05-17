import prisma from "../../config/prisma.ts";
import { Prisma } from "../../generated/prisma/client.ts";

const createCategory = async (name: string) => {
    try {
        return await prisma.category.create({
            data: { name },
        });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            // 💡 고유 제약 조건(name @unique) 위반 시 에러 처리
            if (error.code === "P2002") {
                throw new Error("ALREADY_EXISTS_CATEGORY_NAME");
            }
        }

        throw error;
    }
};

const getCategoryList = async () => {
    return prisma.category.findMany({
        orderBy: {
            id: "desc"
        }
    });
}

export default {
    createCategory,
    getCategoryList,
};
