import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { toggleMute, getMuteState, playSound } from '../utils/audio';

export default function SoundToggle() {
  const [muted, setMuted] = useState(getMuteState());

  const handleToggle = () => {
    const isMuted = toggleMute();
    setMuted(isMuted);
    if (!isMuted) {
      playSound('popup');
    }
  };

  return (
    <button
      id="sound-toggle-btn"
      onClick={handleToggle}
      className={`p-3 rounded-full border-2 transition-all duration-300 transform active:scale-95 shadow-md flex items-center justify-center ${
        muted
          ? 'bg-rose-100 border-rose-300 text-rose-500 hover:bg-rose-200'
          : 'bg-emerald-100 border-emerald-300 text-emerald-600 hover:bg-emerald-200'
      }`}
      title={muted ? "Bật âm thanh" : "Tắt âm thanh"}
    >
      {muted ? <VolumeX className="w-6 h-6 animate-pulse" /> : <Volume2 className="w-6 h-6 animate-bounce" />}
    </button>
  );
}
