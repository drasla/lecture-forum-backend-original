import prisma from "../config/prisma.ts";

// 💡 1. 공지사항 생성
const createNotice = async (title: string, content: string) => {
    return prisma.notice.create({
        data: { title, content },
    });
};

// 💡 2. 공지사항 목록 조회 (페이지네이션)
const getNotices = async (page: number = 1, size: number = 10) => {
    const skip = (page - 1) * size;

    const total = await prisma.notice.count();
    const list = await prisma.notice.findMany({
        skip,
        take: size,
        orderBy: { id: "desc" }, // 최신 공지가 위로 오도록 정렬
    });

    return { total, list };
};

// 💡 3. 공지사항 상세 조회
const getNoticeById = async (id: number) => {
    const notice = await prisma.notice.findUnique({
        where: { id },
    });
    if (!notice) throw new Error("NOT_FOUND");
    return notice;
};

// 💡 4. 공지사항 수정
const updateNotice = async (id: number, title: string, content: string) => {
    // 존재 여부 먼저 확인
    await getNoticeById(id);

    return prisma.notice.update({
        where: { id },
        data: { title, content },
    });
};

// 💡 5. 공지사항 삭제
const deleteNotice = async (id: number) => {
    await getNoticeById(id);

    return prisma.notice.delete({
        where: { id },
    });
};

export default {
    createNotice,
    getNotices,
    getNoticeById,
    updateNotice,
    deleteNotice,
};
