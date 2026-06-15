import React from 'react';

interface HandsVisualizerProps {
  activeFinger: string | null;
}

export default function HandsVisualizer({ activeFinger }: HandsVisualizerProps) {
  // Utility to determine if a specific finger is active
  const isFingerActive = (fingerId: string) => activeFinger === fingerId;

  const activeClasses = 'bg-[#FDCB6E] scale-110 shadow-[0_8px_20px_rgba(253,203,110,0.5)] animate-pulse';

  const leftFingers: { id: string; height: string; color: string; label: string }[] = [
    { id: 'left-pinky', height: 'h-10', color: 'bg-rose-100', label: 'Ngón út trái' },
    { id: 'left-ring', height: 'h-14', color: 'bg-pink-100', label: 'Ngón áp út trái' },
    { id: 'left-middle', height: 'h-16', color: 'bg-amber-100', label: 'Ngón giữa trái' },
    { id: 'left-index', height: 'h-14', color: 'bg-yellow-100', label: 'Ngón trỏ trái' },
    { id: 'thumb', height: 'h-9', color: 'bg-emerald-100', label: 'Ngón cái trái' },
  ];

  const rightFingers: { id: string; height: string; color: string; label: string }[] = [
    { id: 'thumb', height: 'h-9', color: 'bg-emerald-100', label: 'Ngón cái phải' },
    { id: 'right-index', height: 'h-14', color: 'bg-sky-100', label: 'Ngón trỏ phải' },
    { id: 'right-middle', height: 'h-16', color: 'bg-blue-100', label: 'Ngón giữa phải' },
    { id: 'right-ring', height: 'h-14', color: 'bg-indigo-100', label: 'Ngón áp út phải' },
    { id: 'right-pinky', height: 'h-10', color: 'bg-violet-100', label: 'Ngón út phải' },
  ];

  const renderBars = (fingers: typeof leftFingers, side: 'left' | 'right') => (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-end gap-1.5 h-16">
        {fingers.map((f) => (
          <div
            key={`${side}-${f.id}-${f.label}`}
            id={`${side}-${f.id}-visual`}
            title={f.label}
            className={`w-3.5 sm:w-4 ${f.height} rounded-full transition-all duration-300 ${
              isFingerActive(f.id) ? activeClasses : f.color
            }`}
          />
        ))}
      </div>
      <span className="text-[10px] sm:text-xs font-black text-[#8a8aa0] uppercase tracking-wider">
        {side === 'left' ? 'Tay Trái' : 'Tay Phải'}
      </span>
    </div>
  );

  return (
    <div id="hands-visualizer-container" className="bg-white rounded-3xl p-5 shadow-[0_12px_30px_rgba(60,60,100,0.08)] flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-10 w-full">
      <div className="text-center sm:text-left space-y-1 md:space-y-1.5 max-w-xs md:max-w-md">
        <h5 className="font-sans font-black text-[#35354a] text-xs uppercase tracking-wider flex items-center justify-center sm:justify-start gap-1.5">
          🤲 BÍ KÍP 10 NGÓN DIỆU KỲ:
        </h5>
        <p className="text-[11px] font-bold text-[#8a8aa0] leading-snug">
          Bé yêu ơi! Hãy gõ phím bằng ngón tay <span className="text-[#FDCB6E] font-extrabold">NHẤP NHÁY MÀU VÀNG</span> dưới đây nhé! Đừng quên đặt ngón trỏ vào hai phím có gờ nổi <span className="font-mono text-rose-500 font-extrabold">F</span> và <span className="font-mono text-[#5b8cff] font-extrabold">J</span> nha! 🥰
        </p>
      </div>

      <div className="flex justify-around items-end gap-10 max-w-[280px] w-full pt-1">
        {renderBars(leftFingers, 'left')}
        {renderBars(rightFingers, 'right')}
      </div>
    </div>
  );
}
