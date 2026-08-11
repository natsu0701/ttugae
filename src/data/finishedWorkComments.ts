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
];

export function getCommentsForPattern(patternId: string) {
  return FINISHED_COMMENTS.filter((c) => c.patternId === patternId);
}
