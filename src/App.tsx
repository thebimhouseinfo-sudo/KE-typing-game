import React, { useState, useEffect } from 'react';
import { UserProfile, Level, InputMethod } from './types';
import { LEVELS, BADGES } from './data';
import ProfileSetup from './components/ProfileSetup';
import MapSelection from './components/MapSelection';
import GameArea from './components/GameArea';
import Leaderboard from './components/Leaderboard';
import Rewards from './components/Rewards';
import SoundToggle from './components/SoundToggle';
import { playSound } from './utils/audio';
import { Sparkles, Keyboard, Trophy, Award, Gift, Star, Home } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'be_tap_go_phim_profile';

export default function App() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeView, setActiveView] = useState<'profile-setup' | 'map' | 'game' | 'leaderboard' | 'rewards'>('map');
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);

  // Load profile from localStorage on boot
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      console.log('Loading profile from localStorage:', stored);
      if (stored) {
        const parsed = JSON.parse(stored);
        const safeProfile: UserProfile = {
          name: parsed.name || '',
          avatar: parsed.avatar || 'fox',
          inputMethod: parsed.inputMethod || 'telex',
          score: parsed.score || 0,
          completedLevels: parsed.completedLevels || {},
          badges: parsed.badges || []
        };
        setProfile(safeProfile);
        setActiveView('map');
        console.log('Profile loaded, setting view to map');
      } else {
        setActiveView('profile-setup');
        console.log('No profile found, setting view to profile-setup');
      }
    } catch (e) {
      console.warn("Could not load stored profile", e);
      setActiveView('profile-setup');
    }
  }, []);

  const handleSaveProfile = (name: string, avatar: string, inputMethod: InputMethod) => {
    const updatedProfile: UserProfile = profile
      ? { ...profile, name, avatar, inputMethod }
      : {
          name,
          avatar,
          inputMethod,
          score: 0,
          completedLevels: {},
          badges: []
        };

    setProfile(updatedProfile);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedProfile));
    setActiveView('map');
  };

  const handleSelectLevel = (level: Level) => {
    setSelectedLevel(level);
    setActiveView('game');
  };

  const handleFinishLevel = (stars: number, earnedScore: number, wpm: number, accuracy: number) => {
    if (!profile || !selectedLevel) return;

    const levelId = selectedLevel.id;
    const prevStats = profile.completedLevels[levelId];
    const prevHighScore = prevStats?.highScore || 0;

    // We only add score differences to keep overall score consistent
    const scoreDiff = Math.max(0, earnedScore - prevHighScore);
    const finalScore = profile.score + scoreDiff;

    const completedLevels = {
      ...profile.completedLevels,
      [levelId]: {
        stars: Math.max(prevStats?.stars || 0, stars),
        highScore: Math.max(prevHighScore, earnedScore),
        wpm: Math.max(prevStats?.wpm || 0, wpm),
        accuracy: Math.max(prevStats?.accuracy || 0, accuracy)
      }
    };

    // Check newly unlocked badges on completion
    const newBadges = [...profile.badges];
    
    // Condition mapping:
    // lvl-1 unlocked 1 star -> badge-1
    if (completedLevels['lvl-1']?.stars > 0 && !newBadges.includes('badge-1')) {
      newBadges.push('badge-1');
      playSound('badge');
    }
    // lvl-2 unlocked 1 star -> badge-2
    if (completedLevels['lvl-2']?.stars > 0 && !newBadges.includes('badge-2')) {
      newBadges.push('badge-2');
      playSound('badge');
    }
    // lvl-5 unlocked 1 star -> badge-3
    if (completedLevels['lvl-5']?.stars > 0 && !newBadges.includes('badge-3')) {
      newBadges.push('badge-3');
      playSound('badge');
    }
    // lvl-6 (Vietnamese letters) unlocked 1 star -> badge-4
    if (completedLevels['lvl-6']?.stars > 0 && !newBadges.includes('badge-4')) {
      newBadges.push('badge-4');
      playSound('badge');
    }
    // lvl-8 (Words) completed with at least 1 star -> badge-5
    if (completedLevels['lvl-8']?.stars > 0 && !newBadges.includes('badge-5')) {
      newBadges.push('badge-5');
      playSound('badge');
    }
    // lvl-10 (Bubble race) completed with score > 0 -> badge-6
    if (completedLevels['lvl-10']?.stars > 0 && !newBadges.includes('badge-6')) {
      newBadges.push('badge-6');
      playSound('badge');
    }

    const updatedProfile: UserProfile = {
      ...profile,
      score: finalScore,
      completedLevels,
      badges: newBadges
    };

    setProfile(updatedProfile);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedProfile));
  };

  const handleUpdateInputMethod = (inputMethod: InputMethod) => {
    if (!profile) return;
    const updatedProfile: UserProfile = { ...profile, inputMethod };
    setProfile(updatedProfile);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedProfile));
  };

  const handleResetProfile = () => {
    if (window.confirm("Bé có chắc chắn muốn bắt đầu lại từ đầu không? Toàn bộ điểm và huân chương sẽ bị xóa đấy!")) {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      setProfile(null);
      setActiveView('profile-setup');
      playSound('wrong');
    }
  };

  return (
    <div className="min-h-screen bg-dot-pattern py-6 px-4 md:py-10 selection:bg-[#55EFC4] text-[#2D3436]">
      <div className="max-w-6xl mx-auto space-y-8 select-none">
        
        {/* Unified Application Header Bar - Artistic Flair Neo-Brutalist design */}
        <header className="flex flex-col sm:flex-row justify-between items-center bg-white rounded-3xl border-4 border-[#6C5CE7] p-4 md:px-8 shadow-[8px_8px_0px_0px_rgba(108,92,231,1)] gap-4">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => { playSound('popup'); if (profile) { setActiveView('map'); } else { setActiveView('profile-setup'); } }}>
            <div className="w-12 h-12 bg-[#FF7675] rounded-xl border-2 border-[#2D3436] flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(45,52,54,1)]">
              <span className="text-2xl animate-bounce-slow">⌨️</span>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-sans font-black tracking-tight text-[#2D3436] uppercase italic flex items-center gap-1">
                BÉ TẬP GÕ PHÍM <Sparkles className="w-6 h-6 text-[#F9CA24] fill-[#F9CA24] animate-pulse" />
              </h1>
              <p className="text-[11px] font-black text-[#A29BFE] uppercase tracking-widest font-mono">ĐÔI TAY VÀNG VIỆT NAM</p>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap justify-center">
            <a
              href="https://kideschool.blogspot.com/p/tin-hoc.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-black border-2 border-[#2D3436] py-2 px-4 rounded-xl bg-[#74B9FF] text-[#2D3436] shadow-[3px_3px_0px_0px_rgba(45,52,54,1)] transition-all hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_0px_rgba(45,52,54,1)] active:translate-y-0 active:shadow-[1px_1px_0px_0px_rgba(45,52,54,1)] flex items-center gap-1.5"
            >
              <Home className="w-4 h-4" /> TRANG CHỦ
            </a>
            
            {profile && activeView !== 'map' && activeView !== 'profile-setup' && (
              <button
                id="header-home-short-btn"
                onClick={() => { playSound('popup'); setActiveView('map'); }}
                className="text-xs font-black border-2 border-[#2D3436] py-2 px-4 rounded-xl bg-[#74B9FF] text-[#2D3436] shadow-[3px_3px_0px_0px_rgba(45,52,54,1)] transition-all hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_0px_rgba(45,52,54,1)] active:translate-y-0 active:shadow-[1px_1px_0px_0px_rgba(45,52,54,1)]"
              >
                🗺️ Bản Đồ Level
              </button>
            )}
            
            <SoundToggle />

            {profile && (
              <button
                id="app-reset-profile-btn"
                onClick={handleResetProfile}
                className="text-[10px] uppercase font-black text-[#2D3436] bg-[#FF7675] border-2 border-[#2D3436] py-2 px-3 rounded-lg shadow-[2px_2px_0px_0px_rgba(45,52,54,1)] transition-all hover:brightness-105 active:scale-95"
                title="Đặt lại gõ phím"
              >
                Reset
              </button>
            )}
          </div>
        </header>

        {/* Dynamic State Views Container */}
        <main className="transition-all duration-300">
          {activeView === 'profile-setup' && (
            <ProfileSetup
              onSave={handleSaveProfile}
              initialName={profile?.name}
              initialAvatar={profile?.avatar}
              initialInputMethod={profile?.inputMethod}
            />
          )}

          {activeView === 'map' && profile && (
            <MapSelection
              profile={profile}
              onSelectLevel={handleSelectLevel}
              onEditProfile={() => setActiveView('profile-setup')}
              onViewLeaderboard={() => setActiveView('leaderboard')}
              onViewBadges={() => setActiveView('rewards')}
            />
          )}

          {activeView === 'game' && profile && selectedLevel && (
            <GameArea
              level={selectedLevel}
              profile={profile}
              onFinish={handleFinishLevel}
              onUpdateInputMethod={handleUpdateInputMethod}
              onBack={() => {
                setSelectedLevel(null);
                setActiveView('map');
              }}
            />
          )}

          {activeView === 'leaderboard' && profile && (
            <Leaderboard
              profile={profile}
              onBack={() => setActiveView('map')}
            />
          )}

          {activeView === 'rewards' && profile && (
            <Rewards
              profile={profile}
              onBack={() => setActiveView('map')}
            />
          )}
        </main>

        {/* Footer info badge */}
        <footer className="text-center text-[11px] text-slate-400 font-medium">
          <p>Thiết kế dành riêng cho học sinh & trẻ em Việt Nam rèn luyện tư thế gõ phím chuẩn thế giới.</p>
          <p className="mt-1 font-mono">Vương Quốc Gõ Phím © 2026</p>
        </footer>
      </div>
    </div>
  );
}
