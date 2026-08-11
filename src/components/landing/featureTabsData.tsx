import type { ReactNode } from "react";

export type FeatureTab = {
  id: string;
  title: string;
  shortLabel: string;
  description: string;
  image: string;
  icon: ReactNode;
};

export const FEATURE_TABS: FeatureTab[] = [
  {
    id: "editor",
    title: "스마트 도안 에디터",
    shortLabel: "에디터",
    description:
      "격자 위에 뜨개 기호와 실 색을 직접 배치하고, 사이즈를 자유롭게 조절해 보세요. 초보자도 클릭 몇 번으로 나만의 도안을 완성할 수 있어요.",
    image: "그림2_기능1_에디터.PNG",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    id: "ai-chat",
    title: "AI 뜨니 챗봇",
    shortLabel: "AI 챗",
    description:
      "채팅으로 원하는 디자인을 말하면, 뜨니가 찰떡같이 알아듣고 도안의 초안을 만들어 주거나 쉽게 수정해 줘요!",
    image: "그림2_기능2_AI챗봇.PNG",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
        <path d="M4 5h16v10H7l-3 3V5z" />
      </svg>
    ),
  },
  {
    id: "narrative",
    title: "도안 서술형 자동 변환",
    shortLabel: "서술 변환",
    description:
      "그린 도안을 행·열 단위 서술형 텍스트로 자동 변환해요. 인쇄용 도안지나 공유용 설명을 따로 적을 필요가 없어요.",
    image: "그림2_기능3_서술형변환.PNG",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
        <path d="M5 6h14v2H5V6zm0 5h14v2H5v-2zm0 5h10v2H5v-2z" />
      </svg>
    ),
  },
  {
    id: "community",
    title: "오픈 커뮤니티",
    shortLabel: "커뮤니티",
    description:
      "다른 뜨개러들의 도안과 완성작을 구경하고, 마음에 드는 작품은 에디터로 바로 가져와 떠 보세요. Q&A로 궁금한 점도 나눠요.",
    image: "그림2_기능4_커뮤니티.PNG",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
        <circle cx="9" cy="9" r="2.5" />
        <circle cx="15" cy="9" r="2.5" />
        <path d="M4 18c0-2.5 2.2-4.5 5-4.5h6c2.8 0 5 2 5 4.5" />
      </svg>
    ),
  },
];
