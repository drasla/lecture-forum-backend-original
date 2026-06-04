import categoryService from "../src/services/categoryService.ts";
import prisma from "../src/config/prisma.ts";
import { CreatePostInputType } from "../src/schemas/post/createPostSchema.ts";
import { PostCreateInput } from "../src/generated/prisma/models/Post.ts";
import postService from "../src/services/postService.ts";

const mockPostList = [
    {
        title: "탕수육 먹을 때 소스는?",
        option1Text: "무조건 부먹",
        option2Text: "바삭하게 찍먹",
    },
    {
        title: "아이스 아메리카노 vs 따뜻한 아메리카노",
        option1Text: "얼죽아",
        option2Text: "쪄죽따",
    },
    {
        title: "치킨 먹을 때",
        option1Text: "닭다리부터",
        option2Text: "닭가슴살부터",
    },
    {
        title: "민트초코에 대한 당신의 견해는?",
        option1Text: "신의 음식 (극호)",
        option2Text: "치약 맛 (극혐)",
    },
    {
        title: "평생 한 가지만 먹어야 된다면?",
        option1Text: "평생 짜장면만 먹기",
        option2Text: "평생 짬뽕만 먹기",
    },
    {
        title: "깻잎 논쟁, 내 연인이 친구의 깻잎을 떼어준다면?",
        option1Text: "매너일 뿐 괜찮다",
        option2Text: "절대 안됨 난리남",
    },
    {
        title: "새우 논쟁, 내 연인이 새우를 까준다면?",
        option1Text: "새우 정도야",
        option2Text: "결별 사유임",
    },
    {
        title: "출근 시간 정시 도착의 기준은?",
        option1Text: "9시 정각 문 통과",
        option2Text: "8시 50분 착석 완료",
    },
];

async function seedPosts() {
    try {
        const categories = await categoryService.getActiveCategories();
        
        const users = await prisma.user.findMany({
            where: {
                deletedAt: null,
            }
        });

        if (categories.length === 0) {
            console.log("활성화된 카테고리가 없습니다. 시딩을 종료합니다.")
            return;
        }
        if (users.length === 0) {
            console.log("작성자로 지정할 유저가 없습니다. 시딩을 종료합니다.");
            return;
        }
        
        const postsPerCategory = 30;

        for (const category of categories) {     // categories를 순회시키는 역할
            for (let i = 0; i < postsPerCategory; i++) {    // 글 등록 역할 (0 ~ 30)
                const topic = mockPostList[Math.floor(Math.random() * mockPostList.length)]; // 쓸 글 내용을 랜덤 선택
                const user = users[Math.floor(Math.random() * users.length)];   // 작성자로 등록할 사용자를 랜덤 선택

                if (!topic) {
                    return null;
                }

                if (!user) {
                    return null;
                }

                const dummyData: PostCreateInput = {
                    title: topic.title,
                    option1Text: topic.option1Text,
                    option2Text: topic.option2Text,
                    content:
                        "이 게시글은 토론대난투 시스템을 검증하기 위해 생성된 자동화 테스트 글입니다.\n\n" +
                        "과연 여러분의 선택은 어느 쪽인가요?\n" +
                        `1번 ${topic.option1Text} 과 2번 ${topic.option2Text} 중 마음에 드는 진영에 투표하고,` +
                        "아래 댓글 창에서 논리 제압을 시작해주세요!",
                    category: { connect: { id: category.id } },
                    user: { connect: { id: user.id } },
                };

                await postService.createPost(dummyData);
                console.log(`[${i}/${postsPerCategory} : 카테고리ID(${category.id})] 게시글 등록 성공`);
            }
        }
    } catch (error) {
        console.log("시딩 작업 중 오류가 발생되었습니다.", error);
    }
}

seedPosts().then(() => {});
