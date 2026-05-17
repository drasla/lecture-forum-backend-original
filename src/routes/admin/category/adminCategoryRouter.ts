import { Router } from "express";
import { createCategorySchema } from "../../../schemas/admin/category/createCategory.ts";
import categoryController from "../../../controllers/admin/categoryController.ts";
import { validate } from "../../../middlewares/validate.ts";

const router = Router();

// [POST] /admin/category/create
router.post("/create", validate(createCategorySchema), categoryController.createCategory);
router.get("/list", categoryController.getCategoryList);

export default router;
