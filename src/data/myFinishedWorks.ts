export type MyFinishedWork = {
  id: string;
  title: string;
  image: string;
  caption: string;
  completedAt: string;
};

/** public/images/ — 파일명 규칙: 그림N_완성작_이름.PNG */
export const MY_FINISHED_WORKS: MyFinishedWork[] = [
  {
    id: "fw-1",
    title: "베이지 가디건",
    image: "그림1_완성작_베이지색가디건.PNG",
    caption:
      "사용 실: 메리노 울 100%, 바늘: 4.5mm. 뜨는 데 2주 걸렸어요! 소매 부분 코줄임이 헷갈렸는데 뜨니 코칭 덕분에 완성했네요😊",
    completedAt: "2026.04.12",
  },
  {
    id: "fw-2",
    title: "따뜻한 목도리",
    image: "그림2_완성작_목도리.PNG",
    caption:
      "알파카 실 2합, 5mm 바늘. 출퇴근길에 떴더니 금방 끝났어요. 겉뜨기와 안뜨기를 번갈아 넣어 촘촘하게 마무리했습니다.",
    completedAt: "2026.03.28",
  },
  {
    id: "fw-3",
    title: "체리 키링",
    image: "그림1_완성작_체리키링.PNG",
    caption: "남은 실뭉치로 만든 미니 프로젝트! 코 고리 부분만 조심하면 초보자도 하루 만에 가능해요.",
    completedAt: "2026.02.05",
  },
];

export function finishedWorkImageUrl(filename: string) {
  return `/images/${encodeURI(filename)}`;
}
