
import { useState, useEffect } from 'react';

const MOBILE_BREAKPOINT = 768; // Match the use-mobile hook
const TABLET_BREAKPOINT = 1024; // lg breakpoint in Tailwind

export const useMobile = () => {
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isTablet, setIsTablet] = useState<boolean>(false);

  useEffect(() => {
    const checkDeviceType = () => {
      const width = window.innerWidth;
      setIsMobile(width < MOBILE_BREAKPOINT);
      setIsTablet(width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT);
    };

    checkDeviceType();
    window.addEventListener('resize', checkDeviceType);

    return () => window.removeEventListener('resize', checkDeviceType);
  }, []);

  return { isMobile, isTablet };
};
