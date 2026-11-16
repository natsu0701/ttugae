import { memo } from "react";
import { TTEUNI_IMAGES } from "../../constants/tteuniImages.ts";

/**
 * 뜨니 PNG(1128×1225)에서 눈은 세로 약 49%다.
 * 너비는 화면보다 조금 작게 잡아 오른쪽 아래 버튼과 겹치지 않게 하고,
 * 아래를 기준으로 42%를 내려 눈과 그 위만 남긴다. 다리는 잘린다.
 */
function TteuniHeroPeek() {
  return (
    <div
      className="pointer-events-none relative z-10 mx-auto mt-auto min-h-32 w-full min-w-0 flex-1 basis-0 overflow-hidden [@media(max-height:760px)]:min-h-20"
      aria-hidden
    >
      <div
        className="tteuni-peek-shift absolute bottom-0 left-1/2 w-max max-w-none -translate-x-1/2 translate-y-[42%]"
        data-par-dx="22"
        data-par-dy="14"
      >
        <img
          src={TTEUNI_IMAGES.hero}
          alt=""
          className="tteuni-peek block h-auto w-[min(28rem,calc(100vw-9rem))] max-w-none"
        />
      </div>
    </div>
  );
}

export default memo(TteuniHeroPeek);
