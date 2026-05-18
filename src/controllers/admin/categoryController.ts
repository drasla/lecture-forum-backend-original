import { Request, Response } from "express";
import { CreateCategoryInputType } from "../../schemas/admin/category/createCategory.ts";
import categoryService from "../../services/admin/categoryService.ts";
import { UpdateCategoryInputType } from "../../schemas/admin/category/updateCategory.ts";

const createCategory = async (req: Request, res: Response) => {
    try {
        // validate 미들웨어를 통과했으므로 body에는 타입이 보장된 name이 존재합니다.
        const { name }: CreateCategoryInputType = req.body;

        const newCategory = await categoryService.createCategory(name);

        res.status(201).json({
            message: "카테고리가 성공적으로 생성되었습니다.",
            data: newCategory,
        });
    } catch (error) {
        if (error instanceof Error) {
            // Service에서 던진 Custom Error 분기 처리
            if (error.message === "ALREADY_EXISTS_CATEGORY_NAME") {
                res.status(409).json({ message: "이미 존재하는 카테고리명입니다." });
                return;
            }
        }

        console.error(error);
        res.status(500).json({ message: "카테고리 생성 중 서버 에러가 발생했습니다." });
    }
};

const getCategoryList = async (req: Request, res: Response) => {
    try {
        const categories = await categoryService.getCategoryList();

        res.status(200).json({
            message: "카테고리 목록을 성공적으로 불러왔습니다.",
            data: categories,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "카테고리 목록 조회 중 서버 에러가 발생했습니다." });
    }
};

const updateCategory = async (req: Request<{ id: string }>, res: Response) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ message: "유효하지 않은 카테고리 ID입니다." });
            return;
        }

        const { name }: UpdateCategoryInputType = req.body;
        const updatedCategory = await categoryService.updateCategory(id, name);

        res.status(200).json({
            message: "카테고리가 성공적으로 수정되었습니다.",
            data: updatedCategory,
        });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "ALREADY_EXISTS_CATEGORY_NAME") {
                res.status(409).json({ message: "이미 존재하는 카테고리명입니다." });
                return;
            }
            if (error.message === "CATEGORY_NOT_FOUND") {
                res.status(404).json({ message: "카테고리를 찾을 수 없습니다." });
                return;
            }
        }
        res.status(500).json({ message: "서버 에러가 발생했습니다." });
    }
};

// 💡 2. 카테고리 상태 토글 컨트롤러 (소프트 삭제 기능)
const toggleCategoryStatus = async (req: Request<{ id: string }>, res: Response) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ message: "유효하지 않은 카테고리 ID입니다." });
            return;
        }

        const updatedCategory = await categoryService.toggleCategoryStatus(id);

        res.status(200).json({
            message: `카테고리가 ${updatedCategory.status === "ACTIVE" ? "활성화" : "비활성화"} 되었습니다.`,
            data: updatedCategory,
        });
    } catch (error) {
        if (error instanceof Error && error.message === "CATEGORY_NOT_FOUND") {
            res.status(404).json({ message: "카테고리를 찾을 수 없습니다." });
            return;
        }
        res.status(500).json({ message: "서버 에러가 발생했습니다." });
    }
};

export default {
    createCategory,
    getCategoryList,
    updateCategory,
    toggleCategoryStatus,
};
