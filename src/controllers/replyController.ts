import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/auth.ts";
import { CreateReplyInputType } from "../schemas/reply/createReplySchema.ts";
import replyService from "../services/replyService.ts";
import { UpdateReplyInputType } from "../schemas/reply/updateReplySchema.ts";

const getRepliesByPostId = async (req: Request<{ postId: string }>, res: Response) => {
    // service에 전달되어야 되는 값이 postId, page, size
    try {
        const postId = Number(req.params.postId);
        if (isNaN(postId)) {
            res.status(400).json({
                message: "유효하지 않은 게시물 ID 입니다.",
            });
            return;
        }

        const page = Number(req.query.page) || 1;
        const size = Number(req.query.size) || 10;

        const result = await replyService.getRepliesByPostId(postId, page, size);
        res.status(200).json({
            message: "댓글 목록을 성공적으로 불러왔습니다.",
            data: result,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "댓글 목록을 불러오는 중에 오류가 발생했습니다.",
        });
    }
};

const createReply = async (req: AuthRequest, res: Response) => {
    try {
        // userId는 req.user
        // postId와 content는 req.body
        if (!req.user) {
            res.status(401).json({
                message: "로그인이 필요한 서비스입니다.",
            });
            return;
        }
        const userId = req.user.id;

        const { postId, content }: CreateReplyInputType = req.body;

        const result = await replyService.createReply(userId, postId, content);
        res.status(201).json({
            message: "댓글이 성공적으로 작성되었습니다.",
            data: result,
        });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "NOT_FOUND") {
                res.status(404).json({
                    message: "존재하지 않거나 삭제된 게시물입니다.",
                });
                return;
            }
        }

        console.log(error);
        res.status(500).json({
            message: "댓글 등록 중 서버 오류가 발생되었습니다.",
        });
    }
};

const updateReply = async (req: AuthRequest<{ replyId: string }>, res: Response) => {
    try {
        const id = Number(req.params.replyId);
        if (isNaN(id)) {
            res.status(400).json({
                message: "유효하지 않은 댓글 ID 입니다.",
            });
            return;
        }

        if (!req.user) {
            res.status(401).json({
                message: "로그인이 필요한 서비스입니다.",
            });
            return;
        }
        const userId = req.user.id;

        const { content }: UpdateReplyInputType = req.body;

        const result = await replyService.updateReply(id, userId, content);
        res.status(200).json({
            message: "댓글이 성공적으로 수정되었습니다.",
            data: result,
        });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "NOT_FOUND_REPLY") {
                res.status(404).json({
                    message: "존재하지 않는 댓글입니다.",
                });
                return;
            }
            if (error.message === "FORBIDDEN") {
                res.status(403).json({
                    message: "댓글 삭제 권한이 없습니다.",
                });
                return;
            }
        }

        console.log(error);
        res.status(500).json({
            message: "댓글 삭제 중 서버 오류가 발생되었습니다.",
        });
    }
}

const deleteReply = async (req: AuthRequest<{ replyId: string }>, res: Response) => {
    try {
        const id = Number(req.params.replyId);
        if (isNaN(id)) {
            res.status(400).json({
                message: "유효하지 않은 댓글 ID 입니다."
            });
            return;
        }

        if (!req.user) {
            res.status(401).json({
                message: "로그인이 필요한 서비스입니다."
            });
            return;
        }
        const userId = req.user.id;

        await replyService.deleteReply(id, userId);
        res.status(200).json({
            message: "댓글이 성공적으로 삭제되었습니다."
        });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "NOT_FOUND_REPLY") {
                res.status(404).json({
                    message: "존재하지 않는 댓글입니다."
                });
                return;
            }
            if (error.message === "FORBIDDEN") {
                res.status(403).json({
                    message: "댓글 삭제 권한이 없습니다."
                })
                return;
            }
        }

        console.log(error);
        res.status(500).json({
            message: "댓글 삭제 중 서버 오류가 발생되었습니다.",
        });
    }
}

export default {
    getRepliesByPostId,
    createReply,
    updateReply,
    deleteReply,
};
