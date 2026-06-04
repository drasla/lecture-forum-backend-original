import { Request, Response } from "express";
import replyService from "../services/replyService.ts";
import { AuthRequest } from "../middlewares/auth.ts";
import { CreateReplyInputType } from "../schemas/reply/createReplySchema.ts";

const createReply = async (req: AuthRequest<{ postId: string }>, res: Response) => {
    try {
        const postId = parseInt(req.params.postId, 10);
        if (isNaN(postId)) {
            return res.status(400).json({ message: "유효하지 않은 게시글 ID입니다." });
        }

        const { content }: CreateReplyInputType = req.body;

        if (!req.user) {
            return res.status(401).json({ message: "로그인이 필요한 서비스입니다." });
        }
        const userId = req.user.id;

        const newReply = await replyService.createReply(postId, userId, content);

        res.status(201).json({
            message: "댓글이 성공적으로 작성되었습니다.",
            data: newReply,
        });
    } catch (error) {
        if (error instanceof Error && error.message === "NOT_FOUND_POST") {
            return res.status(404).json({ message: "존재하지 않거나 삭제된 게시글입니다." });
        }
        console.error(error);
        res.status(500).json({ message: "댓글 작성 중 서버 에러가 발생했습니다." });
    }
};

const getReplies = async (req: Request<{ postId: string }>, res: Response) => {
    try {
        const postId = parseInt(req.params.postId, 10);
        const page = parseInt(req.query.page as string, 10) || 1;
        const size = parseInt(req.query.size as string, 10) || 10;

        if (isNaN(postId)) {
            return res.status(400).json({ message: "유효하지 않은 게시글 ID입니다." });
        }

        const result = await replyService.getRepliesByPostId(postId, page, size);

        res.status(200).json({
            message: "댓글 목록을 성공적으로 불러왔습니다.",
            data: result,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "댓글 조회 중 서버 에러가 발생했습니다." });
    }
};

const updateReply = async (req: AuthRequest<{ id: string }>, res: Response) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ message: "유효하지 않은 댓글 ID입니다." });
        }

        const { content } = req.body; // 검증 미들웨어를 통과한 안전한 데이터

        if (!req.user) {
            return res.status(401).json({ message: "로그인이 필요한 서비스입니다." });
        }
        const userId = req.user.id;

        const updatedReply = await replyService.updateReply(id, userId, content);

        res.status(200).json({
            message: "댓글이 성공적으로 수정되었습니다.",
            data: updatedReply,
        });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "NOT_FOUND_REPLY") {
                return res.status(404).json({ message: "존재하지 않는 댓글입니다." });
            }
            if (error.message === "FORBIDDEN") {
                return res.status(403).json({ message: "댓글을 수정할 권한이 없습니다." });
            }
        }
        console.error(error);
        res.status(500).json({ message: "댓글 수정 중 서버 에러가 발생했습니다." });
    }
};

const deleteReply = async (req: AuthRequest<{ id: string }>, res: Response) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ message: "유효하지 않은 댓글 ID입니다." });
        }

        if (!req.user) {
            return res.status(401).json({ message: "로그인이 필요한 서비스입니다." });
        }
        const userId = req.user.id;

        await replyService.deleteReply(id, userId);

        res.status(200).json({
            message: "댓글이 성공적으로 삭제되었습니다.",
        });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "NOT_FOUND_REPLY") {
                return res.status(404).json({ message: "존재하지 않는 댓글입니다." });
            }
            if (error.message === "FORBIDDEN") {
                return res.status(403).json({ message: "댓글을 삭제할 권한이 없습니다." });
            }
        }
        console.error(error);
        res.status(500).json({ message: "댓글 삭제 중 서버 에러가 발생했습니다." });
    }
};

export default {
    createReply,
    getReplies,
    updateReply,
    deleteReply,
};
