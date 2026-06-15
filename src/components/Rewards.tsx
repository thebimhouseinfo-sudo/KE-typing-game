import React from 'react';
import { UserProfile, Badge } from '../types';
import { BADGES } from '../data';
import { playSound } from '../utils/audio';
import { ArrowLeft, Lock, Unlock, CheckCircle2, Award } from 'lucide-react';

interface RewardsProps {
  profile: UserProfile;
  onBack: () => void;
}

export default function Rewards({ profile, onBack }: RewardsProps) {
  const isBadgeUnlocked = (badgeId: string) => {
    return profile.badges.includes(badgeId);
  };

  return (
    <div id="rewards-gallery-view" className="space-y-6 max-w-6xl mx-auto bg-[#FFFDF6] rounded-3xl border-4 border-[#2D3436] p-6 md:p-8 shadow-[8px_8px_0px_0px_rgba(45,52,54,1)] animate-fade-in text-[#2D3436]">
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b-2 border-dashed border-[#2D3436]">
        <button
          id="rewards-back-btn"
          onClick={() => { playSound('popup'); onBack(); }}
          className="flex items-center gap-1.5 bg-[#FAB1A0] text-[#2D3436] font-black uppercase text-xs border-2 border-[#2D3436] py-1 px-3 rounded-lg transition-all hover:translate-y-[-1px] hover:shadow-[2px_2px_0px_0px_rgba(45,52,54,1)] active:translate-y-0"
        >
          <ArrowLeft className="w-5 h-5" /> TRỞ VỀ MAP
        </button>
        <div className="text-center">
          <h2 className="text-2xl font-sans font-black text-[#2D3436] flex items-center justify-center gap-1 uppercase italic">
            🏅 HUY HIỆU CỦA BÉ
          </h2>
          <p className="text-xs text-slate-600 font-bold">Tấm huy chương danh giá ghi nhận đôi bàn tay gõ phím vàng</p>
        </div>
        <div className="w-20 hidden sm:block"></div> {/* spacer */}
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
        {BADGES.map((badge) => {
          const unlocked = isBadgeUnlocked(badge.id);

          return (
            <div
              id={`rewards-badge-card-${badge.id}`}
              key={badge.id}
              className={`relative rounded-2xl p-5 border-4 border-[#2D3436] transition-all duration-300 flex flex-col items-center text-center space-y-3 ${
                unlocked
                  ? `${badge.color} hover:rotate-2 shadow-[4px_4px_0px_0px_rgba(45,52,54,1)]`
                  : 'bg-[#F1F2F6] border-dashed opacity-60'
              }`}
            >
              {/* Unlock Badge Indicator */}
              {unlocked ? (
                <div className="absolute top-3 right-3 bg-white border-2 border-[#2D3436] text-[#2D3436] rounded-full p-0.5" title="Đã nhận">
                  <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 fill-emerald-100" />
                </div>
              ) : (
                <div className="absolute top-3 right-3 text-[#2D3436]/50" title="Chưa mở khóa">
                  <Lock className="w-4.5 h-4.5" />
                </div>
              )}

              {/* Emoji icon badge */}
              <div className={`text-5xl p-4 rounded-full border-2 border-[#2D3436] shadow-[2px_2px_0px_0px_rgba(45,52,54,1)] transition-transform duration-300 ${
                unlocked ? 'bg-white animate-bounce-slow' : 'bg-slate-200 saturate-50'
              }`}>
                {badge.emoji}
              </div>

              <div>
                <h4 className="font-sans font-black text-base text-[#2D3436] leading-tight uppercase">
                  {badge.title}
                </h4>
                <p className="text-xs text-slate-700 font-medium mt-1 leading-relaxed">
                  {badge.description}
                </p>
              </div>

              {/* Status footer condition */}
              <div className="w-full pt-2.5 border-t-2 border-dashed border-[#2D3436] text-[10px] font-black text-[#2D3436]/70 uppercase tracking-tight">
                {unlocked ? (
                  <span className="text-emerald-700 flex items-center justify-center gap-1 font-black">
                    🔓 ĐÃ ĐẠT ĐƯỢC
                  </span>
                ) : (
                  <span className="text-slate-500 block truncate">
                    🎯 Cần: {badge.condition}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* General Stats summary card */}
      <div className="bg-[#FFEAA7] rounded-3xl p-5 border-4 border-[#2D3436] flex items-center gap-4 max-w-xl mx-auto shadow-[4px_4px_0px_0px_rgba(45,52,54,1)]">
        <div className="p-3 bg-white rounded-xl border-2 border-[#2D3436] shadow-[2px_2px_0px_0px_rgba(45,52,54,1)] shrink-0">
          <Award className="w-8 h-8 text-[#FF7675] animate-bounce" />
        </div>
        <div className="space-y-1">
          <h4 className="font-sans font-black text-[#2D3436] text-sm uppercase">BẢNG VÀNG DANH DỰ ĐẦY ĐỦ</h4>
          <p className="text-xs text-[#2D3436] font-semibold leading-relaxed">
            Mỗi huy hiệu phản ánh một cột mốc quan trọng trong hành trình học tập gõ phím của bé. Bé hay gõ thật kiên trì và chính xác từng bài để đem về trọn bộ huy chương lấp lánh này nhé!
          </p>
        </div>
      </div>
    </div>
  );
}
