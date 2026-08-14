import { useCallback } from "react";
import FeatureOneSection from "./components/landing/FeatureOneSection.tsx";
import FeatureTwoSection from "./components/landing/FeatureTwoSection.tsx";
import HeroSection from "./components/landing/HeroSection.tsx";
import AppPromotionSection from "./components/landing/AppPromotionSection.tsx";
import LandingFooter from "./components/landing/LandingFooter.tsx";

export type LandingPageProps = {
  onOpenEditor: () => void;
};

export default function LandingPage({ onOpenEditor }: LandingPageProps) {
  const handleOpenEditor = useCallback(() => onOpenEditor(), [onOpenEditor]);

  return (
    <div className="relative overflow-x-hidden">
      <HeroSection onOpenEditor={handleOpenEditor} />
      <FeatureOneSection onOpenEditor={handleOpenEditor} />
      <FeatureTwoSection />
      <AppPromotionSection />
      <LandingFooter />
    </div>
  );
}
