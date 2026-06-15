import { UserCreateInput } from "../generated/prisma/models/User.ts";
import prisma from "../config/prisma.ts";
import { Prisma } from "../generated/prisma/client.ts";
import { LoginInputType } from "../schemas/user/login.ts";
import passwordUtil from "../utils/password/passwordUtil.ts";
import jwtUtil from "../utils/jwt/jwtUtil.ts";
import { UpdateUserInputType } from "../schemas/user/updateUserSchema.ts";

const createUser = async (data: UserCreateInput) => {
    try {
        return await prisma.user.create({
            data,
        });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            // Prisma error 객체 내부에 code 항목 값이 "P2002"인 것이
            // 중복값이 있을 때의 에러코드임
            if (error.code === "P2002") {
                const errorMessage = error.message;

                // 예시. target = ["username", "nickname", "email"]
                // array의 요소 중 "이 값"이 있는지 확인하는 메서드는 .includes()
                // .find()와 비슷한 역할이지만,
                // find는 조건을 걸어서 찾을 수 있는 메서드이고 (리턴값은 찾은 그 요소)
                // includes는 단순히 집어넣은 값과 완벽히 같은 것이 있는지 true/false로 찾음
                if (errorMessage.includes("username")) {
                    // 상위 함수로 던지는데,
                    // 새로운 자바스크립트 표준 에러 객체를 만들어서 던짐.
                    // 내용에 "ALREADY_EXISTS_USERNAME"이라고 담아서.
                    throw new Error("ALREADY_EXISTS_USERNAME");
                }
                if (errorMessage.includes("email")) {
                    throw new Error("ALREADY_EXISTS_EMAIL");
                }
                if (errorMessage.includes("nickname")) {
                    throw new Error("ALREADY_EXISTS_NICKNAME");
                }
                throw new Error("UNKNOWN_ERROR");
            }
        }

        throw new Error("UNKNOWN_ERROR"); // return과 같은데 값을 리턴하는게 아니라 에러를 리턴하는 키워드
    }
};

const getUserById = async (id: number) => {
    const user = await prisma.user.findUnique({
        where: {
            id,
        },
    });

    if (!user) {
        throw new Error("USER_NOT_FOUND");
    }

    return user;
};

const login = async (data: LoginInputType) => {
    // prisma.테이블.findUnique(조건객체) : SELECT 명령 (단, Unique 칼럼을 통해)
    // findUnique라는 메서드는 객체 1개만 리턴
    // find라는 메서드는 Array가 리턴
    const user = await prisma.user.findUnique({
        where: {
            username: data.username,
        },
    });

    // 검색을 했는데 해당하는 내용이 없는건, 에러가 아님.
    // DB에서 조회한 내용인 user가 없거나, deletedAt의 값이 있으면
    if (!user || user.deletedAt) {
        throw new Error("INVALID_CREDENTIALS");
    }

    const isValid = await passwordUtil.verifyPassword(data.password, user.password);
    if (!isValid) {
        throw new Error("INVALID_CREDENTIALS");
    }

    // 아이디와 비밀번호가 일치하는 정보가 있다는 뜻
    const token = jwtUtil.generateToken(user.id);

    // password와 deletedAt라는 항목은 response(응답)에 포함시킬 필요 없어서, 그걸 제외한 나머지만 safeUserInfo에 저장
    const { password, deletedAt, ...safeUserInfo } = user;

    return {
        user: safeUserInfo,
        token,
    };

    // createUser에서는
    // 에러가 나는 부분에 에러 객체가 Prisma Error 객체였기 때문에
    // service에서 Javascript Error 객체로 바꿔줄 필요가 있었지만,
    //
    // login에서는
    // 에러를 Javascript Error 객체로 만들었기 때문에 그대로 controller로 보내도 됨
};

const updateUser = async (userId: number, input: UpdateUserInputType) => {
    const existUser = await prisma.user.findUnique({
        where: {
            id: userId,
            deletedAt: null,
        },
    });
    // SELECT * FROM user WHERE id = userId AND deletedAt IS NOT NULL;
    if (!existUser || existUser.deletedAt) {
        throw new Error("NOT_FOUND_USER");
    }

    // nickname에 unique : 중복값이 허용되지 않음

    // nickname, email, phoneNumber
    const existNickname = await prisma.user.findFirst({
        where: {
            nickname: input.nickname,
            deletedAt: null,
            id: {
                not: userId,
            },
        },
    });
    if (existNickname) {
        throw new Error("DUPLICATED_NICKNAME");
    }

    // email에 unique
    const existEmail = await prisma.user.findFirst({
        where: {
            email: input.email,
            deletedAt: null,
            id: {
                not: userId,
            },
        },
    });
    if (existEmail) {
        throw new Error("DUPLICATED_EMAIL");
    }

    return prisma.user.update({
        where: {
            id: userId,
        },
        data: {
            email: input.email,
            nickname: input.nickname,
            phoneNumber: input.phoneNumber ?? null,
        },
    });
};

const updatePassword = async (userId: number, prevPw: string, pw: string) => {
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
    });
    if (!user) {
        throw new Error("NOT_FOUND_USER");
    }

    // prevPw 사용자가 입력한 비밀번호는 평문
    // user.password는 암호문
    const isPasswordValid = await passwordUtil.verifyPassword(prevPw, user.password);
    if (!isPasswordValid) {
        throw new Error("INVALID_PASSWORD");
    }

    const hashedPassword = await passwordUtil.hashPassword(pw);

    // "지금 현재 비밀번호와 변경하려는 비밀번호가 같습니다" 라는 에러로 튕겨내려면
    // if (hashedPassword === user.password) {
    //     throw new Error("SAME_PASSWORD");
    // }

    // "5개월 전에 변경된 비밀번호입니다." 라는 에러로 튕겨내려면
    // 비밀번호 히스토리를 저장하고 있는 테이블을 따로 마련해야 함
    // 그 비밀번호 히스토리를 모두 findMany로 가져온 뒤
    // for문을 돌려서 비교, 그 후 시간과 함께 에러 리턴
    // 구글이 이 방식인데 이렇게 해도 문제가 되지 않는 이유는
    // 갖고 있는 비밀번호들이 전부 다 암호화 되어 있어서 구글도 실제 비밀번호가 뭔지는 모르기 때문

    return prisma.user.update({
        where: {
            id: userId,
        },
        data: {
            password: hashedPassword,
        },
    });
};

const withdrawUser = async (userId: number, password: string) => {
    // 사용자가 존재하는지 찾고
    // 데이터베이스에는 SELECT 구문 - findFirst, findUnique, findMany
    // findUnique는 where절에 들어갈 수 있는게 unique 칼럼에 대해서만이기에 무조건 1개 or 0개
    // findFirst는 where절에 들어가는게 제한 없이. 여러개의 칼럼이 선택되고, 그 중에 1개
    const existUser = await prisma.user.findFirst({
        where: {
            id: userId,
            deletedAt: null,
        },
    });
    if (!existUser) {
        throw new Error("NOT_FOUND_USER");
    }

    // 지금 들어온 비밀번호가 DB 상 사용자 비밀번호와 같은지 passwordUtil 확인
    const isPasswordValid = await passwordUtil.verifyPassword(password, existUser.password);
    if (!isPasswordValid) {
        throw new Error("INVALID_PASSWORD");
    }

    // 사용자 정보에 deletedAt 현재시간으로 update
    return prisma.user.update({
        where: {
            id: userId,
        },
        data: {
            deletedAt: new Date(),
        },
    });
};

// 회원 탈퇴된 사용자의 정보는 폐기를 하는 것이 맞음
// 회원 정보(User)라는 것은 Post, Reply, Inquiry든, 관계를 맺고 있는 다른 테이블이 있기 때문에
// delete로 진행하지 않고 update로 처리한 것
// 법적으로도 문제 없고, 우리의 delete를 하지 말아야 된다는 문제를 해결하려면 어떻게 해야 할까
// 관계에 필요한 id를 제외한 나머지는 NULL로 update 하는게 맞음
// 그렇기 때문에 User 테이블에 대한 설계할 때부터 그에 대한 고려가 필요함

// 이렇게 디자인 하는 곳은 없음

export default {
    createUser,
    getUserById,
    login,
    updateUser,
    updatePassword,
    withdrawUser,
};
