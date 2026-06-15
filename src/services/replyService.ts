import prisma from "../config/prisma.ts";

const getRepliesByPostId = async (postId: number, page: number, size: number) => {
    // 목록을 불러오는 목적의 service니까
    // pagination도 해야되는구나 => skip, take를 써야됨
    const skip = (page - 1) * size;

    const total = await prisma.reply.count({
        where: { postId },
    });

    const list = await prisma.reply.findMany({
        where: {
            postId,
        },
        take: size,
        skip,
        orderBy: { id: "desc" },
        include: {
            user: {
                select: {
                    id: true,
                    nickname: true,
                },
            },
        },
    });

    return {
        page,
        size,
        total,
        list,
    };
};

const createReply = async (userId: number, postId: number, content: string) => {
    // 이 댓글이 달릴 글이 살아있는 글인가를 체크를 먼저 함
    // 그러면 왜 userId 살아있는 사용자는 체크 안하나요?
    // 왜냐하면, authenticate 미들웨어가 이미 사용자는 살아있는지 체크를 했기 때문
    const post = await prisma.post.findFirst({
        where: {
            id: postId,
            deletedAt: null,
        },
    });

    if (!post) {
        throw new Error("NOT_FOUND");
    }

    return prisma.reply.create({
        data: {
            userId,
            postId,
            content,
        },
        include: {
            user: {
                select: {
                    id: true,
                    nickname: true,
                    email: true,
                },
            },
        },
    });
    // 이렇게 prisma.reply.create()를 실행하면, 생성"된" Reply 객체가 리턴
};

const updateReply = async (id: number, userId: number, content: string) => {
    const reply = await prisma.reply.findUnique({
        where: {
            id,
        },
    });
    if (!reply) {
        throw new Error("NOT_FOUND_REPLY");
    }
    if (reply.userId !== userId) {
        throw new Error("FORBIDDEN");
    }

    return prisma.reply.update({
        where: {
            id,
        },
        data: {
            content,
        }
    });
}

const deleteReply = async (id: number, userId: number) => {
    const reply = await prisma.reply.findUnique({
        where: {
            id
        }
    });
    if (!reply) {
        throw new Error("NOT_FOUND_REPLY");
    }
    if (reply.userId !== userId) {
        throw new Error("FORBIDDEN");
    }

    return prisma.reply.delete({
        where: {
            id
        }
    });
}

export default {
    getRepliesByPostId,
    createReply,
    updateReply,
    deleteReply,
};
