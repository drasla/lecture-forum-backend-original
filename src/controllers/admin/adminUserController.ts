import { Request, Response } from "express";
import adminUserService from "../../services/admin/adminUserService.ts";
import { AdminCreateUserInputType } from "../../schemas/admin/user/adminCreateUser.ts";
import { AdminUpdateUserInputType } from "../../schemas/admin/user/adminUpdateUser.ts";
import passwordUtil from "../../utils/password/passwordUtil.ts";
import { UserCreateInput, UserUpdateInput } from "../../generated/prisma/models/User.ts";

const createUser = async (req: Request, res: Response) => {
    try {
        const data: AdminCreateUserInputType = req.body;
        const { password, phoneNumber, birthdate, ...restData } = data;
        // 💡 이전 구조처럼 컨트롤러에서 비밀번호 암호화 후 데이터 객체 재조립
        const userData: UserCreateInput = {
            ...restData,
            password: await passwordUtil.hashPassword(password),
            phoneNumber: phoneNumber ?? null,
            birthdate: birthdate ? new Date(birthdate) : null,
        };

        const newUser = await adminUserService.createUser(userData);

        res.status(201).json({ message: "유저가 성공적으로 생성되었습니다.", data: newUser });
    } catch (error) {
        if (error instanceof Error) {
            // 💡 Service에서 던진 Custom Error 분기 처리
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
            }
        }
        res.status(500).json({ message: "유저 생성 중 오류가 발생했습니다." });
    }
};

const getUserList = async (req: Request, res: Response) => {
    try {
        const users = await adminUserService.getUserList();
        res.status(200).json({ message: "유저 목록을 성공적으로 불러왔습니다.", data: users });
    } catch (error) {
        res.status(500).json({ message: "서버 에러가 발생했습니다." });
    }
};

const getUserById = async (req: Request<{ id: string }>, res: Response) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ message: "유효하지 않은 유저 ID입니다." });
            return;
        }

        const user = await adminUserService.getUserById(id);
        res.status(200).json({ message: "유저 정보를 성공적으로 불러왔습니다.", data: user });
    } catch (error) {
        if (error instanceof Error && error.message === "USER_NOT_FOUND") {
            res.status(404).json({ message: "유저를 찾을 수 없습니다." });
            return;
        }
        res.status(500).json({ message: "서버 에러가 발생했습니다." });
    }
};

const updateUser = async (req: Request<{ id: string }>, res: Response) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ message: "유효하지 않은 유저 ID입니다." });
            return;
        }

        const data: AdminUpdateUserInputType = req.body;
        const { password, phoneNumber, birthdate, ...restData } = data;

        const updateData: UserUpdateInput = {
            ...restData,
        };

        // 값이 입력된 경우에만 덮어씌웁니다 (undefined 에러 방지)
        if (password) {
            updateData.password = await passwordUtil.hashPassword(password);
        }
        if (phoneNumber !== undefined) {
            updateData.phoneNumber = phoneNumber ?? null;
        }
        if (birthdate !== undefined) {
            updateData.birthdate = birthdate ? new Date(birthdate) : null;
        }

        const updatedUser = await adminUserService.updateUser(id, updateData);
        res.status(200).json({
            message: "유저 정보가 성공적으로 수정되었습니다.",
            data: updatedUser,
        });
    } catch (error) {
        if (error instanceof Error) {
            switch (error.message) {
                case "USER_NOT_FOUND":
                    res.status(404).json({ message: "유저를 찾을 수 없습니다." });
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

const deleteUser = async (req: Request<{ id: string }>, res: Response) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ message: "유효하지 않은 유저 ID입니다." });
            return;
        }

        const deletedUser = await adminUserService.deleteUser(id);
        res.status(200).json({ message: "유저가 성공적으로 삭제되었습니다.", data: deletedUser });
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
    createUser,
    getUserList,
    getUserById,
    updateUser,
    deleteUser,
};
