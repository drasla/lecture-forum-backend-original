import { Request, Response } from "express";
import postService from "../services/postService.ts";
import { CreatePostInputType } from "../schemas/post/createPostSchema.ts";
import { PostCreateInput, PostUpdateInput } from "../generated/prisma/models/Post.ts";
import { AuthRequest } from "../middlewares/auth.ts";
import { UpdatePostInputType } from "../schemas/post/updatePostSchema.ts";
import { VotePostInputType } from "../schemas/post/votePostSchema.ts";

const getPostsByCategory = async (req: Request<{ categoryId: string }>, res: Response) => {
    try {
        const categoryId = parseInt(req.params.categoryId, 10);
        const page = parseInt(req.query.page as string, 10) || 1;
        const size = parseInt(req.query.size as string, 10) || 10;

        if (isNaN(categoryId)) {
            return res.status(400).json({ message: "유효하지 않은 카테고리 ID입니다." });
        }

        const result = await postService.getPostByCategory(categoryId, page, size);

        res.status(200).json({
            message: "게시글 목록을 성공적으로 불러왔습니다.",
            data: result,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "서버 에러가 발생했습니다." });
    }
};

const getPostById = async (req: AuthRequest<{ id: string }>, res: Response) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ message: "유효하지 않은 게시글 ID입니다." });
        }

        const userId = req.user?.id;
        const post = await postService.getPostById(id, userId);

        if (!post) {
            return res.status(404).json({ message: "존재하지 않거나 삭제된 게시글입니다." });
        }

        res.status(200).json({
            message: "게시글을 성공적으로 불러왔습니다.",
            data: post,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "서버 에러가 발생했습니다." });
    }
};

const createPost = async (req: AuthRequest, res: Response) => {
    try {
        // Zod 검증을 통과한 body 데이터
        const { title, content, categoryId, option1Text, option2Text }: CreatePostInputType =
            req.body;
        if (!req.user) {
            return res.status(401).json({ message: "로그인이 필요한 서비스입니다." });
        }
        const userId = req.user.id;

        // 💡 Prisma의 PostCreateInput 타입에 맞춰 객체 조립 (connect 사용)
        const postData: PostCreateInput = {
            title,
            content,
            category: { connect: { id: categoryId } },
            user: { connect: { id: userId } },
            option1Text: option1Text ?? null, // 추가
            option2Text: option2Text ?? null, // 추가
        };

        // 조립된 데이터를 서비스로 전달
        const newPost = await postService.createPost(postData);

        res.status(201).json({
            message: "게시글이 성공적으로 작성되었습니다.",
            data: newPost,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "게시글 작성 중 서버 에러가 발생했습니다." });
    }
};

const updatePost = async (req: AuthRequest<{ id: string }>, res: Response) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ message: "유효하지 않은 게시글 ID입니다." });
        }

        const postData: UpdatePostInputType = req.body;
        if (!req.user) {
            return res.status(401).json({ message: "로그인이 필요한 서비스입니다." });
        }
        const userId = req.user.id;

        // 💡 카테고리 로직 삭제, 제목과 내용만 매핑
        const updateData: PostUpdateInput = {};
        if (postData.title) updateData.title = postData.title;
        if (postData.content) updateData.content = postData.content;

        const updatedPost = await postService.updatePost(id, userId, updateData);

        res.status(200).json({
            message: "게시글이 성공적으로 수정되었습니다.",
            data: updatedPost,
        });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "NOT_FOUND") {
                res.status(404).json({ message: "존재하지 않거나 삭제된 게시글입니다." });
                return;
            }
            if (error.message === "FORBIDDEN") {
                res.status(403).json({ message: "게시글을 수정할 권한이 없습니다." });
                return;
            }
        }

        console.error(error);
        res.status(500).json({ message: "게시글 수정 중 서버 에러가 발생했습니다." });
    }
};

const deletePost = async (req: AuthRequest<{ id: string }>, res: Response) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ message: "유효하지 않은 게시글 ID입니다." });
        }

        if (!req.user) {
            return res.status(401).json({ message: "로그인이 필요한 서비스입니다." });
        }
        const userId = req.user.id;

        // 서비스 호출
        await postService.deletePost(id, userId);

        res.status(200).json({
            message: "게시글이 성공적으로 삭제되었습니다.",
        });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "NOT_FOUND") {
                res.status(404).json({ message: "존재하지 않거나 이미 삭제된 게시글입니다." });
                return;
            }
            if (error.message === "FORBIDDEN") {
                res.status(403).json({ message: "게시글을 삭제할 권한이 없습니다." });
                return;
            }
        }

        console.error(error);
        res.status(500).json({ message: "게시글 삭제 중 서버 에러가 발생했습니다." });
    }
};

const votePost = async (req: AuthRequest<{ id: string }>, res: Response) => {
    try {
        const postId = parseInt(req.params.id, 10);
        if (isNaN(postId)) {
            return res.status(400).json({ message: "유효하지 않은 게시글 ID입니다." });
        }

        const { option }: VotePostInputType = req.body;

        if (!req.user) {
            return res.status(401).json({ message: "로그인이 필요한 서비스입니다." });
        }
        const userId = req.user.id;

        await postService.votePost(postId, userId, option);

        res.status(200).json({
            message: "소중한 한 표가 전황에 반영되었습니다!",
        });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "NOT_FOUND") {
                return res.status(404).json({ message: "존재하지 않거나 삭제된 게시글입니다." });
            }
            if (error.message === "NOT_VOTABLE") {
                return res.status(400).json({ message: "투표가 활성화되지 않은 게시글입니다." });
            }
            if (error.message === "ALREADY_VOTED") {
                return res.status(409).json({ message: "이미 투표에 참여하셨습니다." });
            }
        }
        console.error(error);
        res.status(500).json({ message: "투표 처리 중 서버 에러가 발생했습니다." });
    }
};

const deleteVote = async (req: AuthRequest<{ id: string }>, res: Response) => {
    try {
        const postId = parseInt(req.params.id, 10);
        if (isNaN(postId)) {
            return res.status(400).json({ message: "유효하지 않은 게시글 ID입니다." });
        }

        if (!req.user) {
            return res.status(401).json({ message: "로그인이 필요한 서비스입니다." });
        }
        const userId = req.user.id;

        await postService.deleteVote(postId, userId);

        res.status(200).json({
            message: "투표가 취소되었습니다. 다시 선택해 주세요!",
        });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "NOT_VOTED") {
                return res.status(404).json({ message: "취소할 투표 내역이 없습니다." });
            }
        }
        console.error(error);
        res.status(500).json({ message: "투표 취소 중 서버 에러가 발생했습니다." });
    }
};

export default {
    getPostsByCategory,
    getPostById,
    createPost,
    updatePost,
    deletePost,
    votePost,
    deleteVote,
};
