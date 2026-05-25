import prisma from "../config/prisma.ts";

const getPostByCategory = async (categoryId: number, page: number = 1, size: number = 10) => {
    const skip = (page - 1) * size;

    const whereCondition = {
        categoryId,
        deletedAt: null,
    };

    const total = await prisma.post.count({
        where: {
            categoryId,
            deletedAt: null,
        },
    });

    const list = await prisma.post.findMany({
        where: whereCondition,
        skip,
        take: size,
        orderBy: { id: "desc" },
        include: {
            user: {
                select: {
                    id: true,
                    nickname: true,
                    name: true,
                },
            },
        },
    });

    return { total, list };
};

export default {
    getPostByCategory,
};
