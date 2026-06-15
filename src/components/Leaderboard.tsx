import React from 'react';
import { UserProfile, LeaderboardEntry } from '../types';
import { INITIAL_LEADERBOARD } from '../data';
import { playSound } from '../utils/audio';
import { Trophy, Medal, Crown, ArrowLeft, Star, Heart } from 'lucide-react';
import Avatar from './Avatar';

interface LeaderboardProps {
  profile: UserProfile;
  onBack: () => void;
}

export default function Leaderboard({ profile, onBack }: LeaderboardProps) {
  // Merge profile into initial leaderboards
  const userEntry: LeaderboardEntry = {
    id: 'user-player',
    name: `${profile.name} (Bé) 🌟`,
    avatar: profile.avatar,
    score: profile.score,
    // calculate a realistic high speed based on level progression completed
    wpm: Object.values(profile.completedLevels).reduce((max, l) => Math.max(max, l.wpm), 0) || 0,
    accuracy: Object.values(profile.completedLevels).reduce((max, l) => Math.max(max, l.accuracy), 0) || 0
  };

  // Merge lists, eliminate duplicates if they exist, and sort by score descending
  const allEntries = [...INITIAL_LEADERBOARD, userEntry].sort((a, b) => b.score - a.score);

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500 fill-yellow-400 animate-bounce" />;
      case 2:
        return <Medal className="w-6 h-6 text-slate-400 fill-slate-300" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600 fill-amber-700" />;
      default:
        return <span className="text-slate-400 font-bold text-sm w-6 text-center">{rank}</span>;
    }
  };

  return (
    <div id="leaderboard-view" className="space-y-6 max-w-6xl mx-auto bg-[#FFFDF6] rounded-3xl border-4 border-[#2D3436] p-6 md:p-8 shadow-[8px_8px_0px_0px_rgba(45,52,54,1)] animate-fade-in text-[#2D3436]">
      {/* Header */}
      <div className="flex justify-between items-center pb-4 border-b-2 border-dashed border-[#2D3436]">
        <button
          id="leaderboard-back-btn"
          onClick={() => { playSound('popup'); onBack(); }}
          className="flex items-center gap-1.5 bg-[#FAB1A0] text-[#2D3436] font-black uppercase text-xs border-2 border-[#2D3436] py-1 px-3 rounded-lg transition-all hover:translate-y-[-1px] hover:shadow-[2px_2px_0px_0px_rgba(45,52,54,1)] active:translate-y-0"
        >
          <ArrowLeft className="w-5 h-5" /> TRỞ VỀ MAP
        </button>
        <div className="text-center">
          <h2 className="text-2xl font-sans font-black text-[#2D3436] flex items-center justify-center gap-1 uppercase italic">
            🏆 BẢNG VÀNG ANH HÙNG
          </h2>
          <p className="text-xs text-slate-600 font-bold">Thành tích thi đua gõ phím cùng các bạn muông thú</p>
        </div>
        <div className="w-20 hidden sm:block"></div> {/* spacer */}
      </div>

      {/* Leaderboard entries list */}
      <div className="space-y-3 pt-2">
        {allEntries.map((player, idx) => {
          const rank = idx + 1;
          const isUser = player.id === 'user-player';

          return (
            <div
              id={`leaderboard-row-${player.id}`}
              key={player.id}
              className={`p-4 rounded-2xl flex items-center justify-between border-2 border-[#2D3436] transition-all duration-300 ${
                isUser
                  ? 'bg-[#55EFC4] shadow-[4px_4px_0px_0px_rgba(45,52,54,1)] scale-[1.02]'
                  : 'bg-white'
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Rank indicator */}
                <div className="w-8 flex justify-center">
                  {getRankBadge(rank)}
                </div>

                {/* Avatar image */}
                <span className="p-1 bg-[#FFF9E6] rounded-xl border-2 border-[#2D3436] shadow-[2px_2px_0px_0px_rgba(45,52,54,1)] flex items-center justify-center">
                  <Avatar avatar={player.avatar} className="w-8 h-8" />
                </span>

                {/* Name & Sub details */}
                <div>
                  <h4 className={`text-base font-sans font-black flex items-center gap-1.5 uppercase ${isUser ? 'text-[#2D3436]' : 'text-[#2D3436]'}`}>
                    {player.name}
                  </h4>
                  <div className="flex items-center gap-3 text-xs text-slate-700 font-semibold">
                    {player.wpm > 0 && (
                      <span>⚡ Kỷ lục: <strong>{player.wpm} WPM</strong></span>
                    )}
                    {player.accuracy > 0 && (
                      <span>🎯 Chính xác: <strong>{player.accuracy}%</strong></span>
                    )}
                  </div>
                </div>
              </div>

              {/* Total Accumulated Score Bubble */}
              <div className="text-right">
                <span className={`px-4 py-1.5 rounded-full font-mono font-black text-sm border-2 border-[#2D3436] shadow-[2px_2px_0px_0px_rgba(45,52,54,1)] ${
                  isUser
                    ? 'bg-[#FF7675] text-[#2D3436]'
                    : 'bg-[#FFEAA7] text-[#2D3436]'
                }`}>
                  {player.score} Điểm
                </span>
                {isUser && (
                  <p className="text-[10px] text-slate-800 font-black mt-2">ĐÂY LÀ BÉ ĐÓ!</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Encouragement footer card */}
      <div className="bg-[#FFFFF0] rounded-2xl p-4 border-2 border-[#2D3436] text-center text-xs text-slate-700 font-bold max-w-sm mx-auto shadow-[2px_2px_0px_0px_rgba(45,52,54,1)]">
        🌈 Bé tập gõ phím mỗi ngày để leo lên hạng số một Bảng Vàng và chứng tỏ siêu tốc độ gõ phím của mình nhé!
      </div>
    </div>
  );
}
