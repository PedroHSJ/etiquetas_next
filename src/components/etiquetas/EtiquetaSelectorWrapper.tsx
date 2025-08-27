'use client';

import React from 'react';
import { useMobile } from '@/hooks/use-mobile';
import { EtiquetaSelector } from './EtiquetaSelector';
import { MobileEtiquetaSelector } from './MobileEtiquetaSelector';

interface EtiquetaSelectorWrapperProps {
  onEtiquetaCreated?: () => void;
}

export function EtiquetaSelectorWrapper({ onEtiquetaCreated }: EtiquetaSelectorWrapperProps) {
  const isMobile = useMobile();

  if (isMobile) {
    return <MobileEtiquetaSelector onEtiquetaCreated={onEtiquetaCreated} />;
  }

  return <EtiquetaSelector onEtiquetaCreated={onEtiquetaCreated} />;
}
