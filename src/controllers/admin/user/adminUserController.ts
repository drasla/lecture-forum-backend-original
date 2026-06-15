import { Request, Response } from "express";
import adminUserService from "../../../services/admin/user/adminUserService.ts";
import { AdminCreateUserInputType } from "../../../schemas/admin/user/createUser.ts";
import { UserCreateInput, UserUpdateInput } from "../../../generated/prisma/models/User.ts";
import passwordUtil from "../../../utils/password/passwordUtil.ts";
import { AdminUpdateUserInputType } from "../../../schemas/admin/user/updateUser.ts";

const getUserList = async (req: Request, res: Response) => {
    try {
        // 쿼리 스트링은 있을 수도 있고 없을 수도 있음. 그리고 형변환도 안될 수 있음
        const page = Number(req.query.page) || 1;
        const size = Number(req.query.size) || 20;

        const users = await adminUserService.getUserList(page, size);
        res.status(200).json({
            message: "유저 목록을 성공적으로 불러왔습니다.",
            data: users,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "유저 목록을 불러오는 중 오류가 발생했습니다.",
        });
    }
};

const getUserById = async (req: Request<{ id: string }>, res: Response) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            res.status(400).json({
                message: "유효하지 않은 사용자 ID입니다.",
            });
            return;
        }

        const user = await adminUserService.getUserById(id);

        res.status(200).json({
            message: "유저 정보를 성공적으로 불러왔습니다.",
            data: user,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "유저 목록을 불러오는 중 오류가 발생했습니다.",
        });
    }
};

const createUser = async (req: Request, res: Response) => {
    try {
        // 사용자가 입력한 값을 그대로 DB에 쓰면 안됨
        // 1. 왜? 비밀번호가 평문이니까. 암호화해서 서비스에게 넘겨줘야 함
        // 2. 타입이 안 맞음. birthdate가 string으로 옴. 이걸 Date 타입으로 바꿔줘야 함

        // 프론트엔드에서 전달된 값들이 들어있는 req.body의 타입은?
        const { password, birthdate, phoneNumber, ...restData }: AdminCreateUserInputType =
            req.body;

        // 데이터베이스에서 생성할 때 집어넣을 내용으로 변환
        const newUser: UserCreateInput = {
            ...restData,
            password: await passwordUtil.hashPassword(password),
            phoneNumber: phoneNumber ?? null, // phoneNumber가 있으면 그 값을 쓰고, 없으면 null
            birthdate: birthdate ? new Date(birthdate) : null,
        };

        const result = await adminUserService.createUser(newUser);

        res.status(201).json({
            message: "유저를 성공적으로 생성했습니다.",
            data: result,
        });
    } catch (error) {
        if (error instanceof Error) {
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
                default:
                    console.log(error);
                    res.status(500).json({ message: "유저 생성 중 오류가 발생했습니다." });
            }
        }

        console.log(error);
        res.status(500).json({ message: "유저 생성 중 오류가 발생했습니다." });
    }
};

const updateUser = async (req: Request<{ id: string }>, res: Response) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            res.status(400).json({ message: "유효하지 않은 사용자 ID입니다." });
            return;
        }

        const { password, birthdate, phoneNumber, ...restData }: AdminUpdateUserInputType =
            req.body;

        // 데이터베이스에서 생성할 때 집어넣을 내용으로 변환
        const newUser: UserUpdateInput = {
            ...restData,
        };

        // 업데이트할 데이터에 null을 집어넣어버리면,
        // prisma (DB)는 그 칼럼의 값을 <null>로 바꿔버림, 즉 있던 값을 삭제해버림
        if (password) {
            newUser.password = await passwordUtil.hashPassword(password);
        }
        if (phoneNumber) {
            newUser.phoneNumber = phoneNumber;
        }
        if (birthdate) {
            newUser.birthdate = new Date(birthdate);
        }

        const result = await adminUserService.updateUser(newUser, id);

        res.status(201).json({
            message: "유저를 성공적으로 생성했습니다.",
            data: result,
        });
    } catch (error) {
        if (error instanceof Error) {
            switch (error.message) {
                case "USER_NOT_FOUND":
                    res.status(404).json({ message: "사용자를 찾을 수 없습니다. " });
                    return;
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
        res.status(500).json({ message: "서버 에러가 발생했습니다." });
    }
};

// Type 옆에 <> 를 붙여서 하는건 "Generic Type" 이라고 함
const toggleUser = async (req: Request<{ id: string }>, res: Response) => {
    try {
        const id = Number(req.params.id);
        // req.params.id 즉, 그 값을 꺼내온 id 라고 하는 변수는 주소값에서 긁어왔으니 string
        if (isNaN(id)) {
            res.status(400).json({ message: "유효하지 않은 사용자 ID 입니다." });
            return;
        }

        const deletedUser = await adminUserService.toggleUser(id);
        res.status(200).json({
            message: "유저가 성공적으로 삭제되었습니다.",
            data: deletedUser,
        });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "USER_NOT_FOUND") {
                res.status(404).json({ message: "유저를 찾을 수 없습니다." });
                return;
            }
            if (error.message === "ALREADY_DELETED") {
                res.status(400).json({ message: "이미 삭제된 유저입니다." });
                return;
            }
        }
        res.status(500).json({ message: "서버 에러가 발생했습니다." });
    }
};

export default {
    getUserList,
    getUserById,
    createUser,
    updateUser,
    toggleUser,
};
