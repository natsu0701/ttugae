import { FileText, Grid, MessageSquare, Users, type LucideIcon } from "lucide-react";

export type FeatureTab = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  imagePath: string;
  icon: LucideIcon;
};

export const FEATURE_TABS: FeatureTab[] = [
  {
    id: "editor",
    title: "도안 에디터",
    subtitle: "2D 격자 에디터",
    description:
      "터치와 마우스 드래그로 한 코, 한 코 정교하게 도안을 그릴 수 있습니다. 사용자의 뜨개 바늘 규격과 실의 두께에 따라 캔버스 크기를 유연하게 설정할 수 있어 입문자부터 마스터까지 자신만의 독창적인 패턴을 설계할 수 있습니다.",
    imagePath: "/images/Editor Page.png",
    icon: Grid,
  },
  {
    id: "chatbot",
    title: "AI 챗봇",
    subtitle: "지능형 뜨개 코칭",
    description:
      "인공지능 뜨니가 도안 에디팅 중 실시간으로 오류를 감지하고 보정안을 제시합니다. 대화창에 필요한 가이드를 질문하면 뜨개질 기법을 도안 데이터로 변환하여 캔버스 위에 한 땀씩 한글 또는 기호로 자동 배치해 줍니다.",
    imagePath: "/images/Tteuni AI Chat.png",
    icon: MessageSquare,
  },
  {
    id: "converter",
    title: "서술형 변환",
    subtitle: "자연어 도안 생성",
    description:
      "복잡한 격자 그림 도안을 읽는 피로감을 해소하기 위해, 에디터에 그려진 기호 레이아웃을 '1단: 겉뜨기 2코, 안뜨기 1코'와 같이 자연스러운 서술형 한글 텍스트 도안으로 1초 만에 자동 번역하여 출력합니다.",
    imagePath: "/images/Converting Designs into Descriptive Text.png",
    icon: FileText,
  },
  {
    id: "community",
    title: "커뮤니티",
    subtitle: "라운지 도안 공유",
    description:
      "내가 설계하고 완성한 정성 어린 도안 카드를 포장하여 라운지 피드에 자랑해 보세요. 다른 유저들이 올린 완성작 실물 사진을 마우스로 확인하고, 클릭 한 번으로 내 도안 작업실 에디터 창으로 즉시 가져와 수정 및 배포할 수 있습니다.",
    imagePath: "/images/community.png",
    icon: Users,
  },
];
