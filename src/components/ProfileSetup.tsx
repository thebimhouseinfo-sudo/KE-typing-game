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
    <div id="profile-setup-card" className="max-w-6xl mx-auto bg-white rounded-3xl p-8 md:p-10 shadow-[0_12px_30px_rgba(60,60,100,0.08)] overflow-hidden transition-all text-[#35354a]">
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-gradient-to-br from-[#5b8cff] to-[#7aa8ff] rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_8px_20px_rgba(91,140,255,0.25)] overflow-hidden">
          <Avatar avatar={selectedAvatar} className="w-14 h-14 -rotate-12" />
        </div>

        <h2 id="profile-setup-title" className="text-3xl md:text-4xl font-sans font-black text-[#35354a] tracking-tight flex items-center justify-center gap-2 uppercase">
          CHÀO MỪNG BÉ TẬP GÕ PHÍM! <Sparkles className="text-[#5b8cff] fill-[#5b8cff] w-7 h-7 animate-spin-slow" />
        </h2>
        <p className="text-[#8a8aa0] mt-3 font-semibold text-sm md:text-base">
          {hasSavedProfile 
            ? "Bé có thể đổi Linh vật, bộ gõ phím bên dưới bất cứ lúc nào mà không sợ mất điểm số." 
            : "Chọn nhân vật thông thái để ghi nhớ điểm số và bắt đầu tham gia lớp học gõ phím!"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Mascot Select */}
        <div>
          <label className="block text-[#35354a] font-sans font-black mb-4 uppercase tracking-wide text-sm">
            🦊 Chọn Linh vật đồng hành:
          </label>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-4 pt-2">
            {AVATARS.map((avatar) => (
              <button
                id={`avatar-choice-${avatar}`}
                key={avatar}
                type="button"
                onClick={() => handleAvatarSelect(avatar)}
                className={`p-4 rounded-2xl transition-all duration-300 transform active:scale-95 flex items-center justify-center ${
                  selectedAvatar === avatar
                    ? 'bg-gradient-to-br from-[#5b8cff] to-[#7aa8ff] scale-105 shadow-[0_12px_30px_rgba(91,140,255,0.25)]'
                    : 'bg-[#f4f4f7] hover:bg-[#e8e8ed] hover:scale-105'
                }`}
              >
                <Avatar avatar={avatar} className="w-14 h-14" />
              </button>
            ))}
          </div>
        </div>

        {/* Input Method Selection */}
        <div>
          <label className="block text-[#35354a] font-sans font-black mb-4 uppercase tracking-wide text-sm">
            ⌨️ Chọn kiểu gõ tiếng Việt:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => handleMethodSelect('telex')}
              className={`p-5 rounded-2xl text-left transition-all duration-200 ${
                inputMethod === 'telex'
                  ? 'bg-gradient-to-br from-[#5b8cff] to-[#7aa8ff] shadow-[0_12px_30px_rgba(91,140,255,0.25)] text-white'
                  : 'bg-[#f4f4f7] hover:bg-[#e8e8ed]'
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-sans font-black text-base">TELEX</span>
                {inputMethod === 'telex' && <span className="bg-white/20 text-white text-xs font-black py-1 px-3 rounded-full">ĐANG CHỌN</span>}
              </div>
              <p className={`text-xs font-semibold ${inputMethod === 'telex' ? 'text-white/90' : 'text-[#8a8aa0]'}`}>
                Phổ biến nhất! Dùng chữ cái để gõ dấu: aa → â, s → sắc
              </p>
            </button>

            <button
              type="button"
              onClick={() => handleMethodSelect('vni')}
              className={`p-5 rounded-2xl text-left transition-all duration-200 ${
                inputMethod === 'vni'
                  ? 'bg-gradient-to-br from-[#5b8cff] to-[#7aa8ff] shadow-[0_12px_30px_rgba(91,140,255,0.25)] text-white'
                  : 'bg-[#f4f4f7] hover:bg-[#e8e8ed]'
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-sans font-black text-base">VNI</span>
                {inputMethod === 'vni' && <span className="bg-white/20 text-white text-xs font-black py-1 px-3 rounded-full">ĐANG CHỌN</span>}
              </div>
              <p className={`text-xs font-semibold ${inputMethod === 'vni' ? 'text-white/90' : 'text-[#8a8aa0]'}`}>
                Dễ nhớ! Dùng số để gõ dấu: a6 → â, 1 → sắc
              </p>
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          id="profile-setup-submit"
          type="submit"
          className="w-full bg-gradient-to-br from-[#5b8cff] to-[#7aa8ff] text-white font-sans font-black text-xl py-4 rounded-full shadow-[0_12px_30px_rgba(91,140,255,0.25)] transition-all hover:translate-y-[-3px] hover:shadow-[0_18px_40px_rgba(91,140,255,0.35)] active:translate-y-0 flex items-center justify-center gap-2 text-center uppercase tracking-wider"
        >
          Sẵn Sàng Học Gõ Nào! <ChevronRight className="w-6 h-6" />
        </button>
      </form>

    </div>
  );
}
