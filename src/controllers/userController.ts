import userService from "../services/userService.ts";
import { Request, Response } from "express";
import { UserCreateInput } from "../generated/prisma/models/User.ts";
import passwordUtil from "../utils/password/passwordUtil.ts";
import { LoginInputType } from "../schemas/user/login.ts";
import { AuthRequest } from "../middlewares/auth.ts";
import { UpdateUserInputType } from "../schemas/user/updateUserSchema.ts";
import { UpdatePasswordInputType } from "../schemas/user/updatePasswordSchema.ts";

const createUser = async (req: Request, res: Response) => {
    try {
        const { username, password, name, nickname, email, phoneNumber, birthdate, gender } =
            req.body;

        const userData: UserCreateInput = {
            username,
            password: await passwordUtil.hashPassword(password),
            name,
            nickname,
            email,
            phoneNumber,
            birthdate: birthdate ? new Date(birthdate) : null,
            gender,
        };

        const newUser = await userService.createUser(userData);

        res.status(201).json(newUser);
    } catch (error) {
        if (error instanceof Error) {
            // Service에서 던진 Custom Error 분기 처리
            switch (error.message) {
                case "ALREADY_EXISTS_USERNAME":
                    res.status(409).json({ message: "이미 사용 중인 아이디입니다." });
                    return;
                case "ALREADY_EXISTS_EMAIL":
                    res.status(409).json({ message: "이미 가입된 이메일입니다." });
                    return;
                case "ALREADY_EXISTS_NICKNAME":
                    res.status(409).json({ message: "이미 사용 중인 닉네임입니다." });
                    return;
            }
        }

        console.log(error);
        res.status(500).json({ message: "유저 생성 중 오류가 발생했습니다." });
    }
};

const updateUser = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.id;
        const data: UpdateUserInputType = req.body;

        const updatedUser = await userService.updateUser(userId, data);
        res.status(200).json({
            message: "회원 정보가 성공적으로 수정되었습니다.",
            data: updatedUser,
        });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "ALREADY_EXISTS_NICKNAME") {
                return res.status(409).json({ message: "이미 사용 중인 닉네임입니다." });
            }
            if (error.message === "ALREADY_EXISTS_EMAIL") {
                return res.status(409).json({ message: "이미 사용 중인 이메일입니다." });
            }
        }
        console.error(error);
        res.status(500).json({ message: "회원 정보 수정 중 오류가 발생했습니다." });
    }
};

const updatePassword = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.id;
        const { currentPassword, newPassword }: UpdatePasswordInputType = req.body;

        await userService.updatePassword(userId, currentPassword, newPassword);
        res.status(200).json({ message: "비밀번호가 성공적으로 변경되었습니다." });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "NOT_FOUND_USER") {
                return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
            }
            if (error.message === "INVALID_CURRENT_PASSWORD") {
                return res.status(401).json({ message: "현재 비밀번호가 일치하지 않습니다." });
            }
        }
        console.error(error);
        res.status(500).json({ message: "비밀번호 변경 중 오류가 발생했습니다." });
    }
};

const login = async (req: Request, res: Response) => {
    try {
        // validate 미들웨어를 통과했으므로 타입이 보장됩니다.
        const loginData: LoginInputType = req.body;

        const result = await userService.login(loginData);

        res.status(200).json({
            message: "로그인에 성공했습니다.",
            data: result,
        });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "INVALID_CREDENTIALS") {
                res.status(401).json({ message: "아이디 또는 비밀번호가 일치하지 않습니다." });
                return;
            }
        }

        console.error(error);
        res.status(500).json({ message: "로그인 처리 중 서버 에러가 발생했습니다." });
    }
};

export default {
    createUser,
    updateUser,
    updatePassword,
    login,
};
