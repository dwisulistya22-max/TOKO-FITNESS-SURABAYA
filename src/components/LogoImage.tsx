import { useMemo, useState } from 'react';
import { STORE_CONFIG } from '../data/config';

interface LogoImageProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
}

const defaultCandidates = [
  '/logo-toko.png',
  '/logo-toko.jpg',
  '/logo-toko.jpeg',
  '/logo-toko.webp',
  STORE_CONFIG.logoFallback,
];

const LogoImage = ({ src, alt, className, style }: LogoImageProps) => {
  const candidates = useMemo(() => {
    const isCustom = src.startsWith('data:') || src.startsWith('http://') || src.startsWith('https://');
    if (isCustom) return [src, STORE_CONFIG.logoFallback];
    const merged = [src, ...defaultCandidates];
    return Array.from(new Set(merged));
  }, [src]);

  const [index, setIndex] = useState(0);

  return (
    <img
      src={candidates[index]}
      alt={alt}
      className={className}
      style={style}
      onError={() => {
        setIndex((prev) => (prev < candidates.length - 1 ? prev + 1 : prev));
      }}
    />
  );
};

export default LogoImage;
