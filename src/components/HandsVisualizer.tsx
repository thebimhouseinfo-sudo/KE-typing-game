import React from 'react';

interface HandsVisualizerProps {
  activeFinger: string | null;
}

export default function HandsVisualizer({ activeFinger }: HandsVisualizerProps) {
  // Utility to determine if a specific finger is active
  const isFingerActive = (fingerId: string) => activeFinger === fingerId;

  const activeClasses = "bg-yellow-400 border-yellow-500 scale-110 shadow-lg shadow-yellow-300 ring-4 ring-yellow-200";
  const inactiveLeftBase = "border-slate-300 dark:border-slate-600";
  const inactiveRightBase = "border-slate-300 dark:border-slate-600";

  return (
    <div id="hands-visualizer-container" className="bg-[#FFFDF6] border-4 border-[#2D3436] rounded-2xl p-4 shadow-[3px_3px_0px_0px_rgba(45,52,54,1)] flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-10 w-full">
      <div className="text-center sm:text-left space-y-1 md:space-y-1.5 max-w-xs md:max-w-md">
        <h5 className="font-sans font-black text-[#2D3436] text-xs uppercase tracking-wider flex items-center justify-center sm:justify-start gap-1.5">
          👐 BÍ KÍP 10 NGÓN DIỆU KỲ:
        </h5>
        <p className="text-[11px] font-bold text-slate-500 leading-snug">
          Bé yêu ơi! Hãy gõ phím bằng ngón tay <span className="text-amber-500 font-extrabold animate-pulse">NHẤP NHÁY MÀU VÀNG</span> dưới đây nhé! Đừng quên đặt ngón trỏ vào hai phím có gờ nổi <span className="font-mono text-rose-500 font-extrabold">F</span> và <span className="font-mono text-sky-500 font-extrabold">J</span> nha! 🥰
        </p>
      </div>

      <div className="flex justify-around items-end gap-10 max-w-[280px] w-full pt-1">
        {/* LEFT HAND */}
        <div className="flex flex-col items-center space-y-1">
          <div className="flex items-end gap-1.5 h-20">
            {/* Pinky */}
            <div
              id="left-pinky-visual"
              className={`w-3.5 h-12 rounded-full border-2 transition-all duration-300 ${
                isFingerActive('left-pinky')
                  ? activeClasses + " animate-pulse"
                  : 'bg-rose-100/60 ' + inactiveLeftBase
              }`}
              title="Ngón út trái"
            />
            {/* Ring */}
            <div
              id="left-ring-visual"
              className={`w-3.5 h-15 rounded-full border-2 transition-all duration-300 ${
                isFingerActive('left-ring')
                  ? activeClasses + " animate-pulse"
                  : 'bg-pink-100/60 ' + inactiveLeftBase
              }`}
              title="Ngón áp út trái"
            />
            {/* Middle */}
            <div
              id="left-middle-visual"
              className={`w-3.5 h-17 rounded-full border-2 transition-all duration-300 ${
                isFingerActive('left-middle')
                  ? activeClasses + " animate-pulse"
                  : 'bg-amber-100/60 ' + inactiveLeftBase
              }`}
              title="Ngón giữa trái"
            />
            {/* Index */}
            <div
              id="left-index-visual"
              className={`w-3.5 h-16 rounded-full border-2 transition-all duration-300 ${
                isFingerActive('left-index')
                  ? activeClasses + " animate-pulse"
                  : 'bg-yellow-100/60 ' + inactiveLeftBase
              }`}
              title="Ngón trỏ trái"
            />
            {/* Thumb Left */}
            <div
              id="left-thumb-visual"
              className={`w-3.5 h-10 rounded-full border-2 transition-all duration-300 origin-bottom -rotate-15 ${
                isFingerActive('thumb')
                  ? activeClasses + " animate-pulse"
                  : 'bg-emerald-100/60 ' + inactiveLeftBase
              }`}
              title="Ngón cái trái"
            />
          </div>
          {/* Hand Palm base */}
          <div className="w-24 h-12 bg-slate-200/80 rounded-t-3xl border-2 border-slate-300 border-b-0 flex items-center justify-center relative">
            <span className="text-[10px] font-bold text-slate-500 font-sans">TAY TRÁI</span>
          </div>
        </div>

        {/* RIGHT HAND */}
        <div className="flex flex-col items-center space-y-1">
          <div className="flex items-end gap-1.5 h-20">
            {/* Thumb Right */}
            <div
              id="right-thumb-visual"
              className={`w-3.5 h-10 rounded-full border-2 transition-all duration-300 origin-bottom rotate-15 ${
                isFingerActive('thumb')
                  ? activeClasses + " animate-pulse"
                  : 'bg-emerald-100/60 ' + inactiveRightBase
              }`}
              title="Ngón cái phải"
            />
            {/* Index */}
            <div
              id="right-index-visual"
              className={`w-3.5 h-16 rounded-full border-2 transition-all duration-300 ${
                isFingerActive('right-index')
                  ? activeClasses + " animate-pulse"
                  : 'bg-sky-100/60 ' + inactiveRightBase
              }`}
              title="Ngón trỏ phải"
            />
            {/* Middle */}
            <div
              id="right-middle-visual"
              className={`w-3.5 h-17 rounded-full border-2 transition-all duration-300 ${
                isFingerActive('right-middle')
                  ? activeClasses + " animate-pulse"
                  : 'bg-blue-100/60 ' + inactiveRightBase
              }`}
              title="Ngón giữa phải"
            />
            {/* Ring */}
            <div
              id="right-ring-visual"
              className={`w-3.5 h-15 rounded-full border-2 transition-all duration-300 ${
                isFingerActive('right-ring')
                  ? activeClasses + " animate-pulse"
                  : 'bg-indigo-100/60 ' + inactiveRightBase
              }`}
              title="Ngón áp út phải"
            />
            {/* Pinky */}
            <div
              id="right-pinky-visual"
              className={`w-3.5 h-12 rounded-full border-2 transition-all duration-300 ${
                isFingerActive('right-pinky')
                  ? activeClasses + " animate-pulse"
                  : 'bg-violet-100/60 ' + inactiveRightBase
              }`}
              title="Ngón út phải"
            />
          </div>
          {/* Hand Palm base */}
          <div className="w-24 h-12 bg-slate-200/80 rounded-t-3xl border-2 border-slate-300 border-b-0 flex items-center justify-center relative">
            <span className="text-[10px] font-bold text-slate-500 font-sans">TAY PHẢI</span>
          </div>
        </div>
      </div>
    </div>
  );
}
