// /src/controllers/admin/adminNoticeController.ts
import { Request, Response } from "express";
import noticeService from "../../services/noticeService.ts";
import { NoticeInputType } from "../../schemas/notice/noticeSchema.ts";

const createNotice = async (req: Request, res: Response) => {
    try {
        const { title, content }: NoticeInputType = req.body;
        const newNotice = await noticeService.createNotice(title, content);

        res.status(201).json({ message: "공지사항이 성공적으로 등록되었습니다.", data: newNotice });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "공지사항 등록 중 서버 에러가 발생했습니다." });
    }
};

const updateNotice = async (req: Request<{ id: string }>, res: Response) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ message: "유효하지 않은 ID입니다." });
        }

        const { title, content }: NoticeInputType = req.body;
        const updatedNotice = await noticeService.updateNotice(id, title, content);

        res.status(200).json({ message: "공지사항이 수정되었습니다.", data: updatedNotice });
    } catch (error) {
        if (error instanceof Error && error.message === "NOT_FOUND") {
            return res.status(404).json({ message: "존재하지 않는 공지사항입니다." });
        }
        console.error(error);
        res.status(500).json({ message: "공지사항 수정 중 서버 에러가 발생했습니다." });
    }
};

const deleteNotice = async (req: Request<{ id: string }>, res: Response) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ message: "유효하지 않은 ID입니다." });
        }

        await noticeService.deleteNotice(id);
        res.status(200).json({ message: "공지사항이 삭제되었습니다." });
    } catch (error) {
        if (error instanceof Error && error.message === "NOT_FOUND") {
            return res.status(404).json({ message: "존재하지 않는 공지사항입니다." });
        }
        console.error(error);
        res.status(500).json({ message: "공지사항 삭제 중 서버 에러가 발생했습니다." });
    }
};

export default {
    createNotice,
    updateNotice,
    deleteNotice,
};
