export type RegionCity = {
  name: string;
  dongs: string[];
};

export type RegionProvince = {
  name: string;
  cities: RegionCity[];
};

export const KOREA_REGIONS: RegionProvince[] = [
  {
    name: "서울특별시",
    cities: [
      { name: "마포구", dongs: ["망원동", "합정동", "서교동", "연남동", "상수동"] },
      { name: "서대문구", dongs: ["연희동", "신촌동", "홍제동", "북가좌동"] },
      { name: "성동구", dongs: ["성수동", "금호동", "왕십리동", "행당동"] },
      { name: "강남구", dongs: ["역삼동", "삼성동", "청담동", "논현동", "대치동"] },
      { name: "종로구", dongs: ["혜화동", "삼청동", "평창동", "사직동"] },
      { name: "용산구", dongs: ["이태원동", "한남동", "효창동"] },
    ],
  },
  {
    name: "경기도",
    cities: [
      { name: "수원시", dongs: ["인계동", "영통동", "행궁동"] },
      { name: "성남시", dongs: ["정자동", "이매동", "백현동"] },
      { name: "고양시", dongs: ["일산동", "주엽동", "화정동"] },
      { name: "용인시", dongs: ["죽전동", "기흥동", "동천동"] },
    ],
  },
  {
    name: "부산광역시",
    cities: [
      { name: "해운대구", dongs: ["우동", "중동", "좌동"] },
      { name: "수영구", dongs: ["광안동", "남천동"] },
      { name: "부산진구", dongs: ["부전동", "전포동"] },
    ],
  },
  {
    name: "대구광역시",
    cities: [
      { name: "중구", dongs: ["동성로", "삼덕동"] },
      { name: "수성구", dongs: ["범어동", "만촌동"] },
    ],
  },
  {
    name: "인천광역시",
    cities: [
      { name: "연수구", dongs: ["송도동", "연수동"] },
      { name: "남동구", dongs: ["구월동", "간석동"] },
    ],
  },
];

export function formatRegion(province: string, city: string, dong: string): string {
  return [province, city, dong].filter(Boolean).join(" ");
}

export function splitRegion(raw: string): { province: string; city: string; dong: string } {
  const parts = raw.trim().split(/\s+/);
  return {
    province: parts[0] ?? "",
    city: parts[1] ?? "",
    dong: parts.slice(2).join(" "),
  };
}

export function searchDongs(query: string): { province: string; city: string; dong: string }[] {
  const q = query.trim();
  if (!q) return [];
  const hits: { province: string; city: string; dong: string }[] = [];
  for (const province of KOREA_REGIONS) {
    for (const city of province.cities) {
      for (const dong of city.dongs) {
        const label = `${province.name} ${city.name} ${dong}`;
        if (label.includes(q) || dong.includes(q) || city.name.includes(q)) {
          hits.push({ province: province.name, city: city.name, dong });
        }
      }
    }
  }
  return hits.slice(0, 12);
}
