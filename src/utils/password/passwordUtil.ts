import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

// 비밀번호 암호화
export const hashPassword = async (password: string): Promise<string> => {
    return await bcrypt.hash(password, SALT_ROUNDS);
};

// 비밀번호 검증
export const verifyPassword = async (
    plainPassword: string,
    hashedPassword: string,
): Promise<boolean> => {
    return await bcrypt.compare(plainPassword, hashedPassword);
};

export default {
    hashPassword,
    verifyPassword,
};
