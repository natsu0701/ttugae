import { memo } from "react";
import { TTEUNI_IMAGES } from "../../constants/tteuniImages.ts";

/**
 * 버튼 아래 칸에 뜨니 전체를 넣는다. 패럴랙스 여유(px-10 py-8) 안에서만 움직여 잘리지 않는다.
 */
function TteuniHeroPeek() {
  return (
    <div
      className="pointer-events-none relative z-10 mx-auto mt-4 flex min-h-0 w-full min-w-0 flex-1 basis-0 items-end justify-center overflow-visible px-10 py-8 sm:mt-5"
      aria-hidden
    >
      <div
        className="tteuni-peek-shift flex h-full max-h-full w-full min-h-0 items-end justify-center"
        data-par-dx="20"
        data-par-dy="14"
      >
        <img
          src={TTEUNI_IMAGES.hero}
          alt=""
          className="tteuni-peek tteuni-hero-mascot block min-h-0"
        />
      </div>
    </div>
  );
}

export default memo(TteuniHeroPeek);
