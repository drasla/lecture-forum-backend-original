import { NextFunction, Request, Response } from "express";
import jwtUtil from "../utils/jwt/jwtUtil.ts";
import jwt from "jsonwebtoken";
import { RoleType, User } from "../generated/prisma/client.ts";
import userService from "../services/userService.ts";
import * as core from "express-serve-static-core";

// 이렇게 Express의 기본 인터페이스인 Request를 상속받아
// user라고 하는 항목을 덧붙인 AuthRequest를 만들었는데
// Request라는 Express 기본 타입은 Generic Type임
// 그렇기 때문에 우리가 그 Request 타입을 쓸 때 Request<{ id: string }>라고
// 쓰는게 가능했었음
// 이렇게 제네릭을 통해 Request에 제공되는 { id: string }은
// req.params (동적 라우팅)을 통해 경로에 추가로 들어오는 값을 나타내줬던 것

// 우리가 만든 AuthRequest는 상속을 받았지만, 제네릭은 아님

export interface AuthRequest<
    P = core.ParamsDictionary,
    ResBody = any,
    ReqBody = any,
    ReqQuery = core.Query,
    Locals extends Record<string, any> = Record<string, any>,
> extends Request<P, ResBody, ReqBody, ReqQuery, Locals> {
    user?: User;
}

// middleware로 사용할 녀석의 함수 매개변수는
// req : 외부에서 들어온 정보가 담겨있는 박스
// res : 외부로 나갈 정보를 담을 박스
// next : 다음 기능(보통 컨트롤러)으로 넘겨줄 수 있는 기능(메서드)
// 그래서 이 미들웨어에서 return을 치면 미들웨어에서 절차가 끝나버림.
// 다음 함수를 실행하려면 next()를 호출해야 함.

// 원래 req 자리에 들어와야 되는 인터페이스는 Request이므로,
// Request를 상속 받은 AuthRequest가 그 자리에 들어갈 수 있음
export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        // 1. 들어온 Request에서 헤더의 내용을 꺼내, 그 중 Authorization 의 값이 있는지 확인
        // express가 자동으로 Authorization 키에 존재하는 값을 authorization 프로퍼티에 담아줌
        const authHeader = req.headers.authorization;

        // 2. 그 Authorization의 값이 `Bearer 뫄뫄뫄`로 들어오는지, 그 뫄뫄뫄가 있으면 그 값을 받아옴
        // authorization 프로퍼티의 값 타입은 string 이기 때문에 startsWith() 메서드를 사용해서 확인
        // startsWith() 메서드 : string 타입에서 사용 가능. 매개변수에 집어넣어준 문자열로 시작되는지 확인하는 메서드
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({ message: "로그인이 필요한 서비스입니다. (토큰 없음)" });
            return;
        }

        // 아직 판별만 진행했음. 여전히 authHeader = "Bearer 뫄뫄뫄"
        // split() 메서드 : string 타입에서 사용 가능. 매개변수에 집어넣어준 문자열로 값을 나누는 메서드
        //               : "Bearer 뫄뫄뫄"를 split(" ")로 나눈 결과 값은 ["Bearer","뫄뫄뫄"]로 리턴
        const token = authHeader.split(" ")[1];

        // 들어온 값이 "Bearer " 일 수 있음
        if (!token) {
            res.status(401).json({ message: "토큰이 비어있거나 형식이 올바르지 않습니다. " });
            return;
        }

        // 3. 뫄뫄뫄가 내가 발급한 토큰이 맞는지 검증
        const decoded = jwtUtil.verifyToken(token); // decoded = { id: ? }

        // 4. 그 토큰 안에 있는 내용을 까봐서, 그 기록된 사용자가 현재 살아있는 사용자인지 확인하고 (DB와의 통신 필요)
        const user = await userService.getUserById(decoded.id);

        if (!user || user.deletedAt) {
            res.status(401).json({
                message: "유효하지 않은 사용자이거나 탈퇴한 계정입니다.",
            });
            return;
        }
        req.user = user;

        // 5. 살아있는 사용자라면 허용
        next();
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            res.status(401).json({ message: "토큰이 만료되었습니다. 다시 로그인해주세요." });
            return;
        }
        if (error instanceof jwt.JsonWebTokenError) {
            res.status(401).json({
                message: "유효하지 않은 토큰 형식입니다. 다시 로그인해주세요.",
            });
            return;
        }
        console.log(error);
        res.status(500).json({ message: "인증 처리 중 서버 에러가 발생되었습니다." });
    }
};

export const checkUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
    // 탈락시키는 일은 안함
    // 로그인 정보(토큰)이 헤더에 있으면 req.user에 정보를 담는 역할
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            // 헤더를 봤더니 내용이 없었어? 그럼 그냥 컨트롤러로 가
            return next();
        }
        const token = authHeader.split(" ")[1];
        if (!token) {
            // 헤더에 Authorization 항목은 있는데 "Bearer <토큰>" 이 형식이 아니야? 그럼 그냥 컨트롤러로 가
            return next();
        }
        const decoded = jwtUtil.verifyToken(token);

        const user = await userService.getUserById(decoded.id);

        if (!user || user.deletedAt) {
            // 가지고 온 토큰을 검증하고, 사용자 정보를 확인 했는데 없어? 그럼 그냥 컨트롤러로 가
            return next();
        }
        req.user = user;

        next();
    } catch (error) {
        // 뭔가 위에서 에러가 발생했어? 그럼 그냥 컨트롤러로 가
       next();
    }
}


export const requiredAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
    // 그렇게 확인해온 user 정보 중, user.role === "ADMIN"인가만 판별하는 기능만 탑재
    // 이걸 구현하기 위해서 user 정보를 꺼내야 되는데, 지금 당장은 가져올 곳이 없음
    // requiredAdmin이라는 함수는 다른 정보에는 접근이 불가능하지만, 매개변수로 들어오는 req, res, next는 쓸 수 있음
    // 근데 res는 밖으로 나갈 박스니까 여기에 낙서를 하면 안되고
    // next는 다음으로 진행하는 기능(메서드)니까, 당연히 낙서가 안되고
    // 그럼 req는 외부에서 들어오는 내용이 담기는 박스이지만, 낙서를 해도 상관 없다
    // 그럼. authenticate를 할 때, 사용자 정보(user)를 req에 넣자

    if (!req.user) {
        res.status(401).json({ message: "인증 정보가 없습니다. 먼저 로그인 해주세요."});
        return;
    }
    if (req.user.role !== RoleType.ADMIN) {
        res.status(403).json({ message : "해당 기능에 접근할 수 있는 관리자 권한이 없습니다. "});
        return;
    }
    next();
}