import { Request, Response } from "express";
import adminDashboardService from "../../services/admin/adminDashboardService.ts";

const getDashboardSummary = async (req: Request, res: Response) => {
    try {
        const limit = Number(req.query.limit) || 5;

        const summaryData = await adminDashboardService.getDashboardSummary(limit);

        res.status(200).json({
            message: "관리자 대시보드 요약 데이터를 성공적으로 불러왔습니다.",
            data: summaryData,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "관리자 대시보드 데이터 조회 중 서버 에러가 발생했습니다.",
        });
    }
};

export default {
    getDashboardSummary,
};
