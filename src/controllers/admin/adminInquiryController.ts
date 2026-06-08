import { Request, Response } from "express";
import inquiryService from "../../services/inquiryService.ts";
import { AdminInquiryAnswerInputType } from "../../schemas/admin/inquiry/adminInquiryAnswerSchema.ts"; // 💡 분리된 관리자 스키마 임포트

const getInquiryList = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string, 10) || 1;
        const size = parseInt(req.query.size as string, 10) || 10;

        // userId를 넘기지 않아 모든 문의글을 조회합니다.
        const result = await inquiryService.getInquiries(page, size);
        res.status(200).json({ message: "전체 문의 목록 조회 성공", data: result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "문의 목록 조회 중 서버 에러가 발생했습니다." });
    }
};

const answerInquiry = async (req: Request<{ id: string }>, res: Response) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) return res.status(400).json({ message: "유효하지 않은 ID입니다." });

        const { answer }: AdminInquiryAnswerInputType = req.body;

        const updatedInquiry = await inquiryService.answerInquiry(id, answer);
        res.status(200).json({
            message: "답변이 성공적으로 등록되었습니다.",
            data: updatedInquiry,
        });
    } catch (error) {
        if (error instanceof Error && error.message === "NOT_FOUND") {
            return res.status(404).json({ message: "존재하지 않는 문의글입니다." });
        }
        console.error(error);
        res.status(500).json({ message: "답변 등록 중 서버 에러가 발생했습니다." });
    }
};

const getInquiryById = async (req: Request<{ id: string }>, res: Response) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) return res.status(400).json({ message: "유효하지 않은 ID입니다." });

        const inquiry = await inquiryService.getInquiryById(id);
        res.status(200).json({ message: "상세 조회 성공", data: inquiry });
    } catch (error) {
        if (error instanceof Error && error.message === "NOT_FOUND") {
            return res.status(404).json({ message: "존재하지 않는 문의글입니다." });
        }
        console.error(error);
        res.status(500).json({ message: "상세 조회 중 서버 에러가 발생했습니다." });
    }
};

export default { getInquiryList, answerInquiry, getInquiryById };
