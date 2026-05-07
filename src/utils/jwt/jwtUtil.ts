import jwt, { JwtPayload } from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "fallback_secret";

export interface DecodedToken extends JwtPayload {
    id: number;
}

const generateToken = (userId: number): string => {
    return jwt.sign({ id: userId }, SECRET, {
        expiresIn: "1d",
    });
};

const verifyToken = (token: string): DecodedToken => {
    return jwt.verify(token, SECRET) as DecodedToken;
};

export default {
    generateToken,
    verifyToken,
};
