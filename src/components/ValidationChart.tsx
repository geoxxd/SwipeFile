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

  const rawData = sortedLogs.map((l) => ({
    date: l.date.length >= 10 ? l.date.slice(5, 10).replace('-', '/') : l.date,
    fullDate: l.date,
    anuncios: Number(l.activeAdsCount) || 0,
    notes: l.notes
  }));

  const lastRecord = rawData[rawData.length - 1];

  // Quando há apenas 1 registro, adicionamos um ponto de referência visual para desenhar uma linha sólida e área preenchida
  const isSinglePoint = rawData.length === 1;
  const chartData = isSinglePoint
    ? [
        { ...rawData[0], isSynthetic: true },
        { ...rawData[0], isSynthetic: false }
      ]
    : rawData;

  const minAds = Math.min(...rawData.map((d) => d.anuncios));
  const maxAds = Math.max(...rawData.map((d) => d.anuncios));

  return (
    <div className="w-full flex flex-col gap-2">
      {!minimal && (
        <div className="flex items-center justify-between text-xs text-[#9CA3AF] px-1">
          <span>Evolução de Anúncios Ativos</span>
          <div className="flex items-center gap-2">
            <span className="font-mono-num font-medium text-[#22C55E]">
              {lastRecord.anuncios} ativos
            </span>
            {isSinglePoint && (
              <span className="text-[10px] text-[#6B7280] bg-[#1F2A1F] px-1.5 py-0.5 rounded">
                1ª medição
              </span>
            )}
          </div>
        </div>
      )}

      <div style={{ width: '100%', height }} className="relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 12, right: 12, left: -20, bottom: 4 }}>
            <defs>
              <linearGradient id="greenGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22C55E" stopOpacity={0.45} />
                <stop offset="95%" stopColor="#22C55E" stopOpacity={0.02} />
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
                domain={[0, Math.max(10, Math.round(maxAds * 1.3))]}
              />
            )}
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="bg-[#111411] border border-[#22C55E]/40 rounded-lg p-2.5 shadow-xl text-xs backdrop-blur-md">
                      <p className="text-[#9CA3AF] font-mono-num mb-1">{item.fullDate}</p>
                      <p className="font-semibold text-[#22C55E] font-mono-num text-sm flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#22C55E] inline-block animate-pulse"></span>
                        {item.anuncios} anúncios ativos
                      </p>
                      {item.notes && (
                        <p className="text-[#D1D5DB] mt-1.5 italic text-[11px] max-w-[220px] leading-relaxed border-t border-[#1F2A1F] pt-1">
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
              dot={{
                r: 4,
                fill: '#111411',
                stroke: '#22C55E',
                strokeWidth: 2
              }}
              activeDot={{
                r: 6,
                fill: '#22C55E',
                stroke: '#ffffff',
                strokeWidth: 2
              }}
              fillOpacity={1}
              fill="url(#greenGlow)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {isSinglePoint && (
        <p className="text-[11px] text-[#6B7280] text-center italic mt-1">
          💡 Adicione a medição dos próximos dias para traçar a curva de escala e validação da oferta.
        </p>
      )}
    </div>
  );
}

