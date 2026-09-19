import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';
import { ValidationLog } from '../types/index.ts';

interface ValidationChartProps {
  logs: ValidationLog[];
  height?: number;
  minimal?: boolean;
}

export function ValidationChart({ logs, height = 180, minimal = false }: ValidationChartProps) {
  if (!logs || logs.length === 0) {
    return (
      <div
        style={{ height }}
        className="flex flex-col items-center justify-center text-center p-4 rounded-xl border border-dashed border-[#1F2A1F] text-[#6B7280] text-xs"
      >
        Nenhum registro de validação ainda.
      </div>
    );
  }

  const sortedLogs = [...logs].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const data = sortedLogs.map((l) => ({
    date: l.date.slice(5).replace('-', '/'),
    fullDate: l.date,
    anuncios: l.activeAdsCount,
    notes: l.notes
  }));

  const minAds = Math.min(...data.map((d) => d.anuncios));
  const maxAds = Math.max(...data.map((d) => d.anuncios));
  const isGrowing = data.length > 1 && data[data.length - 1].anuncios >= data[0].anuncios;

  return (
    <div className="w-full flex flex-col gap-2">
      {!minimal && (
        <div className="flex items-center justify-between text-xs text-[#9CA3AF] px-1">
          <span>Evolução de Anúncios Ativos</span>
          <span className="font-mono-num font-medium text-[#22C55E]">
            {data[data.length - 1].anuncios} ativos atualmente
          </span>
        </div>
      )}

      <div style={{ width: '100%', height }} className="relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
            <defs>
              <linearGradient id="greenGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22C55E" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#22C55E" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            {!minimal && (
              <XAxis
                dataKey="date"
                stroke="#4B5563"
                fontSize={10}
                tickLine={false}
                axisLine={{ stroke: '#1F2A1F' }}
              />
            )}
            {!minimal && (
              <YAxis
                stroke="#4B5563"
                fontSize={10}
                tickLine={false}
                axisLine={{ stroke: '#1F2A1F' }}
                domain={[Math.max(0, minAds - 5), maxAds + 5]}
              />
            )}
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="bg-[#111411] border border-[#22C55E]/30 rounded-lg p-2.5 shadow-xl text-xs backdrop-blur-md">
                      <p className="text-[#9CA3AF] font-mono-num mb-1">{item.fullDate}</p>
                      <p className="font-semibold text-[#22C55E] font-mono-num text-sm">
                        {item.anuncios} anúncios ativos
                      </p>
                      {item.notes && (
                        <p className="text-[#D1D5DB] mt-1 italic text-[11px] max-w-[200px] leading-tight">
                          "{item.notes}"
                        </p>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="anuncios"
              stroke="#22C55E"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#greenGlow)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
