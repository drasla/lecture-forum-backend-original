// /seed/reply.ts
import prisma from "../src/config/prisma.ts";
// 💡 유저님이 만들어두신 replyService 경로에 맞게 임포트 해주세요.
import replyService from "../src/services/replyService.ts";

// 💬 전장의 열기를 뿜어내 줄 리얼한 토론 댓글 템플릿 팩
const replyTemplates = [
    "이건 솔직히 논란의 여지가 없다 ㅋㅋㅋ 무조건 1번이지!",
    "2번 고른 사람들 진짜 맛알못인가... 진지하게 이해가 안 가네.",
    "진지하게 과학적 근거를 대자면 1번이 맞음. 반박 시 내 말이 다 맞음.",
    "아니 2번이 진리인데 왜 표가 이거밖에 안 나옴? 집단 지성 다 죽었냐?",
    "중립 기어 박으려다가 1번 진영 논리 보고 감탄해서 바로 1번 찍고 갑니다.",
    "와 실시간으로 투표 결과 박빙인 거 봐라 ㅋㅋㅋ 전장 웅장해진다.",
    "오늘도 평화로운 대난투 전장... 난 외롭게 2번에 한 표 던진다.",
    "1번 고른 형들 나중에 나랑 키보드로 한판 더 뜨자.",
    "이건 가치관의 차이라 정답은 없지만, 어쨌든 내 선택은 2번임.",
    "와... 댓글 창 보러 들어왔는데 예상대로 혼돈의 카오스네 ㅋㅋㅋ",
    "다들 진정해... 어차피 내일 출근(등교)해야 되잖아...",
    "이 토론 올린 사람 칭찬해. 간만에 도파민 터지는 주제네.",
];

async function seedReplies() {
    console.log("💬 백엔드 다이렉트 댓글(Reply) 시딩을 시작합니다...");

    try {
        // 1. 댓글을 달아줄 전체 유저와 대상 게시글 목록을 불러옵니다.
        const users = await prisma.user.findMany({
            where: { deletedAt: null },
            select: { id: true, nickname: true },
        });

        const posts = await prisma.post.findMany({
            where: { deletedAt: null },
            select: { id: true, title: true },
        });

        if (users.length === 0 || posts.length === 0) {
            console.error("❌ 유저 또는 게시글 데이터가 없습니다. 시딩을 먼저 진행해주세요.");
            return;
        }

        console.log(
            `✅ ${posts.length}개의 게시글에 ${users.length}명의 유저가 키보드 배틀을 준비합니다!\n`,
        );

        // 2. 모든 게시글을 순회하며 댓글을 무작위로 생성합니다.
        for (const post of posts) {
            // 글 하나당 달릴 댓글 개수 무작위 결정 (예: 최소 3개 ~ 최대 12개)
            const targetReplyCount = Math.floor(Math.random() * 10) + 3;

            console.log(
                `📝 [Post ID: ${post.id}] "${post.title.slice(0, 15)}..." -> ${targetReplyCount}개의 댓글 장전 중...`,
            );

            let successCount = 0;

            for (let i = 0; i < targetReplyCount; i++) {
                // 무작위 유저와 무작위 템플릿 선택
                const randomUser = users[Math.floor(Math.random() * users.length)];
                const randomTemplate =
                    replyTemplates[Math.floor(Math.random() * replyTemplates.length)];

                if (!randomUser) {
                    return null;
                }

                // 중복 텍스트 방지를 위한 유니크 난수
                const unique = Math.random().toString(36).slice(-3);
                const content = `${randomTemplate} (인증코드: ${unique})`;

                try {
                    // 💡 서비스 레이어의 createReply 호출
                    // 앞서 만들었던 서비스 스펙: createReply(postId: number, userId: number, content: string)
                    await replyService.createReply(post.id, randomUser.id, content);

                    successCount++;
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    console.error(`   ❌ 실패 (작성자: ${randomUser.nickname}):`, errorMessage);
                }
            }

            console.log(`   👉 총 ${successCount}개의 댓글이 성공적으로 달렸습니다!`);
        }

        console.log("\n🏁 모든 댓글 시딩 작업이 완벽하게 종료되었습니다!");
    } catch (error) {
        console.error("💥 댓글 시딩 스크립트 실행 중 치명적 에러 발생:", error);
    } finally {
        await prisma.$disconnect();
    }
}

// 스크립트 실행
seedReplies().then(() => {});
