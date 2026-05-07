import prisma from "../config/prisma.ts";
import { UserCreateInput } from "../generated/prisma/models/User.ts";
import { Prisma } from "../generated/prisma/client.ts";
import { verifyPassword } from "../utils/password/passwordUtil.ts";
import { LoginInputType } from "../schemas/user/login.ts";
import jwtUtil from "../utils/jwt/jwtUtil.ts";

const createUser = async (data: UserCreateInput) => {
    try {
        return prisma.user.create({
            data,
        });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            // 💡 2. P2002 코드는 'Unique constraint failed (중복 데이터)'를 의미합니다.
            if (error.code === "P2002") {
                // error.meta.target 에는 중복이 발생한 컬럼명이 배열로 들어있습니다. (예: ['email'])
                const target = error.meta?.target as string[];

                if (target?.includes("username")) {
                    throw new Error("ALREADY_EXISTS_USERNAME");
                }
                if (target?.includes("email")) {
                    throw new Error("ALREADY_EXISTS_EMAIL");
                }
                if (target?.includes("nickname")) {
                    throw new Error("ALREADY_EXISTS_NICKNAME");
                }

                throw new Error("ALREADY_EXISTS_DATA");
            }
        }

        // Prisma P2002 에러가 아니라면 예상치 못한 에러이므로 그대로 다시 던집니다.
        throw error;
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
