import userService from "../services/userService.ts";
import { Request, Response } from "express";
import { UserCreateInput } from "../generated/prisma/models/User.ts";

const createUser = async (req: Request, res: Response) => {
    try {
        const { username, password, name, nickname, email, phoneNumber, birthdate, gender } =
            req.body;

        const userData: UserCreateInput = {
            username,
            password,
            name,
            nickname,
            email,
            phoneNumber,
            birthdate: birthdate ? new Date(birthdate) : null,
            gender,
        };

        const newUser = await userService.createUser(userData);

        res.status(201).json(newUser);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "유저 생성 중 오류가 발생했습니다." });
    }
};

export default {
    createUser,
};
