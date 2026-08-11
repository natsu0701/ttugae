import { memo, useCallback, useState } from "react";

type SafePublicImageProps = {
  src: string;
  alt: string;
  className?: string;
  fallbackLabel?: string;
  fallbackClassName?: string;
};

function SafePublicImage({
  src,
  alt,
  className,
  fallbackLabel,
  fallbackClassName = "flex min-h-[240px] items-center justify-center rounded-2xl bg-gray-50 p-8",
}: SafePublicImageProps) {
  const [failed, setFailed] = useState(false);
  const onError = useCallback(() => setFailed(true), []);

  if (failed) {
    return (
      <div className={fallbackClassName}>
        <p className="text-center font-sans text-sm font-normal text-gray-500">
          {fallbackLabel ?? src}
        </p>
      </div>
    );
  }

  return <img src={src} alt={alt} className={className} onError={onError} />;
}

export default memo(SafePublicImage);
