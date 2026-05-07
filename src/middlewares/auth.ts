import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma";
import { RoleType, User } from "../generated/prisma/client";
import jwtUtil from "../utils/jwt/jwtUtil.ts";

// 💡 1. Express의 Request를 확장하여 user 속성을 추가한 커스텀 타입 정의
// 비밀번호 등 민감한 정보는 Omit으로 제외하는 것이 안전합니다.
export interface AuthRequest extends Request {
    user?: Omit<User, "password" | "deletedAt">;
}

export const authenticate = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
): Promise<void> => {
    try {
        // 2. HTTP 헤더에서 Authorization 추출 (형식: "Bearer <토큰>")
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({ error: "로그인이 필요한 서비스입니다. (토큰 없음)" });
            return;
        }

        // 3. "Bearer " 문자열을 떼어내고 실제 토큰만 추출
        const token = authHeader.split(" ")[1];
        if (!token) {
            res.status(401).json({ error: "토큰이 비어있거나 형식이 올바르지 않습니다." });
            return;
        }

        // 4. 토큰 검증 및 복호화 (우리가 jwt.sign에서 넣었던 { id: userId } 가 나옵니다)
        const decoded = jwtUtil.verifyToken(token);

        // 5. 복호화된 ID로 실제 DB에 유저가 존재하는지(탈퇴하진 않았는지) 한 번 더 확인
        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
        });

        if (!user || user.deletedAt) {
            res.status(401).json({ error: "유효하지 않은 유저이거나 탈퇴한 계정입니다." });
            return;
        }

        // 6. 안전한 유저 정보만 발라내서 req.user에 담아 다음 컨트롤러로 넘겨줌!
        const { password, deletedAt, ...safeUser } = user;
        req.user = safeUser;

        next(); // 다음 미들웨어나 컨트롤러로 이동
    } catch (error) {
        // 💡 jwt 라이브러리에서 발생하는 대표적인 에러 두 가지를 예쁘게 처리
        if (error instanceof jwt.TokenExpiredError) {
            res.status(401).json({ error: "인증 토큰이 만료되었습니다. 다시 로그인해주세요." });
            return;
        }
        if (error instanceof jwt.JsonWebTokenError) {
            res.status(401).json({ error: "유효하지 않은 인증 토큰입니다." });
            return;
        }

        console.error(error);
        res.status(500).json({ error: "인증 처리 중 서버 에러가 발생했습니다." });
    }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
        res.status(401).json({ error: "인증 정보가 없습니다. 먼저 로그인해주세요." });
        return;
    }

    if (req.user.role !== RoleType.ADMIN) {
        res.status(403).json({ error: "해당 기능에 접근할 수 있는 관리자 권한이 없습니다." });
        return;
    }

    next();
};
