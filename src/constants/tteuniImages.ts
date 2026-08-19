/**
 * 뜨니 마스코트 이미지 경로 (public/ 루트)
 * 동일 파일명의 SVG를 넣으면 앱 전역에 바로 반영됩니다.
 */
export const TTEUNI_IMAGES = {
  /** 홈 Hero — 하단에서 빼꼼, 눈과 그 위 얼굴은 항상 보이게 */
  hero: "/뜨니_메인반신.svg",
  /** 에디터 AI 챗봇 아바타 */
  chatProfile: "/뜨니_챗봇프로필.svg",
  /** 커뮤니티 히어로 옆 장식 */
  community: "/뜨니_커뮤니티.svg",
  /** 랜딩 기능( AI 챗 등) 설명용 */
  feature: "/뜨니_기능설명.svg",
} as const;
