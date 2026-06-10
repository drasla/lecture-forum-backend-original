import prisma from "../config/prisma.ts";

const getInquiryList = async (page: number, size: number, userId?: number) => {
    const skip = (page - 1) * size;

    // prisma에 where이나 다른 절들의 조건을 걸 때 그 안에 항목이 존재하면 그걸로 검색 조건을 씀
    // where절을 안 걸려면, 항목 자체가 없어야 함
    const whereCondition = userId ? { userId } : {};
    const total = await prisma.inquiry.count({
        where: whereCondition,
    });

    const list = await prisma.inquiry.findMany({
        orderBy: { id: "desc" },
        where: whereCondition,
        include: {
            user: {
                select: {
                    id: true,
                    nickname: true,
                    email: true,
                },
            },
        },
        skip,
        take: size,
    });

    return {
        page,
        size,
        total,
        list,
    };
};

const getInquiryById = async (inquiryId: number) => {
    const inquiry = await prisma.inquiry.findUnique({
        where: {
            id: inquiryId,
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
    if (!inquiry) {
        throw new Error("NOT_FOUND_INQUIRY");
    }
    return inquiry;
};

const createInquiry = async (title: string, content: string, userId: number) => {
    return prisma.inquiry.create({
        data: {
            title,
            content,
            userId,
        },
    });
};

const answerInquiry = async (inquiryId: number, answer?: string) => {
    // 답변 글을 달려면, 당연히 그 대상인 글이 존재하는지 여부를 따져줘야 함
    await getInquiryById(inquiryId);

    return prisma.inquiry.update({
        where: {
            id: inquiryId,
        },
        data: {
            answer: answer ? answer : null,
            answeredAt: answer ? new Date() : null,
        },
    });
};

const updateInquiry = async (inquiryId: number, title: string, content: string, userId: number) => {
    // 업데이트 하기 전 게시물이 있는지 체크
    const inquiry = await getInquiryById(inquiryId);

    // 이 게시물이 이 사람껀지 확인
    if (inquiry.userId !== userId) {
        throw new Error("NOT_YOUR_INQUIRY");
    }

    // 관리자가 한 답변이 있으면 처리 불가
    if (inquiry.answer) {
        throw new Error("ALREADY_ANSWERED");
    }

    // 업데이트
    return prisma.inquiry.update({
        where: {
            id: inquiryId,
        },
        data: {
            title,
            content,
        },
    });
};

const deleteInquiry = async (inquiryId: number) => {
    return prisma.inquiry.delete({
        where: {
            id: inquiryId,
        },
    });
};

export default {
    getInquiryList,
    getInquiryById,
    createInquiry,
    answerInquiry,
    updateInquiry,
    deleteInquiry,
};
