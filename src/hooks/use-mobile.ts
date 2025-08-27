import { useState, useEffect } from 'react';

export function useMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      // Verificar se é um dispositivo móvel baseado na largura da tela
      const mobileBreakpoint = 768; // Tailwind's md breakpoint
      setIsMobile(window.innerWidth < mobileBreakpoint);
    };

    // Verificar na montagem
    checkMobile();

    // Verificar quando a janela é redimensionada
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}
