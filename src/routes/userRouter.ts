import { Router } from "express";
import userController from "../controllers/userController.ts";
import { validate } from "../middlewares/validate.ts";
import { createUserSchema } from "../schemas/user/createUser.ts";
import { loginSchema } from "../schemas/user/login.ts";
import { authenticate } from "../middlewares/auth.ts";
import { updateUserSchema } from "../schemas/user/updateUserSchema.ts";
import { updatePasswordSchema } from "../schemas/user/updatePasswordSchema.ts";
import { withdrawUserSchema } from "../schemas/user/withdrawUserSchema.ts";

const router = Router();

router.post("/create", validate(createUserSchema), userController.createUser);
router.post("/login", validate(loginSchema), userController.login);
router.patch("/update", authenticate, validate(updateUserSchema), userController.updateUser);
router.patch("/password", authenticate, validate(updatePasswordSchema), userController.updatePassword);

// 회원탈퇴 => 실제 데이터베이스에서 그 데이터를 삭제하지 않을 것임
//            소프트삭제를 통해 deletedAt에 탈퇴 시간을 기록하는 방식으로 처리
//            patch로 진행해도 말이 되고, delete로 진행해도 말이 됨
router.patch("/withdraw", authenticate, validate(withdrawUserSchema), userController.withdrawUser);


export default router;
