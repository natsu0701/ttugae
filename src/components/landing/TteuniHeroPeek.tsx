import { memo } from "react";
import { TTEUNI_IMAGES } from "../../constants/tteuniImages.ts";

/**
 * 뜨니 전체를 버튼 아래 칸에 맞춰 넣는다. 잘라 내지 않는다.
 */
function TteuniHeroPeek() {
  return (
    <div
      className="pointer-events-none relative z-10 mx-auto mt-4 flex min-h-0 w-full min-w-0 flex-1 basis-0 items-end justify-center sm:mt-5"
      aria-hidden
    >
      <img
        src={TTEUNI_IMAGES.hero}
        alt=""
        className="tteuni-peek tteuni-hero-mascot block min-h-0"
      />
    </div>
  );
}

export default memo(TteuniHeroPeek);
