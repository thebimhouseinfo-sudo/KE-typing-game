import React, { useState } from 'react';
import { UserProfile, InputMethod } from '../types';
import { playSound } from '../utils/audio';
import { ChevronRight, Sparkles, Keyboard } from 'lucide-react';
import Avatar from './Avatar';

interface ProfileSetupProps {
  onSave: (name: string, avatar: string, inputMethod: InputMethod) => void;
  initialName?: string;
  initialAvatar?: string;
  initialInputMethod?: InputMethod;
}

const AVATARS = ['fox', 'rabbit', 'lion', 'tiger', 'panda', 'brown-bear', 'squirrel', 'koala', 'unicorn', 'dinosaur', 'frog', 'penguin'];

const AVATAR_NAMES: Record<string, string> = {
  fox: 'Cáo Sáng Tạo',
  rabbit: 'Thỏ Nhanh Nhảu',
  lion: 'Sư Tử Dũng Mãnh',
  tiger: 'Hổ Tinh Nghịch',
  panda: 'Gấu Trúc Đáng Yêu',
  'brown-bear': 'Gấu Mập Mạp',
  squirrel: 'Sóc Nhanh Trí',
  koala: 'Koala Ngoan Ngoãn',
  unicorn: 'Kỳ Lân Nhiệm Màu',
  dinosaur: 'Khủng Long Nhỏ',
  frog: 'Ếch Xanh Vui Vẻ',
  penguin: 'Chim Cánh Cụt'
};

export default function ProfileSetup({ onSave, initialName = '', initialAvatar = 'fox', initialInputMethod = 'telex' }: ProfileSetupProps) {
  const [selectedAvatar, setSelectedAvatar] = useState(initialAvatar);
  const [inputMethod, setInputMethod] = useState<InputMethod>(initialInputMethod);
  const [restoreCode, setRestoreCode] = useState('');
  const [restoreStatus, setRestoreStatus] = useState('');
  const [showBackupArea, setShowBackupArea] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const generatedName = AVATAR_NAMES[selectedAvatar] || `Siêu Nhân ${selectedAvatar}`;
    playSound('victory');
    onSave(generatedName, selectedAvatar, inputMethod);
  };

  const handleAvatarSelect = (avatar: string) => {
    setSelectedAvatar(avatar);
    playSound('key-press');
  };

  const handleMethodSelect = (method: InputMethod) => {
    setInputMethod(method);
    playSound('key-press');
  };

  // Import magic data code to recover progress
  const handleImportRestore = () => {
    try {
      if (!restoreCode.trim()) {
        setRestoreStatus('⚠️ Bé ơi, vui lòng nhập mã cũ!');
        return;
      }
      const rawDecoded = atob(restoreCode.trim());
      const parsed = JSON.parse(rawDecoded);
      if (parsed && typeof parsed === 'object' && parsed.name) {
        localStorage.setItem('be_tap_go_phim_profile', JSON.stringify(parsed));
        setRestoreStatus('🎉 KHÔI PHỤC THÀNH CÔNG! Đang tải lại...');
        playSound('victory');
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } else {
        setRestoreStatus('⚠️ Mã khôi phục không đúng cấu trúc bé ơi!');
      }
    } catch (err) {
      setRestoreStatus('⚠️ Ôi, mã này không đúng rồi bé ơi!');
      playSound('wrong');
    }
  };

  // Generate current profile magic base64 string
  const getExportCode = () => {
    try {
      const stored = localStorage.getItem('be_tap_go_phim_profile');
      if (stored) {
        return btoa(stored);
      }
    } catch (e) {}
    return '';
  };

  const hasSavedProfile = !!initialName;
  const currentBackup = getExportCode();

  return (
    <div id="profile-setup-card" className="max-w-6xl mx-auto bg-[#FFFDF6] rounded-3xl border-4 border-[#2D3436] shadow-[8px_8px_0px_0px_rgba(45,52,54,1)] overflow-hidden p-6 md:p-8 transform transition-all text-[#2D3436]">
      <div className="text-center mb-6">
        <div className="w-18 h-18 bg-[#FFEAA7] rounded-full border-2 border-[#2D3436] flex items-center justify-center mx-auto mb-3 shadow-[4px_4px_0px_0px_rgba(45,52,54,1)] overflow-hidden">
          <Avatar avatar={selectedAvatar} className="w-12 h-12 -rotate-12" />
        </div>

        <h2 id="profile-setup-title" className="text-3xl font-sans font-black text-[#2D3436] tracking-tight flex items-center justify-center gap-2 uppercase">
          CHÀO MỪNG BÉ TẬP GÕ PHÍM! <Sparkles className="text-[#FFCC00] fill-[#FFCC00] w-6 h-6 animate-spin-slow" />
        </h2>
        <p className="text-slate-600 mt-2 font-semibold text-xs md:text-sm">
          {hasSavedProfile 
            ? "Bé có thể đổi Linh vật, bộ gõ phím bên dưới bất cứ lúc nào mà không sợ mất điểm số." 
            : "Chọn nhân vật thông thái để ghi nhớ điểm số và bắt đầu tham gia lớp học gõ phím!"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Mascot Select */}
        <div>
          <label className="block text-[#2D3436] font-sans font-black mb-2 uppercase tracking-wide text-xs">
            🦊 Chọn Linh vật đồng hành:
          </label>
          <div className="grid grid-cols-6 gap-3 pt-1">
            {AVATARS.map((avatar) => (
              <button
                id={`avatar-choice-${avatar}`}
                key={avatar}
                type="button"
                onClick={() => handleAvatarSelect(avatar)}
                className={`p-3 rounded-2xl border-2 border-[#2D3436] transition-all duration-300 transform active:scale-95 flex items-center justify-center ${
                  selectedAvatar === avatar
                    ? 'bg-[#FF7675] scale-110 shadow-[3px_3px_0px_0px_rgba(45,52,54,1)] rotate-3'
                    : 'bg-[#FFF9E6] opacity-75 hover:opacity-100 hover:scale-105'
                }`}
              >
                <Avatar avatar={avatar} className="w-12 h-12" />
              </button>
            ))}
          </div>
        </div>



        {/* Submit */}
        <button
          id="profile-setup-submit"
          type="submit"
          className="w-full bg-[#FAB1A0] text-[#2D3436] font-sans font-black text-xl py-4 rounded-2xl border-4 border-[#2D3436] shadow-[5px_5px_0px_0px_rgba(45,52,54,1)] transition-all hover:translate-y-[-2px] hover:shadow-[7px_7px_0px_0px_rgba(45,52,54,1)] active:translate-y-0 active:shadow-[2px_2px_0px_0px_rgba(45,52,54,1)] flex items-center justify-center gap-2 text-center uppercase tracking-wider"
        >
          Sẵn Sàng Học Gõ Nào! <ChevronRight className="w-6 h-6" />
        </button>
      </form>

    </div>
  );
}
