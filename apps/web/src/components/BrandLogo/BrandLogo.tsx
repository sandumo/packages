import Image from 'next/image';

interface BrandLogoProps {
  size?: 'small' | 'medium' | 'large';
  white?: boolean;
  variant?: 'normal' | 'with-text';
}

export default function BrandLogo({ size = 'medium', white = false, variant = 'normal' }: BrandLogoProps) {
  let width = 187;

  if (size === 'small') {
    width = 136;
  } else if (size === 'medium') {
    width = 187;
  } else if (size === 'large') {
    width = 238;
  }

  // let src = '/logo.png';
  let src = '/eyes-logo-1.svg';

  if (variant === 'with-text') {
    src = '/logo-white.png';

    if (white) {
      src = '/logo-white.png';
    }
  } else {
    // src = '/logo-simple.png';
    src = '/eyes-logo-1.svg';

    // return <Image src={src} width={28} height={28} alt="Job" />;
    return <Image src={src} width={36} height={36} alt="Job" />;
  }

  return (
    <Image src={src} width={width} height={(width * 144) / 530} alt="Job" />
  );
}
