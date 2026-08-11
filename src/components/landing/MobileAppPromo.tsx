import { memo } from "react";
import {
  tabButtonClass,
  tabButtonCompactBase,
} from "../ui/tabButtonStyles.ts";
import { landingSection } from "./landingStyles.ts";
import Reveal from "./Reveal.tsx";
import SafePublicImage from "./SafePublicImage.tsx";

const STORE_LINKS = [
  { label: "App Store", href: "#" },
  { label: "Google Play", href: "#" },
] as const;

function MobileAppPromo() {
  return (
    <section className={landingSection.promo}>
      <Reveal className="mx-auto max-w-6xl">
        <div className="overflow-hidden rounded-[2.5rem] bg-gray-100">
          <div className="grid items-center gap-10 p-8 md:grid-cols-2 md:gap-12 md:p-12 lg:p-16">
            <div>
              <h2 className="font-sans text-2xl font-bold leading-snug text-black sm:text-3xl md:text-4xl">
                실전 뜨개질은 뜨니와 함께!
                <br />
                AR 내비게이션 앱
              </h2>
              <p className="mt-5 font-rounded text-base font-normal leading-relaxed text-gray-700 md:text-lg">
                웹에서 그린 도안을 앱으로 연동해 보세요. 카메라로 비추면 다음 코를
                안내해 줍니다.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                {STORE_LINKS.map(({ label, href }) => (
                  <a
                    key={label}
                    href={href}
                    className={`inline-flex items-center justify-center rounded-full px-6 py-3 font-sans text-sm font-normal ${tabButtonCompactBase} ${tabButtonClass(false)}`}
                  >
                    {label}
                  </a>
                ))}
              </div>
            </div>

            <SafePublicImage
              src="/그림3_앱홍보_모바일목업.PNG"
              alt="모바일 앱 화면"
              className="max-h-[420px] w-full max-w-sm object-cover md:max-w-md"
              fallbackLabel="public/그림3_앱홍보_모바일목업.PNG"
              fallbackClassName="flex min-h-[280px] w-full max-w-sm items-center justify-center rounded-2xl bg-gray-50 p-6 md:max-w-md"
            />
          </div>
        </div>
      </Reveal>
    </section>
  );
}

export default memo(MobileAppPromo);
