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
];

export function getCommentsForPattern(patternId: string) {
  return FINISHED_COMMENTS.filter((c) => c.patternId === patternId);
}
