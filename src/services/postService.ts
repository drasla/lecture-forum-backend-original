import prisma from "../config/prisma.ts";
import { PostCreateInput } from "../generated/prisma/models/Post.ts";

const getPostsByCategory = async (categoryId: number, page: number, size: number) => {
    const skip = (page - 1) * size;

    // SELECT * FROM post WHERE categoryId = categoryId AND deletedAt = NULL ORDER BY id DESC
    const list = await prisma.post.findMany({
        where: {
            categoryId,
            deletedAt: null,
        },
        orderBy: {
            id: "desc",
        },
        skip,
        take: size,
        include: {
            // user: true,     => 연관된 user 테이블의 정보를 싹 긁어옴
            user: {
                select: {
                    id: true,
                    nickname: true,
                    email: true,
                },
            },
        },
    });

    // SELECT COUNT(*) FROM post WHERE categoryId = categoryId AND deletedAt = NULL
    const total = await prisma.post.count({
        where: {
            categoryId,
            deletedAt: null,
        },
    });

    return {
        page,
        size,
        total,
        list,
    };
};

const getRecentPosts = async (size: number) => {
    return prisma.post.findMany({
        where: {
            deletedAt: null
        },
        orderBy: {
            id: "desc"
        },
        take: size,
        include: {
            category: {
                select: {
                    id: true,
                    name: true,
                }
            },
            user: {
                select: {
                    id: true,
                    nickname: true,
                    email: true,
                }
            }
        }
    });
}

const getPostById = async (postId: number, userId?: number) => {
    // SELECT를 했는데 자료가 검색이 안되면, 어차피 post라는 변수엔 null임
    const post = await prisma.post.findUnique({
        where: {
            id: postId,
            deletedAt: null,
        },
        include: {
            user: {
                select: {
                    id: true,
                    nickname: true,
                    email: true,
                }
            }
        }
    });

    if (!post) {
        // 이 아래쪽으로는 진행을 못 하도록 막기 위해, return을 쳐줌
        return null;
    }

    // 이 글의 투표에 대한 내용을 불러와야 함
    // 그럼 post에서 검색해올 때 votes를 쓰면 되지 않나? 라고 할 수 있는데
    // 이렇게 votes에 vote 테이블에 있는 정보를 덧붙이면(JOIN하면)
    // 누가. 몇 번에. 투표했는지 정보가 다 노출됨
    // 우리가 필요한건 1번에 몇 명, 2번에 몇 명 투표했는지만 필요하지
    // 누가 몇 번에 투표했는가에 대한 정보는 필요 없음

    const option1Count = await prisma.vote.count({
        where: {
            postId: postId,
            option: 1,
        }
    });
    const option2Count = await prisma.vote.count({
        where: {
            postId: postId,
            option: 2,
        }
    });

    await prisma.post.update({
        where: {
            id: postId,
        },
        data: {
            views: post.views + 1,
        }
    })

    // 지금 요청을 한 이 사람이 이 글에 대해 투표를 했는지 안 했는지
    let hasVoted = false;
    if (userId) {
        // findFirst는 조건에 맞는 첫 번째 데이터를 찾음
        const myVote = await prisma.vote.findFirst({
            where: {
                userId: userId,
                postId: postId,
            }
        });

        if (myVote) {
            hasVoted = true;
        }
    }

    return {
        ...post,
        views: post.views + 1,
        vote: {
            option1Count,
            option2Count,
            totalCount: option1Count + option2Count,
            hasVoted,
        }
    };
};

const createPost = async (postData: PostCreateInput) => {
    // INSERT 쿼리를 전송
    return prisma.post.create({
        data: postData,
    });
};

const votePost = async (postId: number, userId: number, option: number) => {
    // 1. postId의 글이 존재 유무 (소프트삭제도 고려)
    const post = await prisma.post.findFirst({
        where: {
            id: postId,
            deletedAt: null,
        }
    });

    if (!post) {
        throw new Error("NOT_FOUND");
    }

    // 2. option1Text와 option2Text가 있는지 체크
    if (!post.option1Text || !post.option2Text) {
        throw new Error("NOT_VOTABLE");
    }

    // 3. 이 사용자가 투표를 이미 진행했는지 체크
    const existingVote = await prisma.vote.findUnique({
        where: {
            userId_postId: { userId, postId }
        }
    });
    if (existingVote) {
        throw new Error("ALREADY_VOTED");
    }

    return prisma.vote.create({
        data: {
            userId,
            postId,
            option,
        }
    })
}

const cancelVotePost = async (postId: number, userId: number) => {
    // service는 에러를 어디에서 처리할지를 내가 결정해서
    // try - catch 을 선택적으로 사용 가능
    const existVote = await prisma.vote.findUnique({
        where: {
            userId_postId: { userId, postId}
        }
    });
    if (!existVote) {
        throw new Error("NOT_VOTED");
    }

    // 실제 삭제가 이루어져야 함
    await prisma.vote.delete({
        where: {
            userId_postId: { userId, postId }
        }
    });
    return;

    // const result = await prisma.vote.create({ data: {}})     => 그렇게 생성된 vote 객체 (후결과)
    // const result = await prisma.vote.update({ where: {}, data: {}})   => 그렇게 업데이트된 vote 객체 (후결과)
    // const result = await prisma.vote.findFirst({ where: {}})   => 그렇게 검색한 vote 객체 => 없으면 null
    // const result = await prisma.vote.findUnique({ where: {}})  => 그렇게 검색한 vote 객체 => 없으면 null
    // const result = await prisma.vote.findMany({ where: {}}) => 그렇게 검색한 vote Array => 없으면 []
    // const result = await prisma.vote.delete({ where: {}}) => 그렇게 삭제된 vote 객체 (전내용)
}

export default {
    getPostsByCategory,
    getRecentPosts,
    createPost,
    getPostById,
    votePost,
    cancelVotePost,
};
