import { assetUrl } from "../utils/appPath.ts";

/** `public/about/intro.mp4` 파일을 넣으면 소개 페이지 영상이 바로 재생됩니다. */
export const ABOUT_INTRO_VIDEO_SRC = assetUrl("/about/intro.mp4");

export const ABOUT_APP_IMAGES = {
  overview: assetUrl("/about/app-overview.png"),
  background: assetUrl("/about/app-background.png"),
  research: assetUrl("/about/app-research.png"),
  hero: assetUrl("/about/app-hero.png"),
  home: assetUrl("/about/app-home.jpg"),
  bag: assetUrl("/about/app-bag.jpg"),
  gauge: assetUrl("/about/app-gauge.jpg"),
  webNavi: assetUrl("/about/app-web-navi.png"),
  brand: assetUrl("/about/app-brand.png"),
} as const;
