import { Request, Response } from "express";
import categoryService from "../services/categoryService.ts";

const getActiveCategories = async (req: Request, res: Response) => {
    try {
        const categories = await categoryService.getActiveCategories();
        res.status(200).json({
            message: "카테고리 목록을 성공적으로 불러왔습니다.",
            data: categories,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "서버 에러가 발생했습니다." });
    }
};

export default {
    getActiveCategories,
};
