import prisma from "../config/prisma.ts";
import { PostCreateInput, PostUpdateInput } from "../generated/prisma/models/Post.ts";

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

const getPostById = async (id: number, userId?: number) => {
    const post = await prisma.post.findFirst({
        where: {
            id,
            deletedAt: null,
        },
        include: {
            user: {
                select: {
                    id: true,
                    nickname: true,
                    name: true,
                },
            },
            category: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    });

    if (!post) {
        return null;
    }

    const option1Count = await prisma.vote.count({
        where: { postId: id, option: 1 },
    });

    const option2Count = await prisma.vote.count({
        where: { postId: id, option: 2 },
    });

    let hasVoted = false;
    if (userId) {
        const myVote = await prisma.vote.findUnique({
            where: {
                userId_postId: { userId, postId: id },
            },
        });

        if (myVote) {
            hasVoted = true;
        }
    }

    await prisma.post.update({
        where: {
            id,
        },
        data: {
            views: { increment: 1 },
        },
    });

    return {
        ...post,
        views: post.views + 1,
        vote: { option1Count, option2Count, totalCount: option1Count + option2Count, hasVoted },
    };
};

const createPost = async (data: PostCreateInput) => {
    return prisma.post.create({
        data,
        include: {
            user: {
                select: {
                    id: true,
                    nickname: true,
                    name: true,
                },
            },
            category: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    });
};

const updatePost = async (id: number, userId: number, data: PostUpdateInput) => {
    const post = await prisma.post.findFirst({
        where: { id, deletedAt: null },
    });

    if (!post) {
        throw new Error("NOT_FOUND"); // 게시글이 없거나 삭제됨
    }

    if (post.userId !== userId) {
        throw new Error("FORBIDDEN"); // 작성자가 아님
    }

    // 2. 권한이 확인되면 업데이트 수행
    return prisma.post.update({
        where: { id },
        data,
        include: {
            user: { select: { id: true, nickname: true, name: true } },
            category: { select: { id: true, name: true } },
        },
    });
};

const deletePost = async (id: number, userId: number) => {
    const post = await prisma.post.findFirst({
        where: { id, deletedAt: null },
    });

    if (!post) {
        throw new Error("NOT_FOUND");
    }

    if (post.userId !== userId) {
        throw new Error("FORBIDDEN"); // 작성자가 아니면 삭제 불가
    }

    // 2. 소프트 삭제 처리 (deletedAt에 현재 시간 기록)
    return prisma.post.update({
        where: { id },
        data: {
            deletedAt: new Date(),
        },
    });
};

export default {
    getPostByCategory,
    getPostById,
    createPost,
    updatePost,
    deletePost,
};
