import React from 'react';
import { OfferStatus } from '../types/index.ts';

interface StatusBadgeProps {
  status: OfferStatus;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
}

export const statusConfig: Record<
  OfferStatus,
  { label: string; color: string; bg: string; border: string; dot: string }
> = {
  validada: {
    label: 'Validada',
    color: 'text-[#22C55E]',
    bg: 'bg-[#22C55E]/10',
    border: 'border-[#22C55E]/30',
    dot: 'bg-[#22C55E]'
  },
  em_teste: {
    label: 'Em teste',
    color: 'text-[#EAB308]',
    bg: 'bg-[#EAB308]/10',
    border: 'border-[#EAB308]/30',
    dot: 'bg-[#EAB308]'
  },
  escalando: {
    label: 'Escalando',
    color: 'text-[#84CC16]',
    bg: 'bg-[#84CC16]/10',
    border: 'border-[#84CC16]/30',
    dot: 'bg-[#84CC16]'
  },
  pausada: {
    label: 'Pausada',
    color: 'text-[#9CA3AF]',
    bg: 'bg-[#374151]/30',
    border: 'border-[#4B5563]/30',
    dot: 'bg-[#9CA3AF]'
  },
  morta: {
    label: 'Morta',
    color: 'text-[#EF4444]',
    bg: 'bg-[#EF4444]/10',
    border: 'border-[#EF4444]/30',
    dot: 'bg-[#EF4444]'
  }
};

export function StatusBadge({ status, size = 'sm', showDot = true }: StatusBadgeProps) {
  const conf = statusConfig[status] || statusConfig['em_teste'];

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-medium',
    lg: 'px-3 py-1.5 text-sm font-medium'
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium border ${conf.bg} ${conf.color} ${conf.border} ${sizeClasses} whitespace-nowrap`}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${conf.dot} animate-pulse`} />}
      <span>{conf.label}</span>
    </span>
  );
}
