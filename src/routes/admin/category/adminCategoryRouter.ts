import { Router } from "express";
import { createCategorySchema } from "../../../schemas/admin/category/createCategory.ts";
import categoryController from "../../../controllers/admin/adminCategoryController.ts";
import { validate } from "../../../middlewares/validate.ts";
import { updateCategorySchema } from "../../../schemas/admin/category/updateCategory.ts";

const router = Router();

router.post("/create", validate(createCategorySchema), categoryController.createCategory);
router.get("/list", categoryController.getCategoryList);
router.get("/:id", categoryController.getCategoryById);
router.patch("/:id", validate(updateCategorySchema), categoryController.updateCategory);
router.patch("/:id/status", categoryController.toggleCategoryStatus);

export default router;
