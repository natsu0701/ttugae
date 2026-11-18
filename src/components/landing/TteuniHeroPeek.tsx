import { memo } from "react";
import { TTEUNI_IMAGES } from "../../constants/tteuniImages.ts";

/**
 * 버튼 아래 남은 높이에 맞춰 크기를 정하고, 위 78%(눈·입·볼)만 담아
 * 얼굴이 잘리지 않게 한다. 다리는 박스 밖으로 둔다.
 */
function TteuniHeroPeek() {
  return (
    <div
      className="pointer-events-none relative z-10 mx-auto mt-5 flex min-h-0 w-full min-w-0 flex-1 basis-0 items-end justify-center overflow-hidden sm:mt-6"
      aria-hidden
    >
      <div
        className="tteuni-peek-shift tteuni-peek-frame relative"
        data-par-dx="22"
        data-par-dy="14"
      >
        <img
          src={TTEUNI_IMAGES.hero}
          alt=""
          className="tteuni-peek block h-auto w-full max-w-none"
        />
      </div>
    </div>
  );
}

export default memo(TteuniHeroPeek);
