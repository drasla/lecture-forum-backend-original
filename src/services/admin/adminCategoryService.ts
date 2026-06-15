import prisma from "../../config/prisma.ts";
import {
    CategoryCreateInput,
    CategoryUpdateInput,
} from "../../generated/prisma/models/Category.ts";
import { CategoryStatus, Prisma } from "../../generated/prisma/client.ts";

const getCategoryList = async () => {
    // findMany() : 데이터베이스에서 여러개의 row를 SELECT 하는 메서드
    // SELECT * FROM category ORDER BY id DESC
    return prisma.category.findMany({
        orderBy: {
            id: "desc",
        },
    });
};

const getCategoryById = async (id: number) => {
    const category = prisma.category.findUnique({
        where: {
            id,
        },
    });

    if (!category) {
        throw new Error("CATEGORY_NOT_FOUND");
    }

    return category;
};

const createCategory = async (input: CategoryCreateInput) => {
    try {
        // 생성 작업을 마친 prisma는 생성한 그 데이터를 리턴함
        return await prisma.category.create({
            data: input,
        });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2002") {
                throw new Error("ALREADY_EXIST_CATEGORY_NAME");
            }
        }

        throw error;
    }
};

const toggleCategoryStatus = async (id: number) => {
    const exist = await prisma.category.findUnique({
        where: {
            id,
        },
    });

    if (!exist) {
        throw new Error("CATEGORY_NOT_FOUND");
    }

    const newStatus =
        exist.status === CategoryStatus.ACTIVE ? CategoryStatus.INACTIVE : CategoryStatus.ACTIVE;

    // UPDATE category SET status = newStatus WHERE id = id;
    // 업데이트 후 해당 category를 리턴
    return prisma.category.update({
        where: {
            id,
        },
        data: {
            status: newStatus,
        },
    });
};

const updateCategory = async (id: number, input: CategoryUpdateInput) => {
    try {
        return prisma.category.update({
            where: {
                id,
            },
            data: input,
        });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            // Prisma의 에러 코드 P2002는 중복값이 있을 때 나오는 에러 코드
            if (error.code === "P2002") {
                throw new Error("ALREADY_EXIST_CATEGORY_NAME");
            }
            // Prisma의 에러 코드 P2025는 업데이트 대상을 찾지 못할 때 나오는 에러 코드
            if (error.code === "P2025") {
                throw new Error("CATEGORY_NOT_FOUND");
            }
        }
        throw error;
    }
};

export default {
    getCategoryList,
    getCategoryById,
    createCategory,
    toggleCategoryStatus,
    updateCategory,
};
