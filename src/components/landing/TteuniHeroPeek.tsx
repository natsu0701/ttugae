import { memo } from "react";
import { TTEUNI_IMAGES } from "../../constants/tteuniImages.ts";

/**
 * 뜨니 PNG(1128×1225)에서 눈은 세로 약 49% 지점, 바늘·잎사귀는 그 위에 있다.
 * 높이를 남은 영역의 170%로 두고 위를 맞추면 보이는 구간이 이미지 상단 약 59%가
 * 되어 눈과 그 위만 남고 다리는 잘린다.
 * 인플로우 자식의 % 높이는 부모가 자기 높이에 기대면 auto가 되어, PNG 원본
 * 1225px이 그대로 그려지고 눈이 화면 아래로 밀린다. 그래서 이미지는 높이가
 * 정해진 플렉스 영역에 절대 위치로 둔다.
 */
const FACE_CROP_HEIGHT = "170%";

function TteuniHeroPeek() {
  return (
    <div
      className="pointer-events-none relative z-10 mx-auto mt-auto min-h-0 w-full min-w-0 flex-1 basis-0 overflow-hidden"
      aria-hidden
    >
      <div
        className="tteuni-peek tteuni-peek-shift absolute inset-x-0 top-0 flex justify-center"
        style={{ height: FACE_CROP_HEIGHT }}
        data-par-dx="22"
        data-par-dy="14"
      >
        <img src={TTEUNI_IMAGES.hero} alt="" className="block h-full w-auto max-w-none" />
      </div>
    </div>
  );
}

export default memo(TteuniHeroPeek);
