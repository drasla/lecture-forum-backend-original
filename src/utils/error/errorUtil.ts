import { Prisma } from "../../generated/prisma/client.ts"; // 프로젝트 환경에 맞게 경로 확인

export const handlePrismaDuplicateError = (error: unknown) => {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
            const target = error.meta?.target as string[];

            if (target?.includes("username")) throw new Error("ALREADY_EXISTS_USERNAME");
            if (target?.includes("email")) throw new Error("ALREADY_EXISTS_EMAIL");
            if (target?.includes("nickname")) throw new Error("ALREADY_EXISTS_NICKNAME");

            throw new Error("ALREADY_EXISTS_DATA");
        }
    }
    // Prisma P2002 에러가 아니라면 원래 에러를 그대로 던짐
    throw error;
};

export default {
    handlePrismaDuplicateError,
};
