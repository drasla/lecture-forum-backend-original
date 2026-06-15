import { Request, Response } from "express";
import categoryService from "../services/categoryService.ts";

const getActiveCategories = async (req: Request, res: Response) => {
    try {
        const list = await categoryService.getActiveCategories();
        res.status(200).json({
            message: "카테고리 목록을 성공적으로 불러왔습니다.",
            data: list,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "서버 에러가 발생했습니다.",
        });
    }
};

export default { getActiveCategories };
