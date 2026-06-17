import React from 'react';
import { Level, UserProfile, Badge } from '../types';
import { LEVELS, LEVEL_CATEGORIES, BADGES } from '../data';
import { playSound } from '../utils/audio';
import { Award, Trophy, User, Calendar, Flame, Lock, CheckCircle2, ChevronRight, Sparkles, Star, PartyPopper, Home, Rocket, Compass, Puzzle, Wand2, BookOpen, MessageSquareText, Keyboard, Waves } from 'lucide-react';
import Avatar from './Avatar';

// Map icon string IDs to Lucide React components
const LEVEL_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'party-popper': PartyPopper,
  'home': Home,
  'rocket': Rocket,
  'compass': Compass,
  'puzzle': Puzzle,
  'wand-2': Wand2,
  'book-open': BookOpen,
  'message-square-text': MessageSquareText,
  'keyboard': Keyboard,
  'waves': Waves
};

interface MapSelectionProps {
  profile: UserProfile;
  onSelectLevel: (level: Level) => void;
  onEditProfile: () => void;
  onViewLeaderboard: () => void;
  onViewBadges: () => void;
}

const MAP_THEMES: Record<string, { title: string; desc: string; bannerBg: string; bgGradient: string }> = {
  'home-row': {
    title: '🌸 Đảo 1 - Hàng Phím Cơ Sở',
    desc: 'Luyện tập các phím xuất phát của hai bàn tay (F, J, D, K, A, S, L, ;). Đây là nền móng của gõ phím chuẩn 10 ngón!',
    bannerBg: 'bg-[#F8D77A]',
    bgGradient: 'from-[#FFF9E8] to-[#FFF5D0]'
  },
  'all-rows': {
    title: '🚀 Đảo 2 - Chinh Phục Bàn Phím',
    desc: 'Bay cao lên hàng phím trên và nhảy xuống hàng phím dưới. Luyện tập phối hợp cả 3 hàng phím chữ cái.',
    bannerBg: 'bg-[#7DC7FF]',
    bgGradient: 'from-[#F0F8FF] to-[#E0F2FF]'
  },
  'vietnamese': {
    title: '🪄 Đảo 3 - Xứ Sở Phù Thủy Tiếng Việt',
    desc: 'Bước vào thế giới phép thuật của các dấu tiếng Việt! Bé sẽ học cách dùng đũa thần gõ phím để tạo ra những ký tự diệu kỳ, ghép từ thần tiên và kể chuyện cổ tích.',
    bannerBg: 'bg-[#9BE38F]',
    bgGradient: 'from-[#F0FFF0] to-[#E0FFE0]'
  },
  'typing-challenge': {
    title: '🎮 Đảo 4 - Thử Thách Gõ Phím',
    desc: 'Thử thách gõ phím với chế độ tự nhập văn bản để luyện tập và trò chơi Bubble Race đầy kịch tính.',
    bannerBg: 'bg-[#C79CFF]',
    bgGradient: 'from-[#F8F0FF] to-[#F0E0FF]'
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
    
    // Special case: levels 9 and 10 are both unlocked after completing level 8
    if (lvl.id === 'lvl-9' || lvl.id === 'lvl-10') {
      const lvl8Stats = (profile.completedLevels || {})['lvl-8'];
      return lvl8Stats && lvl8Stats.stars > 0;
    }
    
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
    <div id="map-selection-view" className="space-y-8 animate-fade-in text-[#35354a]">
      {/* Profile summary banner */}
      <div className="bg-white rounded-3xl p-6 shadow-[0_12px_30px_rgba(60,60,100,0.08)] flex flex-col md:flex-row justify-between items-center gap-6 border-0">
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <div className="w-20 h-20 bg-gradient-to-br from-[#5b8cff] to-[#7aa8ff] rounded-full flex items-center justify-center shadow-[0_8px_20px_rgba(91,140,255,0.25)] overflow-hidden">
            <Avatar avatar={profile.avatar} className="w-14 h-14 -rotate-12" />
          </div>
          <div>
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <h1 className="text-3xl font-black font-sans tracking-tight text-[#35354a] uppercase italic">{profile.name}</h1>
            </div>
            <p className="text-[#8a8aa0] font-bold text-sm mt-1">Học viên gõ phím vàng tương lai</p>
            <div className="flex flex-wrap gap-2.5 mt-3 justify-center sm:justify-start">
              <button
                id="edit-profile-btn"
                onClick={() => { playSound('popup'); onEditProfile(); }}
                className="bg-white text-[#35354a] text-xs px-4 py-2 rounded-full font-bold shadow-[0_8px_20px_rgba(0,0,0,0.06)] transition-all hover:translate-y-[-3px] flex items-center gap-1.5"
              >
                <User className="w-4 h-4" /> SỬA HỒ SƠ
              </button>
              <button
                id="view-leaderboard-btn"
                onClick={() => { playSound('popup'); onViewLeaderboard(); }}
                className="bg-white text-[#35354a] text-xs px-4 py-2 rounded-full font-bold shadow-[0_8px_20px_rgba(0,0,0,0.06)] transition-all hover:translate-y-[-3px] flex items-center gap-1.5"
              >
                <Trophy className="w-4 h-4" /> BẢNG XẾP HẠNG
              </button>
              <button
                id="view-badges-btn"
                onClick={() => { playSound('popup'); onViewBadges(); }}
                className="bg-gradient-to-br from-[#5b8cff] to-[#7aa8ff] text-white text-xs px-4 py-2 rounded-full font-bold shadow-[0_8px_20px_rgba(91,140,255,0.25)] transition-all hover:translate-y-[-3px] flex items-center gap-1.5"
              >
                <Award className="w-4 h-4" /> HUY HIỆU ({profile.badges.length})
              </button>
            </div>
          </div>
        </div>

        {/* Stats display Cards / Bubbles */}
        <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
          <div className="bg-white p-3 rounded-2xl text-center shadow-[0_12px_30px_rgba(60,60,100,0.08)] border-0">
            <Trophy className="w-6 h-6 text-[#5b8cff] mx-auto mb-1 animate-pulse" />
            <div className="text-xl font-black text-[#35354a] font-mono">{profile.score}</div>
            <div className="text-[10px] text-[#8a8aa0] font-black uppercase">ĐIỂM</div>
          </div>
          <div className="bg-white p-3 rounded-2xl text-center shadow-[0_12px_30px_rgba(60,60,100,0.08)] border-0">
            <Star className="w-6 h-6 text-[#5b8cff] fill-[#5b8cff] mx-auto mb-1" />
            <div className="text-xl font-black text-[#35354a] font-mono">{totalStars}</div>
            <div className="text-[10px] text-[#8a8aa0] font-black uppercase">SAO</div>
          </div>
          <div className="bg-white p-3 rounded-2xl text-center shadow-[0_12px_30px_rgba(60,60,100,0.08)] border-0">
            <Flame className="w-6 h-6 text-[#5b8cff] fill-[#5b8cff] mx-auto mb-1" />
            <div className="text-xl font-black text-[#35354a] font-mono">{highestWpm} <span className="text-[10px] font-black">WPM</span></div>
            <div className="text-[10px] text-[#8a8aa0] font-black uppercase">KỶ LỤC</div>
          </div>
        </div>
      </div>

      {/* Map Navigation Carousel */}
      <div className="bg-white rounded-3xl overflow-hidden shadow-[0_12px_30px_rgba(60,60,100,0.08)] border-0">
        {/* Navigation Banner */}
        <div className={`p-5 flex justify-between items-center gap-4 text-[#35354a] ${MAP_THEMES[currentCat]?.bannerBg || 'bg-[#6C5CE7]'}`}>
          <button
            id="prev-map-btn"
            type="button"
            onClick={() => {
              playSound('popup');
              setActiveMapIdx(prev => (prev === 0 ? categories.length - 1 : prev - 1));
            }}
            className="w-10 h-10 bg-white hover:bg-[#f8fcff] text-[#35354a] rounded-full flex items-center justify-center font-bold shadow-[0_8px_20px_rgba(0,0,0,0.06)] transition-transform hover:scale-105 active:scale-95 shrink-0"
          >
            ◀
          </button>
          
          <div className="text-center">
            <span className="bg-[rgba(91,140,255,0.18)] text-[10px] sm:text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full">
              ĐẢO BÀI HỌC {activeMapIdx + 1} / {categories.length}
            </span>
            <h2 className="font-sans font-black text-lg sm:text-2xl tracking-tight uppercase italic mt-1 text-[#35354a]">
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
            className="w-10 h-10 bg-white hover:bg-[#f8fcff] text-[#35354a] rounded-full flex items-center justify-center font-bold shadow-[0_8px_20px_rgba(0,0,0,0.06)] transition-transform hover:scale-105 active:scale-95 shrink-0"
          >
            ▶
          </button>
        </div>

        {/* Map Body Content */}
        <div className={`p-6 md:p-8 space-y-6 bg-gradient-to-b ${MAP_THEMES[currentCat]?.bgGradient || 'from-[#eef7ff] to-[#f8fcff]'}`}>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 bg-white/90 p-4 rounded-2xl shadow-[0_12px_30px_rgba(60,60,100,0.08)] border-0">
            <span className="text-4xl shrink-0">🗺️</span>
            <div className="space-y-1">
              <h4 className="font-sans font-black text-sm uppercase text-[#35354a]">
                Nội dung Đảo Học:
              </h4>
              <p className="text-xs sm:text-sm font-semibold text-[#8a8aa0] leading-relaxed">
                {MAP_THEMES[currentCat]?.desc}
              </p>
              {!currentMapUnlocked && (
                <div className="text-xs font-black text-[#5b8cff] uppercase flex items-center gap-1.5 mt-2 animate-pulse">
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
                  className={`relative group rounded-3xl p-5 transition-all duration-300 cursor-pointer overflow-hidden border-0 ${
                    isPlayable
                      ? 'bg-white hover:translate-y-[-6px] shadow-[0_12px_30px_rgba(60,60,100,0.08)]'
                      : 'bg-white/60 opacity-60 shadow-[0_12px_30px_rgba(60,60,100,0.08)]'
                  }`}
                >
                  <div className={`absolute top-0 left-0 right-0 h-3 bg-gradient-to-r ${level.bgGradient}`} />

                  <div className="flex items-start justify-between gap-3 pt-4">
                    <div className="flex items-center gap-3">
                      {(() => {
                        const IconComponent = LEVEL_ICONS[level.icon];
                        return IconComponent ? (
                          <div className={`p-2 rounded-2xl bg-gradient-to-br ${level.bgGradient} text-white shadow-[0_8px_20px_rgba(91,140,255,0.25)]`}>
                            <IconComponent className="w-8 h-8" />
                          </div>
                        ) : (
                          <span className="text-4xl p-2 rounded-2xl bg-gradient-to-br ${level.bgGradient} text-white shadow-[0_8px_20px_rgba(91,140,255,0.25)]">
                            {level.icon}
                          </span>
                        );
                      })()}
                      <div>
                        <span className="text-xs font-black text-[#8a8aa0] uppercase tracking-wider font-mono">
                          BÀI HỌC {originalIdx + 1}
                        </span>
                        <h3 className="font-sans font-black text-[#35354a] text-lg group-hover:text-[#5b8cff] transition-colors leading-tight">
                          {level.name}
                        </h3>
                      </div>
                    </div>

                    {isPlayable ? (
                      levelStars > 0 ? (
                        <CheckCircle2 className="w-6 h-6 text-[#5b8cff] fill-[#eef7ff] shrink-0 rounded-full" />
                      ) : (
                        <div className="w-3.5 h-3.5 bg-[#5b8cff] rounded-full animate-ping shrink-0" />
                      )
                    ) : (
                      <Lock className="w-5 h-5 text-slate-400 shrink-0" />
                    )}
                  </div>

                  <p className="text-sm font-semibold text-[#8a8aa0] mt-3 leading-relaxed min-h-[40px]">
                    {level.description}
                  </p>

                  {level.category === 'vietnamese' && level.id === 'lvl-6' && (
                    <div className="mt-2 bg-[rgba(91,140,255,0.1)] text-xs text-[#35354a] font-black rounded-lg px-2.5 py-1 inline-flex items-center gap-1">
                      🇻🇳 Gồm: đ, ă, â, ê, ô, ơ, ư
                    </div>
                  )}
                  {level.category === 'typing-challenge' && level.id === 'lvl-10' && (
                    <div className="mt-2 bg-[rgba(91,140,255,0.1)] text-xs text-[#35354a] font-black rounded-lg px-2.5 py-1 inline-flex items-center gap-1 animate-pulse">
                      🛸 Bong bóng bay!
                    </div>
                  )}

                  <div className="mt-4 pt-3 border-t border-[rgba(0,0,0,0.08)] flex items-center justify-between">
                    {isPlayable ? (
                      scoreStats ? (
                        <div className="space-y-1 w-full">
                          <div className="flex gap-0.5">
                            {[1, 2, 3].map((starIdx) => (
                              <Star
                                key={starIdx}
                                className={`w-5 h-5 ${
                                  starIdx <= levelStars
                                    ? 'text-[#5b8cff] fill-[#5b8cff]'
                                    : 'text-slate-200'
                                }`}
                              />
                            ))}
                          </div>
                          <div className="text-xs text-[#8a8aa0] font-bold">
                            Điểm: <strong className="text-[#35354a] font-black">{scoreStats.highScore}</strong> | Kỷ lục: <strong className="text-[#35354a] font-black">{scoreStats.wpm} WPM</strong>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-[#5b8cff] font-black flex items-center gap-0.5 animate-pulse group-hover:gap-1.5 transition-all uppercase tracking-tight">
                          Khám phá ngay <ChevronRight className="w-4 h-4" />
                        </span>
                      )
                    ) : (
                      <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
                        🔒 Chờ mở khoá
                      </span>
                    )}

                    {level.badgeToUnlock && (
                      <div className="bg-[rgba(91,140,255,0.18)] text-[#35354a] text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-0.5 shrink-0" title="Có huy hiệu lấp lánh">
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
      <div id="vi-typing-tip-box" className="bg-white rounded-3xl p-6 shadow-[0_12px_30px_rgba(60,60,100,0.08)] flex items-start gap-4 border-0">
        <span className="text-4xl">💡</span>
        <div className="space-y-1">
          <h4 className="font-sans font-black text-[#35354a] uppercase tracking-wide text-base">Bé luyện gõ phím thông thái mách nhỏ:</h4>
          <p className="text-sm text-[#8a8aa0] font-semibold leading-relaxed">
            Học gõ phím giúp hai bàn tay của bé phối hợp nhịp nhàng và giúp bé thông minh hơn đấy! Bé hãy chú ý ngồi thẳng lưng, đặt tay lên hàng cơ sở (các phím hông màu như F và J) để các ngón tay tự tìm đúng phím nhé!
          </p>
        </div>
      </div>
    </div>
  );
}
