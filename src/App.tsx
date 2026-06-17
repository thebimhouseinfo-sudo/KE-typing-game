import React, { useState, useEffect } from 'react';
import { UserProfile, Level, InputMethod } from './types';
import { LEVELS, BADGES } from './data';
import ProfileSetup from './components/ProfileSetup';
import MapSelection from './components/MapSelection';
import GameArea from './components/GameArea';
import Leaderboard from './components/Leaderboard';
import Rewards from './components/Rewards';
import SettingsPanel from './components/SettingsPanel';
import SoundToggle from './components/SoundToggle';
import { playSound } from './utils/audio';
import { Sparkles, Keyboard, Trophy, Award, Gift, Star, Home, Settings } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'be_tap_go_phim_profile';
const STORAGE_KEY = 'ke_typing_game_progress';

export default function App() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeView, setActiveView] = useState<'profile-setup' | 'map' | 'game' | 'leaderboard' | 'rewards' | 'settings'>('map');
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

  // PostMessage communication with parent Blogger page
  useEffect(() => {
    // Listen for messages from the game iframe
    const handleMessage = (event: MessageEvent) => {
      // Only process messages from the expected origin
      if (event.origin !== 'https://thebimhouseinfo-sudo.github.io') return;

      const message = event.data;

      if (message.type === 'GET_PROGRESS') {
        // Game requests progress data: Read from Blogger's localStorage
        const savedData = localStorage.getItem(STORAGE_KEY);
        // Send data back to the iframe
        event.source?.postMessage({
          type: 'SEND_PROGRESS',
          data: savedData ? JSON.parse(savedData) : null
        }, event.origin);
      } 
      else if (message.type === 'SAVE_PROGRESS') {
        // Game requests to save progress: Store in Blogger's localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(message.data));
        console.log('Blogger đã lưu hộ tiến trình thành công!');
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
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

    // Send progress to parent Blogger page via postMessage
    window.parent.postMessage({
      type: 'SAVE_PROGRESS',
      data: updatedProfile
    }, 'https://thebimhouseinfo-sudo.github.io');
  };

  const handleUpdateInputMethod = (inputMethod: InputMethod) => {
    if (!profile) return;
    const updatedProfile: UserProfile = { ...profile, inputMethod };
    setProfile(updatedProfile);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedProfile));

    // Send progress to parent Blogger page via postMessage
    window.parent.postMessage({
      type: 'SAVE_PROGRESS',
      data: updatedProfile
    }, 'https://thebimhouseinfo-sudo.github.io');
  };

  const handleResetProfile = () => {
    if (window.confirm("Bé có chắc chắn muốn bắt đầu lại từ đầu không? Toàn bộ điểm và huân chương sẽ bị xóa đấy!")) {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      setProfile(null);
      setActiveView('profile-setup');
      playSound('wrong');

      // Notify parent Blogger page to clear progress
      window.parent.postMessage({
        type: 'SAVE_PROGRESS',
        data: null
      }, 'https://thebimhouseinfo-sudo.github.io');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-soft py-6 px-4 md:py-10 selection:bg-[#55EFC4] text-[#35354a] relative overflow-hidden">
      {/* Decorative circles */}
      <div className="deco deco1"></div>
      <div className="deco deco2"></div>
      <div className="deco deco3"></div>
      
      <div className="max-w-6xl mx-auto space-y-8 select-none relative z-10">
        
        {/* Unified Application Header Bar - Soft gradient style */}
        <header className="flex flex-col sm:flex-row justify-between items-center bg-white rounded-3xl p-4 md:px-8 shadow-[0_12px_30px_rgba(60,60,100,0.08)] gap-4 border-0">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => { playSound('popup'); if (profile) { setActiveView('map'); } else { setActiveView('profile-setup'); } }}>
            <div className="w-12 h-12 bg-gradient-to-br from-[#ffb020] to-[#ff8c00] rounded-2xl flex items-center justify-center shadow-[0_8px_20px_rgba(255,140,0,0.25)]">
              <span className="text-2xl animate-bounce-slow">⌨️</span>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-sans font-black tracking-tight text-[#35354a] uppercase italic flex items-center gap-1">
                BÉ TẬP GÕ PHÍM <Sparkles className="w-6 h-6 text-[#ffb020] fill-[#ffb020] animate-pulse" />
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap justify-center">
            <a
              href="https://kideschool.blogspot.com/p/tin-hoc.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-bold bg-white text-[#35354a] py-3 px-5 rounded-full shadow-[0_8px_20px_rgba(0,0,0,0.06)] transition-all hover:translate-y-[-3px] flex items-center gap-2"
            >
              <Home className="w-4 h-4" /> TRANG CHỦ
            </a>
            
            {profile && activeView !== 'map' && activeView !== 'profile-setup' && (
              <button
                id="header-home-short-btn"
                onClick={() => { playSound('popup'); setActiveView('map'); }}
                className="text-sm font-bold bg-white text-[#35354a] py-3 px-5 rounded-full shadow-[0_8px_20px_rgba(0,0,0,0.06)] transition-all hover:translate-y-[-3px]"
              >
                🗺️ Bản Đồ Level
              </button>
            )}
            
            <SoundToggle />

            {profile && (
              <button
                id="app-settings-btn"
                onClick={() => { playSound('popup'); setActiveView('settings'); }}
                className="p-3 rounded-full border-2 bg-white border-[#5b8cff] text-[#5b8cff] hover:bg-[#f0f7ff] transition-all duration-300 transform active:scale-95 shadow-md flex items-center justify-center"
                title="Cài đặt"
              >
                <Settings className="w-6 h-6" />
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

          {activeView === 'settings' && profile && (
            <SettingsPanel
              profile={profile}
              onBack={() => setActiveView('map')}
              onResetProfile={handleResetProfile}
              onSaveProfile={(updatedProfile: UserProfile) => {
                setProfile(updatedProfile);
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedProfile));
                
                // Send progress to parent Blogger page via postMessage
                window.parent.postMessage({
                  type: 'SAVE_PROGRESS',
                  data: updatedProfile
                }, 'https://thebimhouseinfo-sudo.github.io');
                
                playSound('correct');
                setActiveView('map');
              }}
            />
          )}
        </main>

        {/* Footer info badge */}
        <footer className="mt-10 text-center text-[13px] text-[#8a8aa0] font-medium border-t border-dashed border-[rgba(0,0,0,0.08)] pt-5">
          <p>Made with ♥ for little learners — Kid eschool</p>
        </footer>
      </div>
    </div>
  );
}
