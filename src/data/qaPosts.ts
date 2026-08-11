export type QaPost = {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  createdAt: string;
  commentCount: number;
  body: string;
};

export type QaAnswer = {
  id: string;
  postId: string;
  author: string;
  createdAt: string;
  body: string;
};

export const QA_POSTS: QaPost[] = [
  {
    id: "qa-1",
    title: "코 고리 뜨개 시 코 수를 어떻게 잡나요?",
    excerpt: "초보자용 체리 키링 도안을 따라 하는데, 코 고리 부분에서 항상 구멍이 벌어져요…",
    author: "뜨개초보99",
    createdAt: "2026.05.20",
    commentCount: 4,
    body: `안녕하세요! 체리 키링 도안 3단에서 코 고리를 뜰 때마다 구멍이 벌어집니다.

사용 실은 4합사이고, 코바늘은 3.5mm입니다. 도안에는 '짧은 뜨기 6코'라고 되어 있는데, 제 뜨개는 항상 8코 정도로 늘어나는 느낌이에요.

혹시 코를 너무 느슨하게 잡는 걸까요? 경험 있으신 분들의 팁 부탁드려요!`,
  },
  {
    id: "qa-2",
    title: "베이지 가디건 소매 길이 조절 방법",
    excerpt: "완성작 자랑에 올라온 가디건 도안인데, 소매만 5cm 정도 더 길게 뜨고 싶어요.",
    author: "긴팔좋아",
    createdAt: "2026.05.18",
    commentCount: 7,
    body: `그림1_완성작_베이지색 가디건.PNG 를 참고해서 뜨고 있는데, 팔 길이가 짧게 느껴집니다.

몸통 도안은 그대로 두고 소매 단만 늘리려면 몇 단을 더 떠야 할까요? 게이지는 10cm에 22코 28단 정도 나옵니다.`,
  },
  {
    id: "qa-3",
    title: "실 색상이 도안과 다르게 나올 때",
    excerpt: "코랄 실을 샀는데 화면에서 보던 것보다 훨씬 붉게 나와요. 교체 실 추천 받고 싶어요.",
    author: "yarn_palette",
    createdAt: "2026.05.15",
    commentCount: 2,
    body: `커뮤니티 도안 미리보기에서는 부드러운 코랄인데, 실제 뜨니 #FC5F53에 가깝지만 너무 쨍해 보입니다.

비슷한 톤의 대체 실 브랜드나, 색을 톤 다운하는 방법이 있을까요?`,
  },
  {
    id: "qa-4",
    title: "도안 에디터에서 격자 불러오기가 안 될 때",
    excerpt: "커뮤니티 카드에서 에디터로 불러오기를 눌렀는데 빈 격자만 나와요.",
    author: "에디터테스트",
    createdAt: "2026.05.12",
    commentCount: 5,
    body: `크롬에서 시도했고, 로그인은 되어 있습니다. 특정 도안(cp-3)만 그런데 새로고침해도 같아요.

혹시 로컬 저장 용량 문제일 수도 있을까요?`,
  },
];

export const QA_ANSWERS: QaAnswer[] = [
  {
    id: "ans-1",
    postId: "qa-1",
    author: "뜨개하는수진",
    createdAt: "2026.05.20",
    body: "짧은 뜨기 코 고리는 코바늘을 살짝 비틀어 넣으면 구멍이 줄어요. 첫 단은 꽉 잡고, 두 번째 단부터 느슨해지지 않게 해보세요!",
  },
  {
    id: "ans-2",
    postId: "qa-1",
    author: "yarn_lover",
    createdAt: "2026.05.21",
    body: "마커 실로 코 수를 표시해 두면 늘어나는 걸 바로 잡을 수 있어요. 6코가 목표면 5코만 뜨고 한 코 더 확인하는 습관도 좋습니다.",
  },
  {
    id: "ans-3",
    postId: "qa-2",
    author: "완성작자랑",
    createdAt: "2026.05.18",
    body: "게이지 기준으로 5cm면 약 14단 추가하시면 됩니다. 소매 끝 2단은 탄성 있게 짧은 뜨기로 마무리해 주세요.",
  },
  {
    id: "ans-4",
    postId: "qa-2",
    author: "teddy_knit",
    createdAt: "2026.05.19",
    body: "완성작 사진(그림1_완성작_베이지색 가디건.PNG) 길이를 재 보시고, 손목까지 오는지 비교해 보시면 단 수 계산이 쉬워요.",
  },
];

export function getQaPost(id: string) {
  return QA_POSTS.find((p) => p.id === id);
}

export function getAnswersForPost(postId: string) {
  return QA_ANSWERS.filter((a) => a.postId === postId);
}
