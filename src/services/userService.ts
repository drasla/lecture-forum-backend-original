import prisma from "../config/prisma.ts";
import { UserCreateInput } from "../generated/prisma/models/User.ts";
import { verifyPassword } from "../utils/password/passwordUtil.ts";
import { LoginInputType } from "../schemas/user/login.ts";
import jwtUtil from "../utils/jwt/jwtUtil.ts";
import errorUtil from "../utils/error/errorUtil.ts";

const createUser = async (data: UserCreateInput) => {
    try {
        return prisma.user.create({
            data,
        });
    } catch (error) {
        errorUtil.handlePrismaDuplicateError(error);
    }
};

const login = async (data: LoginInputType) => {
    // 1. 아이디로 유저 찾기
    const user = await prisma.user.findUnique({
        where: { username: data.username },
    });

    // 유저가 없거나 탈퇴한(deletedAt이 있는) 유저인 경우
    if (!user || user.deletedAt) {
        throw new Error("INVALID_CREDENTIALS");
    }

    // 2. 비밀번호 일치 여부 확인 (평문 vs DB의 해싱된 비밀번호)
    const isPasswordValid = await verifyPassword(data.password, user.password);
    if (!isPasswordValid) {
        throw new Error("INVALID_CREDENTIALS");
    }

    // 3. 인증 성공 시 JWT 발급
    const token = jwtUtil.generateToken(user.id);

    // 4. 응답할 때 비밀번호는 빼고 안전한 정보만 반환 (Omit 처리)
    const { password, deletedAt, ...safeUserInfo } = user;

    return {
        user: safeUserInfo,
        token,
    };
};

export default {
    createUser,
    login,
};
