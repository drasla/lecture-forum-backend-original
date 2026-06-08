import prisma from "../config/prisma.ts";

// 1. 문의 등록 (사용자)
const createInquiry = async (userId: number, title: string, content: string) => {
    return prisma.inquiry.create({
        data: { userId, title, content },
    });
};

// 2. 문의 목록 조회 (페이지네이션)
// 💡 userId가 주어지면 내 문의만, 없으면 전체 문의(관리자용)를 조회합니다.
const getInquiries = async (page: number = 1, size: number = 10, userId?: number) => {
    const skip = (page - 1) * size;
    const whereCondition = userId ? { userId } : {};

    const total = await prisma.inquiry.count({ where: whereCondition });
    const list = await prisma.inquiry.findMany({
        where: whereCondition,
        skip,
        take: size,
        orderBy: { id: "desc" }, // 최신순 정렬
        include: {
            user: { select: { nickname: true, username: true } },
        },
    });

    return { total, list };
};

// 3. 문의 상세 조회 (공용)
const getInquiryById = async (id: number) => {
    const inquiry = await prisma.inquiry.findUnique({
        where: { id },
        include: {
            user: { select: { nickname: true, username: true } },
        },
    });
    if (!inquiry) throw new Error("NOT_FOUND");
    return inquiry;
};

// 4. 문의 답변 등록/수정 (관리자 전용)
const answerInquiry = async (id: number, answer: string) => {
    await getInquiryById(id); // 존재 여부 먼저 확인

    return prisma.inquiry.update({
        where: { id },
        data: {
            answer,
            answeredAt: new Date(), // 답변 등록 시간 기록
        },
    });
};

// 5. 문의 삭제 (공용)
const deleteInquiry = async (id: number) => {
    await getInquiryById(id);
    return prisma.inquiry.delete({ where: { id } });
};

export default {
    createInquiry,
    getInquiries,
    getInquiryById,
    answerInquiry,
    deleteInquiry,
};
