import { Response } from "express";
import inquiryService from "../services/inquiryService.ts";
import { AuthRequest } from "../middlewares/auth.ts";
import { InquiryInputType } from "../schemas/inquiry/inquirySchema.ts";

const createInquiry = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.id;
        const { title, content }: InquiryInputType = req.body;

        const newInquiry = await inquiryService.createInquiry(userId, title, content);
        res.status(201).json({ message: "문의가 등록되었습니다.", data: newInquiry });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "문의 등록 중 서버 에러가 발생했습니다." });
    }
};

const getMyInquiries = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.id;
        const page = parseInt(req.query.page as string, 10) || 1;
        const size = parseInt(req.query.size as string, 10) || 10;

        const result = await inquiryService.getInquiries(page, size, userId);
        res.status(200).json({ message: "내 문의 목록 조회 성공", data: result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "문의 목록 조회 중 서버 에러가 발생했습니다." });
    }
};

const getInquiryById = async (req: AuthRequest<{ id: string }>, res: Response) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) return res.status(400).json({ message: "유효하지 않은 ID입니다." });

        const inquiry = await inquiryService.getInquiryById(id);

        // 💡 본인이 작성한 문의글인지 권한 체크
        if (inquiry.userId !== req.user!.id) {
            return res.status(403).json({ message: "해당 문의글을 조회할 권한이 없습니다." });
        }

        res.status(200).json({ message: "문의 상세 조회 성공", data: inquiry });
    } catch (error) {
        if (error instanceof Error && error.message === "NOT_FOUND") {
            return res.status(404).json({ message: "존재하지 않는 문의글입니다." });
        }
        console.error(error);
        res.status(500).json({ message: "문의 조회 중 서버 에러가 발생했습니다." });
    }
};

export default { createInquiry, getMyInquiries, getInquiryById };
