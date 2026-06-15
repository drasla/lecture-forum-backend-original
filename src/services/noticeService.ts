import prisma from "../config/prisma.ts";

const getNoticeById = async (id: number) => {
    const notice = await prisma.notice.findUnique({
        where: {
            id,
        },
    });
    if (!notice) {
        throw new Error("NOT_FOUND_NOTICE");
    }
    return notice;
};

const getNoticeList = async (page: number, size: number) => {
    // prisma에게 페이지네이션을 하기 위해
    // skip과 take를 전달해줘야 하는데
    // take는 말 그대로 가져와야 되는 갯수를 뜻하고
    // skip은 데이터를 지나치는 갯수를 뜻함
    // (내가 3페이지를 보고 싶으니, 30개 데이터 이후의 15개를 가져와라)

    const list = await prisma.notice.findMany({
        orderBy: { id: "desc" },
        skip: (page - 1) * size,
        take: size,
    });
    const total = await prisma.notice.count();

    return {
        total,
        list,
    };
};

const createNotice = async (title: string, content: string) => {
    return prisma.notice.create({
        data: {
            title,
            content,
        },
    });
};

const updateNotice = async (id: number, title: string, content: string) => {
    // 그 Notice 글이 살아있는지 체크
    await getNoticeById(id);

    // 업데이트를 진행해야 함
    return prisma.notice.update({
        where: {
            id,
        },
        data: {
            title,
            content,
        },
    });
};

const deleteNotice = async (id: number) => {
    // Notice 글이 살아있는지 체크
    await getNoticeById(id);

    // Notice 글을 삭제
    return prisma.notice.delete({
        where: {
            id,
        },
    });
};

export default {
    getNoticeById,
    getNoticeList,
    createNotice,
    updateNotice,
    deleteNotice,
};
