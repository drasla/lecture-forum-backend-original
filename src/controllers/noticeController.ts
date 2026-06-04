import { Request, Response } from "express";
import noticeService from "../services/noticeService.ts";

const getNotices = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string, 10) || 1;
        const size = parseInt(req.query.size as string, 10) || 10;

        const result = await noticeService.getNotices(page, size);
        res.status(200).json({ message: "공지사항 목록 조회 성공", data: result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "공지사항 목록 조회 중 서버 에러가 발생했습니다." });
    }
};

const getNoticeById = async (req: Request<{ id: string }>, res: Response) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) return res.status(400).json({ message: "유효하지 않은 ID입니다." });

        const notice = await noticeService.getNoticeById(id);
        res.status(200).json({ message: "공지사항 조회 성공", data: notice });
    } catch (error) {
        if (error instanceof Error && error.message === "NOT_FOUND") {
            return res.status(404).json({ message: "존재하지 않는 공지사항입니다." });
        }
        console.error(error);
        res.status(500).json({ message: "공지사항 조회 중 서버 에러가 발생했습니다." });
    }
};

export default {
    getNotices,
    getNoticeById,
};
