import React from 'react';
import { Level, UserProfile, Badge } from '../types';
import { LEVELS, LEVEL_CATEGORIES, BADGES } from '../data';
import { playSound } from '../utils/audio';
import { Award, Trophy, User, Calendar, Flame, Lock, CheckCircle2, ChevronRight, Sparkles, Star } from 'lucide-react';
import Avatar from './Avatar';

interface MapSelectionProps {
  profile: UserProfile;
  onSelectLevel: (level: Level) => void;
  onEditProfile: () => void;
  onViewLeaderboard: () => void;
  onViewBadges: () => void;
}

const MAP_THEMES: Record<string, { title: string; desc: string; bannerBg: string; bgGradient: string }> = {
  'home-row': {
    title: '🌸 Đảo Hoa Đào - Hàng Phím Cơ Sở',
    desc: 'Luyện tập các phím xuất phát của hai bàn tay (F, J, D, K, A, S, L, ;). Đây là nền móng của gõ phím chuẩn 10 ngón!',
    bannerBg: 'bg-[#FF7675]',
    bgGradient: 'from-[#FFF5F5] to-rose-50'
  },
  'all-rows': {
    title: '🚀 Đảo Thiên Thạch - Chinh Phục Bàn Phím',
    desc: 'Bay cao lên hàng phím trên và nhảy xuống hàng phím dưới. Luyện tập phối hợp cả 3 hàng phím chữ cái.',
    bannerBg: 'bg-[#74B9FF]',
    bgGradient: 'from-[#F0F8FF] to-blue-50'
  },
  'vi-letters': {
    title: '🇻🇳 Đảo Rồng Việt - Học Dấu Tiếng Việt',
    desc: 'Chinh phục các chữ cái đặc biệt của Tiếng Việt có dấu đ, ă, â, ê, ô, ơ, ư bằng phương pháp gõ chuẩn Telex hoặc VNI.',
    bannerBg: 'bg-[#FF7675]/80',
    bgGradient: 'from-[#FFF5F5] to-red-50'
  },
  'vi-words': {
    title: '🎈 Đảo Khinh Khí Cầu - Tập Gõ Từ Hay',
    desc: 'Học cách ghép các phím chữ cái và phím dấu để gõ thành những từ tiếng Việt có nghĩa đầu tiên thật chuẩn xác.',
    bannerBg: 'bg-[#FDCB6E]',
    bgGradient: 'from-[#FFFDF0] to-amber-50'
  },
  'vi-sentences': {
    title: '📖 Đảo Thư Viện Cổ - Luyện Câu Vui Nhộn',
    desc: 'Luyện tập gõ các câu tiếng Việt dài hoàn chỉnh có ý nghĩa hài hước, dạy bé bài học cuộc sống thú vị.',
    bannerBg: 'bg-[#A29BFE]',
    bgGradient: 'from-[#F5F3FF] to-indigo-50'
  },
  'bubble-race': {
    title: '🎮 Đấu Trường Bong Bóng - Thử Thách Tốc Độ',
    desc: 'Thử thách phản xạ đỉnh cao gõ từ rơi tự do trong bong bóng để ghi thật nhiều điểm trước khi bóng chạm đỉnh.',
    bannerBg: 'bg-[#FD79A8]',
    bgGradient: 'from-[#FFF0F5] to-pink-50'
  }
};

export default function MapSelection({
  profile,
  onSelectLevel,
  onEditProfile,
  onViewLeaderboard,
  onViewBadges
}: MapSelectionProps) {
  console.log('MapSelection rendered', { profile, categoriesCount: LEVELS.length });

  // Filter levels by category to make a beautiful sectioned layout!
  const categories = Array.from(new Set(LEVELS.map(l => l.category)));

  // Find the first map that is not fully completed, default to 0
  const getDefaultMapIdx = () => {
    for (let i = 0; i < categories.length; i++) {
      const cat = categories[i];
      const catLevels = LEVELS.filter(l => l.category === cat);
      const isCompleted = catLevels.every(l => {
        const stats = (profile.completedLevels || {})[l.id];
        return stats && stats.stars > 0;
      });
      if (!isCompleted) return i;
    }
    return 0;
  };

  const [activeMapIdx, setActiveMapIdx] = React.useState(getDefaultMapIdx);

  // A map is unlocked if all levels in the previous map are completed
  const isMapUnlocked = (mapIdx: number) => {
    if (mapIdx === 0) return true;
    const prevCat = categories[mapIdx - 1];
    const prevCatLevels = LEVELS.filter(l => l.category === prevCat);
    return prevCatLevels.every(l => {
      const stats = (profile.completedLevels || {})[l.id];
      return stats && stats.stars > 0;
    });
  };

  // Get current category and related data
  const currentCat = categories[activeMapIdx];
  const currentMapUnlocked = isMapUnlocked(activeMapIdx);
  const currentCatLevels = LEVELS.filter(l => l.category === currentCat).map((level, idx) => ({ level, originalIdx: LEVELS.indexOf(level) }));

  // Determine if a level is unlocked
  const isLevelUnlocked = (lvl: Level, idx: number) => {
    if (idx === 0) return true;
    const prevLvl = LEVELS[idx - 1];
    const prevStats = (profile.completedLevels || {})[prevLvl.id];
    return prevStats && prevStats.stars > 0;
  };

  const handleSelect = (level: Level, unlocked: boolean, mapUnlocked: boolean) => {
    if (!unlocked || !mapUnlocked) {
      playSound('wrong');
      return;
    }
    playSound('correct');
    onSelectLevel(level);
  };

  // Calculate stats
  const totalStars = Object.values(profile.completedLevels || {}).reduce((acc, curr) => acc + (curr?.stars || 0), 0);
  const highestWpm = Object.values(profile.completedLevels || {}).reduce((max, curr) => Math.max(max, curr?.wpm || 0), 0);

  return (
    <div id="map-selection-view" className="space-y-8 animate-fade-in text-[#2D3436]">
      {/* Profile summary banner */}
      <div className="bg-[#FFFDF6] rounded-3xl border-4 border-[#2D3436] p-6 shadow-[8px_8px_0px_0px_rgba(45,52,54,1)] flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <div className="w-20 h-20 bg-[#FFEAA7] rounded-full border-4 border-[#2D3436] flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(45,52,54,1)] overflow-hidden">
            <Avatar avatar={profile.avatar} className="w-14 h-14 -rotate-12" />
          </div>
          <div>
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <h1 className="text-3xl font-black font-sans tracking-tight text-[#2D3436] uppercase italic">{profile.name}</h1>
            </div>
            <p className="text-slate-600 font-bold text-sm mt-1">Học viên gõ phím vàng tương lai</p>
            <div className="flex flex-wrap gap-2.5 mt-3 justify-center sm:justify-start">
              <button
                id="edit-profile-btn"
                onClick={() => { playSound('popup'); onEditProfile(); }}
                className="bg-[#FAB1A0] text-[#2D3436] border-2 border-[#2D3436] text-xs px-3 py-1.5 rounded-xl font-black transition-all hover:translate-y-[-2px] hover:shadow-[3px_3px_0px_0px_rgba(45,52,54,1)] flex items-center gap-1.5"
              >
                <User className="w-4 h-4" /> SỬA HỒ SƠ
              </button>
              <button
                id="view-leaderboard-btn"
                onClick={() => { playSound('popup'); onViewLeaderboard(); }}
                className="bg-[#FDCB6E] text-[#2D3436] border-2 border-[#2D3436] text-xs px-3 py-1.5 rounded-xl font-black transition-all hover:translate-y-[-2px] hover:shadow-[3px_3px_0px_0px_rgba(45,52,54,1)] flex items-center gap-1.5"
              >
                <Trophy className="w-4 h-4" /> BẢNG XẾP HẠNG
              </button>
              <button
                id="view-badges-btn"
                onClick={() => { playSound('popup'); onViewBadges(); }}
                className="bg-[#74B9FF] text-[#2D3436] border-2 border-[#2D3436] text-xs px-3 py-1.5 rounded-xl font-black transition-all hover:translate-y-[-2px] hover:shadow-[3px_3px_0px_0px_rgba(45,52,54,1)] flex items-center gap-1.5"
              >
                <Award className="w-4 h-4" /> HUY HIỆU ({profile.badges.length})
              </button>
            </div>
          </div>
        </div>

        {/* Stats display Cards / Bubbles */}
        <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
          <div className="bg-[#55EFC4] border-2 border-[#2D3436] p-3 rounded-2xl text-center shadow-[3px_3px_0px_0px_rgba(45,52,54,1)]">
            <Trophy className="w-6 h-6 text-[#2D3436] mx-auto mb-1 animate-pulse" />
            <div className="text-xl font-black text-[#2D3436] font-mono">{profile.score}</div>
            <div className="text-[10px] text-[#2D3436] font-black uppercase">ĐIỂM</div>
          </div>
          <div className="bg-[#FFEAA7] border-2 border-[#2D3436] p-3 rounded-2xl text-center shadow-[3px_3px_0px_0px_rgba(45,52,54,1)]">
            <Star className="w-6 h-6 text-[#2D3436] fill-[#2D3436] mx-auto mb-1" />
            <div className="text-xl font-black text-[#2D3436] font-mono">{totalStars}</div>
            <div className="text-[10px] text-[#2D3436] font-black uppercase">SAO</div>
          </div>
          <div className="bg-[#FF7675] border-2 border-[#2D3436] p-3 rounded-2xl text-center shadow-[3px_3px_0px_0px_rgba(45,52,54,1)]">
            <Flame className="w-6 h-6 text-white fill-white mx-auto mb-1" />
            <div className="text-xl font-black text-[#2D3436] font-mono">{highestWpm} <span className="text-[10px] font-black">WPM</span></div>
            <div className="text-[10px] text-[#2D3436] font-black uppercase">KỶ LỤC</div>
          </div>
        </div>
      </div>

      {/* Map Navigation Carousel */}
      <div className="bg-[#FFFDF6] border-4 border-[#2D3436] rounded-3xl overflow-hidden shadow-[8px_8px_0px_0px_rgba(45,52,54,1)]">
        {/* Navigation Banner */}
        <div className={`p-5 flex justify-between items-center gap-4 text-white border-b-4 border-[#2D3436] ${MAP_THEMES[currentCat]?.bannerBg || 'bg-[#6C5CE7]'}`}>
          <button
            id="prev-map-btn"
            type="button"
            onClick={() => {
              playSound('popup');
              setActiveMapIdx(prev => (prev === 0 ? categories.length - 1 : prev - 1));
            }}
            className="w-10 h-10 bg-white hover:bg-slate-100 text-[#2D3436] rounded-full border-2 border-[#2D3436] flex items-center justify-center font-bold shadow-[2px_2px_0px_0px_rgba(45,52,54,1)] transition-transform hover:scale-105 active:scale-95 shrink-0"
          >
            ◀
          </button>
          
          <div className="text-center">
            <span className="bg-white/30 text-[10px] sm:text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full border border-white/40">
              ĐẢO BÀI HỌC {activeMapIdx + 1} / {categories.length}
            </span>
            <h2 className="font-sans font-black text-lg sm:text-2xl tracking-tight uppercase italic mt-1 text-[#2D3436]">
              {MAP_THEMES[currentCat]?.title || LEVEL_CATEGORIES[currentCat] || currentCat}
            </h2>
          </div>

          <button
            id="next-map-btn"
            type="button"
            onClick={() => {
              playSound('popup');
              setActiveMapIdx(prev => (prev === categories.length - 1 ? 0 : prev + 1));
            }}
            className="w-10 h-10 bg-white hover:bg-slate-100 text-[#2D3436] rounded-full border-2 border-[#2D3436] flex items-center justify-center font-bold shadow-[2px_2px_0px_0px_rgba(45,52,54,1)] transition-transform hover:scale-105 active:scale-95 shrink-0"
          >
            ▶
          </button>
        </div>

        {/* Map Body Content */}
        <div className={`p-6 md:p-8 space-y-6 bg-gradient-to-b ${MAP_THEMES[currentCat]?.bgGradient || 'from-slate-50 to-slate-100'}`}>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 bg-white/70 border-2 border-[#2D3436] p-4 rounded-2xl">
            <span className="text-4xl shrink-0">🗺️</span>
            <div className="space-y-1">
              <h4 className="font-sans font-black text-sm uppercase text-[#2D3436]">
                Nội dung Đảo Học:
              </h4>
              <p className="text-xs sm:text-sm font-semibold text-slate-700 leading-relaxed">
                {MAP_THEMES[currentCat]?.desc}
              </p>
              {!currentMapUnlocked && (
                <div className="text-xs font-black text-[#FF7675] uppercase flex items-center gap-1.5 mt-2 animate-pulse">
                  <span>🔒 ĐẢO NÀY ĐANG BỊ KHÓA!</span>
                  <span>Bé cần hoàn thành tất cả bài học ở đảo trước để có thể chơi đảo này nhé.</span>
                </div>
              )}
            </div>
          </div>

          {/* Level Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentCatLevels.map(({ level, originalIdx }) => {
              const levelUnlocked = isLevelUnlocked(level, originalIdx);
              const isPlayable = levelUnlocked && currentMapUnlocked;
              const scoreStats = profile.completedLevels[level.id];
              const levelStars = scoreStats?.stars || 0;

              return (
                <div
                  id={`level-card-${level.id}`}
                  key={level.id}
                  onClick={() => handleSelect(level, levelUnlocked, currentMapUnlocked)}
                  className={`relative group rounded-3xl p-5 border-4 border-[#2D3436] transition-all duration-300 cursor-pointer overflow-hidden ${
                    isPlayable
                      ? 'bg-white hover:translate-y-[-6px] hover:shadow-[6px_6px_0px_0px_rgba(108,92,231,1)]'
                      : 'bg-white/50 opacity-60'
                  }`}
                >
                  <div className={`absolute top-0 left-0 right-0 h-3 bg-gradient-to-r ${level.bgGradient}`} />

                  <div className="flex items-start justify-between gap-3 pt-4">
                    <div className="flex items-center gap-3">
                      <span className={`text-4xl p-2 rounded-2xl bg-gradient-to-br ${level.bgGradient} text-white border-2 border-[#2D3436] shadow-[2px_2px_0px_0px_rgba(45,52,54,1)]`}>
                        {level.icon}
                      </span>
                      <div>
                        <span className="text-[11px] font-black text-[#A29BFE] uppercase tracking-wider font-mono">
                          BÀI HỌC {originalIdx + 1}
                        </span>
                        <h3 className="font-sans font-black text-[#2D3436] text-lg group-hover:text-[#6C5CE7] transition-colors leading-tight">
                          {level.name}
                        </h3>
                      </div>
                    </div>

                    {isPlayable ? (
                      levelStars > 0 ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-500 fill-emerald-100 shrink-0 border-2 border-[#2D3436] rounded-full" />
                      ) : (
                        <div className="w-3.5 h-3.5 bg-[#FF7675] rounded-full animate-ping shrink-0 border-2 border-[#2D3436]" />
                      )
                    ) : (
                      <Lock className="w-5 h-5 text-slate-500 shrink-0" />
                    )}
                  </div>

                  <p className="text-sm font-semibold text-slate-700 mt-3 leading-relaxed min-h-[40px]">
                    {level.description}
                  </p>

                  {level.category === 'vi-letters' && (
                    <div className="mt-2 bg-[#FF7675]/10 border-2 border-[#2D3436] text-[11px] text-[#2D3436] font-black rounded-lg px-2.5 py-1 inline-flex items-center gap-1">
                      🇻🇳 Gồm: đ, ă, â, ê, ô, ơ, ư
                    </div>
                  )}
                  {level.category === 'bubble-race' && (
                    <div className="mt-2 bg-[#55EFC4]/20 border-2 border-[#2D3436] text-[11px] text-[#2D3436] font-black rounded-lg px-2.5 py-1 inline-flex items-center gap-1 animate-pulse">
                      🛸 Bong bóng bay!
                    </div>
                  )}

                  <div className="mt-4 pt-3 border-t-2 border-[#2D3436] flex items-center justify-between">
                    {isPlayable ? (
                      scoreStats ? (
                        <div className="space-y-1 w-full">
                          <div className="flex gap-0.5">
                            {[1, 2, 3].map((starIdx) => (
                              <Star
                                key={starIdx}
                                className={`w-5 h-5 ${
                                  starIdx <= levelStars
                                    ? 'text-[#FDCB6E] fill-[#FDCB6E]'
                                    : 'text-slate-200'
                                }`}
                              />
                            ))}
                          </div>
                          <div className="text-[11px] text-slate-600 font-bold">
                            Điểm: <strong className="text-[#2D3436] font-black">{scoreStats.highScore}</strong> | Kỷ lục: <strong className="text-[#2D3436] font-black">{scoreStats.wpm} WPM</strong>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-[#6C5CE7] font-black flex items-center gap-0.5 animate-pulse group-hover:gap-1.5 transition-all uppercase tracking-tight">
                          Khám phá ngay <ChevronRight className="w-4 h-4" />
                        </span>
                      )
                    ) : (
                      <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                        🔒 Chờ mở khoá
                      </span>
                    )}

                    {level.badgeToUnlock && (
                      <div className="bg-[#FFEAA7] text-[#2D3436] text-[10px] font-black px-2 py-0.5 rounded border border-[#2D3436] flex items-center gap-0.5 shrink-0" title="Có huy hiệu lấp lánh">
                        🎁 Huy hiệu
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Decorative Tips Block for Vietnam kids */}
      <div id="vi-typing-tip-box" className="bg-[#FFFDF6] border-4 border-[#2D3436] rounded-3xl p-6 shadow-[5px_5px_0px_0px_rgba(45,52,54,1)] flex items-start gap-4">
        <span className="text-4xl">💡</span>
        <div className="space-y-1">
          <h4 className="font-sans font-black text-[#2D3436] uppercase tracking-wide text-base">Bé luyện gõ phím thông thái mách nhỏ:</h4>
          <p className="text-sm text-slate-700 font-semibold leading-relaxed">
            Học gõ phím giúp hai bàn tay của bé phối hợp nhịp nhàng và giúp bé thông minh hơn đấy! Bé hãy chú ý ngồi thẳng lưng, đặt tay lên hàng cơ sở (các phím hông màu như F và J) để các ngón tay tự tìm đúng phím nhé!
          </p>
        </div>
      </div>
    </div>
  );
}
