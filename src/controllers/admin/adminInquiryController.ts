import { Request, Response } from "express";
import inquiryService from "../../services/inquiryService.ts";
import { InquiryAnswerInputType } from "../../schemas/inquiry/inquiryAnswerSchema.ts";

const getInquiryList = async (req: Request, res: Response) => {
    try {
        const page = Number(req.query.page) || 1;
        const size = Number(req.query.size) || 20;

        const result = await inquiryService.getInquiryList(page, size);
        res.status(200).json({
            message: "문의 목록 조회 성공",
            data: result,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "문의 목록 조회 중 서버 오류가 발생되었습니다.",
        });
    }
};

const getInquiryById = async (req: Request<{ inquiryId: string }>, res: Response) => {
    try {
        const inquiryId = Number(req.params.inquiryId);
        if (isNaN(inquiryId)) {
            res.status(400).json({
                message: "유효하지 않은 문의 ID 입니다.",
            });
            return;
        }

        const result = await inquiryService.getInquiryById(inquiryId);
        res.status(200).json({
            message: "문의 내용 조회 성공",
            data: result,
        });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "NOT_FOUND_INQUIRY") {
                res.status(404).json({
                    message: "존재하지 않는 문의글 입니다.",
                });
                return;
            }
        }

        console.log(error);
        res.status(500).json({
            message: "문의 내용 조회 중 서버 오류가 발생되었습니다.",
        });
    }
};

const answerInquiry = async (req: Request<{ inquiryId: string }>, res: Response) => {
    try {
        const inquiryId = Number(req.params.inquiryId);
        if (isNaN(inquiryId)) {
            res.status(500).json({
                message: "유효하지 않은 문의 ID 입니다.",
            });
            return;
        }

        const { answer }: InquiryAnswerInputType = req.body;

        const result = await inquiryService.answerInquiry(inquiryId, answer);
        res.status(200).json({
            message: "문의 답변 작업 성공",
            data: result,
        });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "NOT_FOUND_INQUIRY") {
                res.status(404).json({
                    message: "존재하지 않는 문의글 입니다.",
                });
                return;
            }
        }

        console.log(error);
        res.status(500).json({
            message: "문의 답변 작업 중 서버 에러가 발생되었습니다.",
        });
    }
};

const deleteInquiry = async (req: Request<{ inquiryId: string }>, res: Response) => {
    try {
        const inquiryId = Number(req.params.inquiryId);
        if (isNaN(inquiryId)) {
            res.status(500).json({
                message: "유효하지 않은 문의 ID 입니다.",
            });
            return;
        }

        await inquiryService.answerInquiry(inquiryId);
        res.status(200).json({
            message: "문의 삭제 작업 성공"
        });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "NOT_FOUND_INQUIRY") {
                res.status(404).json({
                    message: "존재하지 않는 문의글 입니다.",
                });
                return;
            }
        }

        console.log(error);
        res.status(500).json({
            message: "문의 삭제 작업 중 서버 에러가 발생되었습니다.",
        });
    }
};

export default {
    getInquiryList,
    getInquiryById,
    answerInquiry,
    deleteInquiry,
};
