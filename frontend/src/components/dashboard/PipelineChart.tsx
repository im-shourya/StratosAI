"use client";

import { useState, useEffect } from "react";
import clsx from "clsx";
import { MoreHorizontal } from "lucide-react";
import { fetchApi } from "@/lib/api";

interface PipelineStage {
  label: string;
  value: number;
  displayValue: string;
}

const MAX_VALUE = 70;
const Y_AXIS = [70, 60, 50, 40, 30];

export function PipelineChart() {
  const [data, setData] = useState<PipelineStage[]>([]);
  const [hoverIndex, setHoverIndex] = useState<number | null>(2); // Default highlight index 2

  useEffect(() => {
    fetchApi('/api/dashboard/pipeline')
      .then(res => setData(res))
      .catch(console.error);
  }, []);

  if (data.length === 0) return <div className="w-full bg-white rounded-3xl p-8 relative flex flex-col h-[500px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] animate-pulse" />;

  const actualMax = Math.max(...data.map(d => d.value), 0);
  const maxValue = Math.max(5, Math.ceil(actualMax / 5) * 5);
  const step = maxValue / 5;
  const Y_AXIS = [maxValue, maxValue - step, maxValue - step * 2, maxValue - step * 3, maxValue - step * 4, 0];

  // Striped pattern CSS
  const stripedBackground = `repeating-linear-gradient(
    45deg,
    #3B82F6,
    #3B82F6 2px,
    #DBEAFE 2px,
    #DBEAFE 8px
  )`;

  return (
    <div className="w-full bg-white rounded-3xl p-8 relative flex flex-col h-[500px] shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 shrink-0">
        <h2 className="text-2xl font-bold font-display" style={{ color: "var(--color-navy)" }}>
          Pipeline
        </h2>
        <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
          <MoreHorizontal size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-x-auto pb-4 -mb-4">
        <div className="min-w-[700px] h-full flex relative pr-2">
          {/* Y-Axis */}
          <div className="flex flex-col justify-between items-end pr-4 text-xs font-semibold text-gray-400 w-12 pb-8 shrink-0">
            {Y_AXIS.map((val) => (
              <span key={val}>{val}</span>
            ))}
          </div>

        {/* Chart Area */}
        <div className="flex-1 relative flex">
          {/* Horizontal Grid Lines */}
          <div className="absolute inset-0 flex flex-col justify-between pb-8 pointer-events-none">
            {Y_AXIS.map((_, i) => (
              <div key={i} className="w-full h-[1px] bg-gray-50" />
            ))}
          </div>

          {/* SVG Overlay for Connectors */}
          <svg
            className="absolute inset-0 w-full h-[calc(100%-2rem)] pointer-events-none z-10"
            preserveAspectRatio="none"
            viewBox="0 0 100 100"
          >
            <defs>
              <linearGradient id="connectorGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.1" />
              </linearGradient>
              <linearGradient id="solidGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1D4ED8" />
                <stop offset="100%" stopColor="#60A5FA" />
              </linearGradient>
            </defs>

            {data.map((stage, i) => {
              if (i === data.length - 1) return null;
              const nextStage = data[i + 1];

              const getH = (val: number) => (val / maxValue) * 100;
              const y1 = 100 - getH(stage.value);
              const y2 = 100 - getH(nextStage.value);

              // X percentages
              const colWidth = 20;
              const barWidth = 14;
              
              const x1 = (i * colWidth) + barWidth; // Right edge of current bar
              const x2 = (i + 1) * colWidth;        // Left edge of next bar

              return (
                <polygon
                  key={`connector-${i}`}
                  points={`${x1},${y1} ${x2},${y2} ${x2},100 ${x1},100`}
                  fill="url(#connectorGradient)"
                />
              );
            })}
          </svg>

          {/* Columns */}
          <div className="absolute inset-0 flex h-[calc(100%-2rem)]">
            {data.map((stage, i) => {
              const isActive = hoverIndex === i;
              const heightPct = Math.max(0, (stage.value / maxValue) * 100);

              return (
                <div
                  key={stage.label}
                  className="flex-1 h-full relative border-l border-gray-100 first:border-l-0"
                  onMouseEnter={() => setHoverIndex(i)}
                  onMouseLeave={() => setHoverIndex(null)}
                  onTouchStart={() => setHoverIndex(i)}
                >
                  {/* Column Background Highlight */}
                  <div className={clsx("absolute inset-0 bg-blue-50/30 transition-opacity duration-300", isActive ? "opacity-100" : "opacity-0")} />

                  {/* Header Info */}
                  <div className="absolute top-[-20px] w-full px-4 pt-6 z-20">
                    <p className={clsx("text-xs font-semibold mb-1 transition-colors", isActive ? "text-blue-900" : "text-gray-400")}>
                      {stage.label}
                    </p>
                    <p className={clsx("text-3xl font-display font-light transition-colors", isActive ? "text-black" : "text-gray-300")}>
                      {stage.displayValue}
                    </p>
                    
                    {/* Floating Pill indicator */}
                    <div className="flex justify-center mt-4">
                      <div className={clsx("h-1.5 w-6 rounded-full transition-colors", isActive ? "bg-blue-500" : "bg-blue-200")} />
                    </div>
                  </div>

                  {/* The Bar */}
                  <div className="absolute bottom-0 left-0 w-[70%] z-20 overflow-hidden" style={{ height: `${heightPct}%` }}>
                    {/* Gradient overlay to fade bottom */}
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent z-10" />
                    
                    {/* Bar Background */}
                    <div
                      className={clsx("w-full h-full transition-all duration-500", isActive ? "shadow-lg" : "")}
                      style={{
                        background: isActive ? "url(#solidGradient)" : stripedBackground,
                        ...(isActive ? { background: "linear-gradient(to bottom right, #1D4ED8, #60A5FA)" } : {})
                      }}
                    />
                  </div>

                  {/* Tooltip */}
                  {isActive && (
                    <div className="absolute left-[35%] top-[50%] z-50 pointer-events-none animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="bg-white/80 backdrop-blur-xl border border-white shadow-[0_8px_32px_rgba(0,0,0,0.1)] rounded-full px-5 py-2.5 flex items-center gap-3 whitespace-nowrap">
                        <span className="font-bold text-sm text-black">{stage.displayValue} {stage.value === 1 ? 'item' : 'items'}</span>
                        {i > 0 && (
                          <>
                            <span className="text-gray-300">|</span>
                            <span className="text-sm text-gray-500">
                              Conversion: <span className="text-black font-semibold">
                                {data[i - 1].value > 0 ? Math.round((stage.value / data[i - 1].value) * 100) : 0}%
                              </span>
                            </span>
                            <span className="text-gray-300">|</span>
                            <span className="text-sm text-gray-500">
                              Drop-off: <span className="text-red-500 font-semibold">
                                -{data[i - 1].value > 0 ? 100 - Math.round((stage.value / data[i - 1].value) * 100) : 0}%
                              </span>
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
