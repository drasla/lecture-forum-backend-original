import { Router } from "express";
import { validate } from "../../../middlewares/validate.ts";
import { adminCreateUserSchema } from "../../../schemas/admin/user/adminCreateUser.ts";
import adminUserController from "../../../controllers/admin/adminUserController.ts";
import { adminUpdateUserSchema } from "../../../schemas/admin/user/adminUpdateUser.ts";

const router = Router();

router.post("/create", validate(adminCreateUserSchema), adminUserController.createUser);
router.get("/list", adminUserController.getUserList);
router.get("/:id", adminUserController.getUserById);
router.patch("/:id", validate(adminUpdateUserSchema), adminUserController.updateUser);
router.delete("/:id", adminUserController.deleteUser);

export default router;
