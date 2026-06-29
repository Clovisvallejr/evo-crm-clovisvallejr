import type { CSSProperties } from 'react';


interface AppLogoProps {
  className?: string;
  alt?: string;
  style?: CSSProperties;
  forceTheme?: 'dark' | 'light';
}

export function AppLogo({ className, alt = 'Império CRM', style }: AppLogoProps) {
  return <img src="/logo.png" alt={alt} className={className} style={style} />;
}
