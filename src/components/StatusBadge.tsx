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
    color: 'text-[#00A63E]',
    bg: 'bg-[#00A63E]/15',
    border: 'border-[#00A63E]/40',
    dot: 'bg-[#00A63E]'
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
    color: 'text-[#00C84B]',
    bg: 'bg-[#00A63E]/20',
    border: 'border-[#00A63E]/50',
    dot: 'bg-[#00C84B]'
  },
  pausada: {
    label: 'Pausada',
    color: 'text-[#9CA3AF]',
    bg: 'bg-[#262A26]',
    border: 'border-[#3A403A]/40',
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
