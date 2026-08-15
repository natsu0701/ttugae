import { memo } from "react";
import FeatureBadge from "./FeatureBadge.tsx";
import FeatureInteractiveTabs from "./FeatureInteractiveTabs.tsx";
import Reveal from "./Reveal.tsx";

function FeatureTwoSection() {
  return (
    <section className="relative z-10 w-full border-t border-stone-200/40 bg-stone-50 px-6 py-24 md:px-12 lg:px-20">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mb-16 text-center md:text-left">
          <FeatureBadge>Feature 02</FeatureBadge>
          <h2 className="mt-3 break-keep font-sans text-2xl font-black leading-tight tracking-tight text-stone-900 sm:text-3xl md:text-4xl">
            에디터 중심의 지능형 뜨개 통합 플랫폼
          </h2>
          <p className="mt-2 max-w-xl break-keep font-sans text-sm font-light leading-relaxed text-stone-500">
            수작업으로 복잡하게 계산하던 준비 과정을 웹 스마트 에디터와 커뮤니티로 통합하여, 창작의 몰입감과 즐거움을 극대화합니다.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <FeatureInteractiveTabs />
        </Reveal>
      </div>
    </section>
  );
}

export default memo(FeatureTwoSection);
