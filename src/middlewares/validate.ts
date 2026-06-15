import { ZodType } from "zod";
import { Request, Response, NextFunction } from "express";

// middleware,
// Express가 데이터를 전송하는데 중간에 가로채서 무언가를 할 함수
// middleware의 목적의 함수는, 반환값이 (req, res, next) => {} 의 모양
export const validate = (schema: ZodType) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        // 실제 검증 처리를 하는 코드를 작성
        // .safeParseAsync(검증당할데이터) : 내가 작성한 조건에 부합하는지 확인하는 메서드, 비동기함수
        const result = await schema.safeParseAsync(req.body);

        if (!result.success) {
            // result.success가 false(실패)의 경우가 여기에서 실행됨

            // 에러난 이유를 클라이언트에게 알려줘야함
            const errorMessage = result.error.issues.map(issue => ({
                field: issue.path.join("."),
                message: issue.message,
            }));

            res.status(400).json({ message: "잘못된 입력값입니다.", errors: errorMessage });
            return;
        }

        // result.success가 true(성공)의 경우가 여기에서 실행됨 -> 이 함수를 끝내고 컨트롤러로 진행되어야 함
        req.body = result.data;
        next();
    };
};
