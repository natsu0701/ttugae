export type QaPost = {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  createdAt: string;
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
    body: `완성작 자랑의 베이지 가디건을 참고해서 뜨고 있는데, 팔 길이가 짧게 느껴집니다.

몸통 도안은 그대로 두고 소매 단만 늘리려면 몇 단을 더 떠야 할까요? 게이지(Gauge)는 10cm에 22코 28단 정도 나옵니다.`,
  },
  {
    id: "qa-3",
    title: "실 색상이 도안과 다르게 나올 때",
    excerpt: "코랄 실을 샀는데 화면에서 보던 것보다 훨씬 붉게 나와요. 교체 실 추천 받고 싶어요.",
    author: "yarn_palette",
    createdAt: "2026.05.15",
    body: `커뮤니티 도안 미리보기에서는 부드러운 코랄인데, 실제 뜨니 #FC5F53에 가깝지만 너무 쨍해 보입니다.

비슷한 톤의 대체 실 브랜드나, 색을 톤 다운하는 방법이 있을까요?`,
  },
  {
    id: "qa-4",
    title: "도안 에디터에서 격자 불러오기가 안 될 때",
    excerpt: "커뮤니티 카드에서 에디터로 불러오기를 눌렀는데 빈 격자만 나와요.",
    author: "에디터테스트",
    createdAt: "2026.05.12",
    body: `크롬에서 시도했고, 로그인은 되어 있습니다. 특정 도안(cp-3)만 그런데 새로고침해도 같아요.

혹시 로컬 저장 용량 문제일 수도 있을까요?`,
  },
  {
    id: "qa-5",
    title: "겨울 털모자, 줄바늘로 원통 뜰 때 이음선이 생겨요",
    excerpt: "20×20 그레이 겉뜨기 기본형인데, 줄바늘로 떠도 시작 코 쪽이 살짝 비뚤어집니다.",
    author: "뜨니친구",
    createdAt: "2026.05.10",
    body: `겨울 털모자 기본형을 줄바늘 5.0mm로 원통 뜨기 하고 있어요.

겉뜨기만 이어서 뜨는데, 매 단 시작 지점이 조금씩 기울면서 이음선처럼 보여요. 마커를 옮겨 가며 뜨는 게 맞을까요? 아니면 단 시작을 한 코씩 밀어 줘야 하나요?`,
  },
  {
    id: "qa-6",
    title: "화이트 장갑 손가락 가르기 순서가 헷갈려요",
    excerpt: "손등까지는 잘 떴는데, 엄지랑 나머지 손가락을 나누는 타이밍을 모르겠어요.",
    author: "winter_hands",
    createdAt: "2026.05.08",
    body: `포근한 화이트 장갑 도안을 따라 뜨는 중입니다. 손목 리브는 2코 겉·2코 안으로 끝났고, 손등도 겉뜨기로 올렸어요.

손가락을 가를 때 남은 코를 어떻게 배분하나요? 표시실을 어디에 두면 안 헷갈릴까요? 장갑바늘 3.5mm 사용 중입니다.`,
  },
  {
    id: "qa-7",
    title: "분홍 양말 뒤꿈치를 돌리다가 구멍이 생겼어요",
    excerpt: "한 짝은 완성했는데 뒤꿈치 모서리가 성깁니다. 둘째 짝 뜨기 전에 잡고 싶어요.",
    author: "sock_lane",
    createdAt: "2026.05.06",
    body: `포근한 분홍 양말 도안으로 첫 짝을 떴습니다. 발등 게이지(Gauge)는 맞는데, 뒤꿈치를 짧은 줄기로 돌리는 구간에서 구멍이 남아요.

코 수를 적어 두라는 후기는 봤는데, 구멍은 어떻게 메우나요? 집기 뜨기를 넣어야 할까요?`,
  },
  {
    id: "qa-8",
    title: "하트 코스터랑 별 코스터, 코 수를 같이 맞춰도 되나요?",
    excerpt: "식탁에 세트로 두고 싶은데 크기가 달라질까 봐 걱정입니다.",
    author: "star_table",
    createdAt: "2026.05.04",
    body: `미니 하트 코스터는 12×12이고, 분홍 별 코스터도 12×12로 되어 있어요.

같은 면 실 3합·코바늘 4호로 뜨면 실제 크기도 비슷하게 나올까요? 별 꼭짓점만 짧은 뜨기로 잡아 주면 하트랑 세트가 될까요?`,
  },
  {
    id: "qa-9",
    title: "무지개 스카프는 도안이 없다는데 어떻게 따라 뜨나요?",
    excerpt: "완성작 사진만 있고 격자가 안 보여서, 배색 순서만 알면 될지 궁금합니다.",
    author: "pastel_row",
    createdAt: "2026.05.01",
    body: `파스텔 무지개 스카프 게시글에 첨부 도안이 없다고 나와 있어요. AI 예상 이미지만 보입니다.

줄무늬 배색만 반복하면 되는 걸까요? 대바늘 4.5mm 줄바늘로 평면으로 떠도 될까요, 아니면 원통이 맞나요?`,
  },
  {
    id: "qa-10",
    title: "노란 비니랑 회색 털모자, 도안이 정말 같나요?",
    excerpt: "색만 바꿔서 뜨고 싶은데 코·단 수가 같은지 확인하고 싶어요.",
    author: "sunny_knit",
    createdAt: "2026.04.28",
    body: `노란 비니 모자 후기에 회색 기본형과 같은 도안이라고 되어 있습니다.

둘 다 20×20인가요? 노란 쪽은 줄바늘 5.5mm, 회색은 5.0mm로 보이는데 바늘이 달라도 형태는 같게 나오나요? 챙 리브는 몇 단이 적당한지도 알려 주세요.`,
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
    body: "게이지(Gauge) 기준으로 5cm면 약 14단 추가하시면 됩니다. 소매 끝 2단은 탄성 있게 짧은 뜨기로 마무리해 주세요.",
  },
  {
    id: "ans-4",
    postId: "qa-2",
    author: "teddy_knit",
    createdAt: "2026.05.19",
    body: "완성작 자랑의 베이지 가디건 사진 길이를 재 보시고, 손목까지 오는지 비교해 보시면 단 수 계산이 쉬워요.",
  },
  {
    id: "ans-5",
    postId: "qa-3",
    author: "heart_stitch",
    createdAt: "2026.05.16",
    body: "같은 코랄이라도 면 실은 화면보다 선명하게 나와요. 베이지를 한 줄 섞거나, 한 호수 굵은 바늘로 느슨하게 뜨면 톤이 내려갑니다.",
  },
  {
    id: "ans-6",
    postId: "qa-4",
    author: "에디터테스트",
    createdAt: "2026.05.13",
    body: "곰돌이 도안은 불러오기가 됩니다. 빈 격자로 열리면 커뮤니티에서 다시 한 번 ‘에디터로 불러오기’를 눌러 보세요.",
  },
  {
    id: "ans-7",
    postId: "qa-5",
    author: "뜨개하는수진",
    createdAt: "2026.05.11",
    body: "원통 겉뜨기는 단마다 시작 코가 한 칸씩 밀립니다. 마커를 단 시작에 두고, 기울임이 보이면 한 코 앞에서 단을 바꿔 주세요.",
  },
  {
    id: "ans-8",
    postId: "qa-6",
    author: "손끝뜨개",
    createdAt: "2026.05.09",
    body: "손등 코를 넷으로 나눈 뒤 엄지는 옆에서 따로 빼요. 가르기 직전에 표시실을 네 곳에 걸어 두면 순서가 안 섞입니다.",
  },
  {
    id: "ans-9",
    postId: "qa-7",
    author: "뜨개초보99",
    createdAt: "2026.05.07",
    body: "돌리는 모서리에서 옆 코를 같이 집어 뜨면 구멍이 줄어들어요. 둘째 짝은 첫 짝 코 수를 옆에 두고 같은 단에서 접어 주세요.",
  },
  {
    id: "ans-10",
    postId: "qa-8",
    author: "heart_stitch",
    createdAt: "2026.05.05",
    body: "같은 실·같은 호수면 크기가 거의 같아요. 별 꼭짓점만 짧게 잡아 주면 하트랑 세트로 두기 좋습니다.",
  },
  {
    id: "ans-11",
    postId: "qa-9",
    author: "yarn_lover",
    createdAt: "2026.05.02",
    body: "도안 없이 올린 글이라 배색 순서만 참고하면 됩니다. 줄바늘로 평면 왕복 뜨기 해도 되고, 원통이면 이음선이 없어요.",
  },
  {
    id: "ans-12",
    postId: "qa-10",
    author: "뜨니친구",
    createdAt: "2026.04.29",
    body: "격자는 둘 다 20×20 겉뜨기 기본형이에요. 바늘이 0.5mm 굵으면 조금 커지니, 챙 리브는 8단 정도로 맞춰 보세요.",
  },
];

export function getQaPost(id: string) {
  return QA_POSTS.find((p) => p.id === id);
}

export function getAnswersForPost(postId: string) {
  return QA_ANSWERS.filter((a) => a.postId === postId);
}

export function getQaCommentCount(postId: string) {
  return getAnswersForPost(postId).length;
}
