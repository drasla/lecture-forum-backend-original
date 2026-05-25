import { Request, Response } from "express";
import postService from "../services/postService.ts";

const getPostsByCategory = async (req: Request<{ categoryId: string }>, res: Response) => {
    try {
        const categoryId = parseInt(req.params.categoryId, 10);
        const page = parseInt(req.query.page as string, 10) || 1;
        const size = parseInt(req.query.size as string, 10) || 10;

        if (isNaN(categoryId)) {
            return res.status(400).json({ message: "유효하지 않은 카테고리 ID입니다." });
        }

        const result = await postService.getPostByCategory(categoryId, page, size);

        res.status(200).json({
            message: "게시글 목록을 성공적으로 불러왔습니다.",
            data: result,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "서버 에러가 발생했습니다." });
    }
};

export default {
    getPostsByCategory,
};
