import prisma from "../config/prisma.ts";

// 💡 1. 댓글 작성
const createReply = async (postId: number, userId: number, content: string) => {
    // 게시글이 존재하는지, 삭제되진 않았는지 확인
    const post = await prisma.post.findFirst({
        where: { id: postId, deletedAt: null },
    });

    if (!post) {
        throw new Error("NOT_FOUND_POST");
    }

    return prisma.reply.create({
        data: {
            content,
            postId,
            userId,
        },
        include: {
            user: {
                select: { id: true, nickname: true },
            },
        },
    });
};

// 💡 2. 특정 게시글의 댓글 목록 조회 (오래된 순 정렬)
const getRepliesByPostId = async (postId: number, page: number = 1, size: number = 10) => {
    const skip = (page - 1) * size;

    const total = await prisma.reply.count({
        where: { postId },
    });

    const list = await prisma.reply.findMany({
        where: { postId },
        skip,
        take: size,
        orderBy: { id: "asc" }, // 일반적인 커뮤니티처럼 먼저 쓴 댓글이 위에 오도록 정렬
        include: {
            user: {
                select: { id: true, nickname: true },
            },
        },
    });

    return { total, list };
};

const updateReply = async (id: number, userId: number, content: string) => {
    // 1. 수정할 댓글이 존재하는지 확인
    const reply = await prisma.reply.findUnique({
        where: { id },
    });

    if (!reply) {
        throw new Error("NOT_FOUND_REPLY");
    }

    // 2. 본인이 작성한 댓글인지 확인 (권한 검증)
    if (reply.userId !== userId) {
        throw new Error("FORBIDDEN");
    }

    // 3. 내용 업데이트
    return prisma.reply.update({
        where: { id },
        data: { content },
    });
};

// 💡 3. 댓글 완전 삭제 (하드 삭제)
const deleteReply = async (id: number, userId: number) => {
    const reply = await prisma.reply.findUnique({
        where: { id },
    });

    if (!reply) {
        throw new Error("NOT_FOUND_REPLY");
    }

    if (reply.userId !== userId) {
        throw new Error("FORBIDDEN"); // 본인이 쓴 댓글만 삭제 가능
    }

    // 하드 삭제 진행
    return prisma.reply.delete({
        where: { id },
    });
};

export default {
    createReply,
    getRepliesByPostId,
    updateReply,
    deleteReply,
};
