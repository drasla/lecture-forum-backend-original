import jwt, { SignOptions } from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "fallback_secret";

export const generateToken = (userId: number): string => {
    return jwt.sign({ id: userId }, SECRET, {
        expiresIn: "1d",
    });
};

export default {
    generateToken,
};
