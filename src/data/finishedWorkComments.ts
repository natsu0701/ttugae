export type FinishedComment = {
  id: string;
  patternId: string;
  author: string;
  createdAt: string;
  body: string;
};

export const FINISHED_COMMENTS: FinishedComment[] = [
  {
    id: "fc-1",
    patternId: "cp-6",
    author: "yarn_lover",
    createdAt: "2026.05.18",
    body: "색감이 진짜 예뻐요! 소매 늘리신 분들은 14단 더 뜨시면 될 것 같아요.",
  },
  {
    id: "fc-2",
    patternId: "cp-6",
    author: "뜨개초보99",
    createdAt: "2026.05.19",
    body: "도안 그대로 따라 했는데 사이즈 딱 맞았어요. 감사합니다!",
  },
  {
    id: "fc-3",
    patternId: "cp-3",
    author: "heart_stitch",
    createdAt: "2026.05.10",
    body: "곰돌이 귀 달 때 솜 조금만 넣으세요. 너무 많으면 떡져 보여요 ㅎㅎ",
  },
  {
    id: "fc-4",
    patternId: "cp-7",
    author: "winter_hands",
    createdAt: "2026.05.21",
    body: "손목 리브 길이만 조금 늘렸더니 장갑이 잘 안 빠져요. 손가락 가르기는 표시실 두고 뜨면 편합니다.",
  },
  {
    id: "fc-5",
    patternId: "cp-8",
    author: "heart_stitch",
    createdAt: "2026.05.23",
    body: "하트 코스터랑 세트로 떴어요. 별 꼭짓점은 짧은 뜨기로 잡아 주니 모양이 살아납니다.",
  },
  {
    id: "fc-6",
    patternId: "cp-9",
    author: "뜨개초보99",
    createdAt: "2026.05.25",
    body: "뒤꿈치 돌리기가 처음이라 헤맸는데, 한 짝 뜨고 코 수를 적어두니 둘째 짝이 맞았어요.",
  },
  {
    id: "fc-7",
    patternId: "cp-10",
    author: "yarn_lover",
    createdAt: "2026.05.27",
    body: "회색 기본형이랑 같은 도안이라 금방 따라 했어요. 노란 색이 봄에 잘 어울려요.",
  },
  {
    id: "fc-8",
    patternId: "cp-1",
    author: "yarnlover",
    createdAt: "2026.05.12",
    body: "체리 꼭지 색만 바꿔도 분위기가 달라져서 따라 떴어요.",
  },
  {
    id: "fc-9",
    patternId: "cp-1",
    author: "teddyknit",
    createdAt: "2026.05.13",
    body: "키링 고리 달 때 코가 풀리지 않게 매듭을 한 번 더 해주세요.",
  },
  {
    id: "fc-10",
    patternId: "cp-1",
    author: "heartstitch",
    createdAt: "2026.05.14",
    body: "면사라 여름에 들고 다니기 좋아요. 도안 감사합니다.",
  },
  {
    id: "fc-11",
    patternId: "cp-1",
    author: "sunnyknit",
    createdAt: "2026.05.15",
    body: "초보도 하루면 끝나는 크기라 선물용으로 딱입니다.",
  },
  {
    id: "fc-12",
    patternId: "cp-1",
    author: "fingertip",
    createdAt: "2026.05.16",
    body: "잎사귀 코 수가 조금 타이트해서 바늘을 0.5호 올렸어요.",
  },
  {
    id: "fc-13",
    patternId: "cp-1",
    author: "socklane",
    createdAt: "2026.05.17",
    body: "같은 도안으로 딸기 색 조합도 예쁠 것 같아요.",
  },
];

export function getCommentsForPattern(patternId: string) {
  return FINISHED_COMMENTS.filter((c) => c.patternId === patternId);
}
