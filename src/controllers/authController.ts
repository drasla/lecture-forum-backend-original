import { Request, Response } from "express";
import authService from "../services/authService";
import { LoginInputType } from "../schemas/user/login.ts";

const login = async (req: Request, res: Response) => {
    try {
        // validate 미들웨어를 통과했으므로 타입이 보장됩니다.
        const loginData: LoginInputType = req.body;

        const result = await authService.login(loginData);

        res.status(200).json({
            message: "로그인에 성공했습니다.",
            data: result,
        });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "INVALID_CREDENTIALS") {
                res.status(401).json({ error: "아이디 또는 비밀번호가 일치하지 않습니다." });
                return;
            }
        }

        console.error(error);
        res.status(500).json({ error: "로그인 처리 중 서버 에러가 발생했습니다." });
    }
};

export default {
    login,
};
