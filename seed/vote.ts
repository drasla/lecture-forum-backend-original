import prisma from "../src/config/prisma.ts";
import postService from "../src/services/postService.ts";

async function seedVotes() {
    console.log("🚀 백엔드 다이렉트 투표(Vote) 시딩을 시작합니다...");

    try {
        // 1. 투표를 진행할 유저와 대상 게시글 목록을 모두 가져옵니다.
        // 메모리 절약을 위해 id와 타이틀만 가볍게 Select 합니다.
        const users = await prisma.user.findMany({
            where: { deletedAt: null },
            select: { id: true },
        });

        const posts = await prisma.post.findMany({
            where: { deletedAt: null },
            select: { id: true, title: true },
        });

        if (users.length === 0 || posts.length === 0) {
            console.error("❌ 유저 또는 게시글 데이터가 부족합니다. 먼저 시딩을 진행해주세요.");
            return;
        }

        console.log(
            `✅ 총 ${posts.length}개의 게시글에 ${users.length}명의 유저가 맹렬히 투표합니다!\n`,
        );

        // 2. 모든 게시글을 순회하며 투표를 진행합니다.
        for (const post of posts) {
            // 이 글에 투표할 랜덤 인원수 결정 (예: 최소 5명 ~ 최대 35명)
            // 단, 현재 DB에 있는 총 유저 수를 넘지 않도록 Math.min 처리
            const targetVoteCount = Math.min(Math.floor(Math.random() * 30) + 5, users.length);

            // 💡 중복 투표(Unique Constraint) 에러를 방지하기 위해 유저 배열을 섞고 앞에서부터 자릅니다.
            const shuffledUsers = [...users].sort(() => 0.5 - Math.random());
            const selectedUsers = shuffledUsers.slice(0, targetVoteCount);

            console.log(
                `📊 [Post ID: ${post.id}] "${post.title.slice(0, 15)}..." -> ${targetVoteCount}명 투표 진행 중...`,
            );

            let successCount = 0;
            let option1Count = 0;
            let option2Count = 0;

            // 3. 뽑힌 유저들이 각각 랜덤하게 1번 또는 2번 진영을 선택합니다.
            for (const user of selectedUsers) {
                // 1 또는 2를 무작위로 선택 (50% 확률)
                const randomOption = Math.random() < 0.5 ? 1 : 2;

                try {
                    // 💡 서비스 레이어의 votePost 호출 (매개변수 순서는 실제 서비스에 맞게 수정해주세요!)
                    // 예시: votePost(postId, userId, option) 형태라고 가정합니다.
                    await postService.votePost(post.id, user.id, randomOption);

                    successCount++;
                    randomOption === 1 ? option1Count++ : option2Count++;
                } catch (error) {
                    // 만약 이미 투표한 내역이 있거나 에러가 나면 조용히 무시하고 넘어갑니다.
                }
            }

            console.log(
                `   👉 총 ${successCount}건 투표 완료! (1번: ${option1Count}표 / 2번: ${option2Count}표)`,
            );
        }

        console.log("\n🏁 모든 투표 시딩 작업이 완벽하게 종료되었습니다!");
    } catch (error) {
        console.error("💥 투표 시딩 스크립트 실행 중 치명적 에러 발생:", error);
    } finally {
        await prisma.$disconnect();
    }
}

seedVotes().then(() => {});
