import { NextFunction } from "express";
import { Request, Response } from "express";
import { ZodType } from "zod";

export const validate = (schema: ZodType) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const result = await schema.safeParseAsync(req.body);

        if (!result.success) {
            const errorMessages = result.error.issues.map(issue => ({
                field: issue.path.join("."),
                message: issue.message,
            }));

            res.status(400).json({
                message: "잘못된 입력값입니다.",
                errors: errorMessages,
            });
            return;
        }

        req.body = result.data;
        next();
    };
};
