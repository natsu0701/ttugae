type BrandTextLogoProps = {
  className?: string;
};

/** 화면용 워드마크. alt는 접근성·검색용으로 브랜드명을 유지합니다. */
export default function BrandTextLogo({
  className = "h-6 w-auto object-contain",
}: BrandTextLogoProps) {
  return (
    <img
      src="/images/text_logo.png"
      alt="뜨개러투게더"
      className={className}
    />
  );
}
