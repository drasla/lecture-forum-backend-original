import { Request, Response } from "express";
import adminCategoryService from "../../services/admin/adminCategoryService.ts";
import {
    CategoryCreateInput,
    CategoryUpdateInput,
} from "../../generated/prisma/models/Category.ts";
import { AdminCreateCategoryInputType } from "../../schemas/admin/category/createCategory.ts";
import { CategoryStatus } from "../../generated/prisma/enums.ts";

const getCategoryList = async (req: Request, res: Response) => {
    try {
        const result = await adminCategoryService.getCategoryList();

        res.status(200).json({
            message: "카테고리 목록을 성공적으로 불러왔습니다.",
            data: result,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "카테고리 목록 조회 중 서버 에러가 발생되었습니다." });
    }
};

// id 값을 기준으로 검색하는 API
const getCategoryById = async (req: Request<{ id: string }>, res: Response) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            res.status(400).json({ message: "유효하지 않은 카테고리 ID 입니다." });
            return;
        }

        const category = await adminCategoryService.getCategoryById(id);

        res.status(200).json({
            message: "카테고리를 성공적으로 불러왔습니다.",
            data: category,
        });
    } catch (error) {
        if (error instanceof Error && error.message === "CATEGORY_NOT_FOUND") {
            res.status(404).json({
                message: "존재하지 않는 카테고리입니다.",
            });
            return;
        }
        res.status(500).json({
            message: "서버 에러가 발생되었습니다.",
        });
    }
};

const createCategory = async (req: Request, res: Response) => {
    try {
        // AdminCreateCategoryInputType은 "들어오는 입력값"에 대한 타입
        // CategoryCreateInput은 "데이터베이스에 저장할 데이터"의 타입
        const { name }: AdminCreateCategoryInputType = req.body;
        const newCategory: CategoryCreateInput = { name };

        const result = await adminCategoryService.createCategory(newCategory);

        res.status(201).json({
            message: "카테고리가 성공적으로 생성되었습니다.",
            data: result,
        });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "ALREADY_EXIST_CATEGORY_NAME") {
                res.status(409).json({ message: "이미 존재하는 카테고리 이름입니다." });
                return;
            }
        }

        console.log(error);
        res.status(500).json({ message: "카테고리 생성 중 서버 에러가 발생되었습니다." });
    }
};

const toggleCategoryStatus = async (req: Request<{ id: string }>, res: Response) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            res.status(400).json({ message: "유효하지 않은 카테고리 ID입니다." });
            return;
        }

        const result = await adminCategoryService.toggleCategoryStatus(id);

        res.status(200).json({
            message: `카테고리가 ${result.status === CategoryStatus.ACTIVE ? "활성화" : "비활성화"} 되었습니다.`,
            data: result,
        });
    } catch (error) {
        if (error instanceof Error && error.message === "CATEGORY_NOT_FOUND") {
            res.status(400).json({ message: "카테고리를 찾을 수 없습니다." });
            return;
        }
        console.log(error);
        res.status(500).json({ message: "서버 에러가 발생했습니다." });
    }
};

const updateCategory = async (req: Request<{ id: string }>, res: Response) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            res.status(400).json({
                message: "유효하지 않은 카테고리 ID입니다.",
            });
            return;
        }

        // 이 기능을 동작시키는데 필요한 정보는 id와 name, 2가지 인데
        // name에 대해서는 이미 router에서 validate를 통해 검증 했고
        // id에 대해서는 위 코드로 검증 했으니
        // service로 보내면 됨

        const { name }: AdminCreateCategoryInputType = req.body;
        const updateData: CategoryUpdateInput = {
            name,
        };
        const result = await adminCategoryService.updateCategory(id, updateData);

        res.status(200).json({
            message: "카테고리가 성공적으로 수정되었습니다.",
            data: result,
        });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "ALREADY_EXIST_CATEGORY_NAME") {
                res.status(409).json({
                    message: "이미 존재하는 카테고리 명입니다.",
                });
                return;
            }
            if (error.message === "CATEGORY_NOT_FOUND") {
                res.status(404).json({ message: "카테고리를 찾을 수 없습니다." });
                return;
            }
        }
        console.log(error);
        res.status(500).json({ message: "서버 에러가 발생했습니다." });
    }
};

export default {
    getCategoryList,
    getCategoryById,
    createCategory,
    toggleCategoryStatus,
    updateCategory,
};
