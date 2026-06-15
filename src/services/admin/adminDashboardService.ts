import prisma from "../../config/prisma.ts";

const getDashboardSummary = async (limit: number = 5) => {
    const [recentUsers, recentPosts, recentInquiries] = await Promise.all([
        prisma.user.findMany({
            where: { deletedAt: null },
            orderBy: { id: "desc" },
            take: limit,
            select: {
                id: true,
                username: true,
                nickname: true,
                createdAt: true,
            },
        }),

        prisma.post.findMany({
            where: { deletedAt: null },
            orderBy: { id: "desc" },
            take: limit,
            include: {
                user: {
                    select: {
                        id: true,
                        nickname: true,
                        email: true,
                    },
                },
            },
        }),

        prisma.inquiry.findMany({
            orderBy: { id: "desc" },
            take: limit,
            include: {
                user: {
                    select: {
                        id: true,
                        nickname: true,
                        email: true,
                    },
                },
            },
        }),
    ]);

    return {
        users: recentUsers,
        posts: recentPosts,
        inquiries: recentInquiries,
    };
};

export default {
    getDashboardSummary,
};
