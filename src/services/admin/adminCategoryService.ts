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
            id: "desc",
        },
    });
};

const getCategoryById = async (id: number) => {
    const category = await prisma.category.findUnique({
        where: { id },
    });

    if (!category) {
        throw new Error("CATEGORY_NOT_FOUND");
    }

    return category;
};

const updateCategory = async (id: number, name: string) => {
    try {
        return await prisma.category.update({
            where: { id },
            data: { name },
        });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2002") throw new Error("ALREADY_EXISTS_CATEGORY_NAME");
            // 업데이트하려는 대상이 없을 때의 Prisma 에러 코드
            if (error.code === "P2025") throw new Error("CATEGORY_NOT_FOUND");
        }
        throw error;
    }
};

const toggleCategoryStatus = async (id: number) => {
    // 먼저 현재 카테고리 상태를 가져옵니다.
    const category = await prisma.category.findUnique({ where: { id } });

    if (!category) {
        throw new Error("CATEGORY_NOT_FOUND");
    }

    // 상태를 반대로 스왑합니다.
    const newStatus = category.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    return prisma.category.update({
        where: { id },
        data: { status: newStatus },
    });
};

export default {
    createCategory,
    getCategoryList,
    getCategoryById,
    updateCategory,
    toggleCategoryStatus,
};
