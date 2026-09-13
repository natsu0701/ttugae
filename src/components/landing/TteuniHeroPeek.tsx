import { memo } from "react";
import { TTEUNI_IMAGES } from "../../constants/tteuniImages.ts";

/**
 * 뜨니 SVG(705×776)에서 눈은 세로 약 43~51% 지점, 바늘·잎사귀는 그 위에 있다.
 * 래퍼가 남은 뷰포트만 차지하고, 이미지는 상단(머리)을 기준으로 약 167% 키워
 * 보이는 구간이 항상 "눈 + 그 위"가 되도록 자른다. 다리는 하단에서만 잘린다.
 */
const FACE_CROP_HEIGHT = "167%";

function TteuniHeroPeek() {
  return (
    <div
      className="pointer-events-none relative z-10 mx-auto mt-auto flex min-h-0 w-full min-w-0 flex-1 basis-0 items-start justify-center overflow-hidden"
      aria-hidden
    >
      <img
        src={TTEUNI_IMAGES.hero}
        alt=""
        className="tteuni-peek relative w-auto max-w-none origin-top object-cover object-top"
        style={{ height: FACE_CROP_HEIGHT, position: "relative" }}
      />
    </div>
  );
}

export default memo(TteuniHeroPeek);
