export type RemixLineageNode = {
  id: string;
  patternId: string;
  title: string;
  author: string;
  /** 변경 요약 칩 라벨 */
  changeLabel: string;
  isCurrent?: boolean;
};

/** 패턴별 리믹스 계보 (데모·포트폴리오용) */
const LINEAGE_BY_PATTERN: Record<string, RemixLineageNode[]> = {
  "cp-1": [
    {
      id: "n0",
      patternId: "cp-1",
      title: "체리 키링",
      author: "뜨개하는수진",
      changeLabel: "원본",
      isCurrent: true,
    },
  ],
  "cp-2": [
    {
      id: "n0",
      patternId: "cp-1",
      title: "체리 키링",
      author: "뜨개하는수진",
      changeLabel: "원본",
    },
    {
      id: "n1",
      patternId: "cp-2",
      title: "무지개 스카프",
      author: "yarn_lover",
      changeLabel: "배색 변경",
      isCurrent: true,
    },
  ],
  "cp-3": [
    {
      id: "n0",
      patternId: "cp-1",
      title: "체리 키링",
      author: "뜨개하는수진",
      changeLabel: "원본",
    },
    {
      id: "n1",
      patternId: "cp-2",
      title: "무지개 스카프",
      author: "yarn_lover",
      changeLabel: "길이 확장",
    },
    {
      id: "n2",
      patternId: "cp-3",
      title: "곰돌이 인형",
      author: "teddy_maker",
      changeLabel: "형태 변경",
      isCurrent: true,
    },
  ],
  "cp-6": [
    {
      id: "n0",
      patternId: "cp-4",
      title: "겨울 털모자 기본형",
      author: "뜨니친구",
      changeLabel: "원본",
    },
    {
      id: "n1",
      patternId: "cp-5",
      title: "미니 하트 코스터",
      author: "heart_stitch",
      changeLabel: "무늬 단순화",
    },
    {
      id: "n2",
      patternId: "cp-2",
      title: "무지개 스카프",
      author: "yarn_lover",
      changeLabel: "배색 변경",
    },
    {
      id: "n3",
      patternId: "cp-6",
      title: "베이지 가디건",
      author: "완성작자랑",
      changeLabel: "소매 추가",
      isCurrent: true,
    },
  ],
  "cp-8": [
    {
      id: "n0",
      patternId: "cp-5",
      title: "미니 하트 코스터",
      author: "heart_stitch",
      changeLabel: "원본",
    },
    {
      id: "n1",
      patternId: "cp-8",
      title: "분홍 별 코스터",
      author: "star_table",
      changeLabel: "형태 변경",
      isCurrent: true,
    },
  ],
  "cp-10": [
    {
      id: "n0",
      patternId: "cp-4",
      title: "겨울 털모자 기본형",
      author: "뜨니친구",
      changeLabel: "원본",
    },
    {
      id: "n1",
      patternId: "cp-10",
      title: "노란 비니 모자",
      author: "sunny_knit",
      changeLabel: "배색 변경",
      isCurrent: true,
    },
  ],
};

const DEFAULT_LINEAGE = (patternId: string, title: string, author: string): RemixLineageNode[] => [
  {
    id: "n0",
    patternId: "cp-1",
    title: "체리 키링",
    author: "뜨개하는수진",
    changeLabel: "원본",
  },
  {
    id: "n1",
    patternId,
    title,
    author,
    changeLabel: "리믹스",
    isCurrent: true,
  },
];

export function getRemixLineage(
  patternId: string,
  title: string,
  author: string,
): RemixLineageNode[] {
  return LINEAGE_BY_PATTERN[patternId] ?? DEFAULT_LINEAGE(patternId, title, author);
}
