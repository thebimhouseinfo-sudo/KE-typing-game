import React, { useState } from 'react';
import { UserProfile } from '../types';
import { playSound } from '../utils/audio';
import { Settings, RotateCcw, Download, Upload, Copy, Check, FileJson, AlertTriangle } from 'lucide-react';

interface SettingsPanelProps {
  profile: UserProfile;
  onBack: () => void;
  onResetProfile: () => void;
  onSaveProfile: (profile: UserProfile) => void;
}

export default function SettingsPanel({
  profile,
  onBack,
  onResetProfile,
  onSaveProfile
}: SettingsPanelProps) {
  const [activeTab, setActiveTab] = useState<'reset' | 'export' | 'import'>('reset');
  const [importCode, setImportCode] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [showConfirmImport, setShowConfirmImport] = useState(false);

  // Export progress as base64 encoded JSON
  const exportProgress = () => {
    try {
      const jsonStr = JSON.stringify(profile);
      const base64Code = btoa(unescape(encodeURIComponent(jsonStr)));
      return base64Code;
    } catch (e) {
      console.error('Export failed:', e);
      return '';
    }
  };

  // Copy export code to clipboard
  const handleCopyCode = async () => {
    const code = exportProgress();
    try {
      await navigator.clipboard.writeText(code);
      setCopySuccess(true);
      playSound('correct');
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (e) {
      console.error('Copy failed:', e);
      playSound('wrong');
    }
  };

  // Download as JSON file
  const handleDownloadJSON = () => {
    try {
      const jsonStr = JSON.stringify(profile, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `be-tap-go-phim-${profile.name.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      playSound('correct');
    } catch (e) {
      console.error('Download failed:', e);
      playSound('wrong');
    }
  };

  // Import progress from code
  const parseImportCode = (code: string): UserProfile | null => {
    try {
      const jsonStr = decodeURIComponent(escape(atob(code.trim())));
      const parsed = JSON.parse(jsonStr);
      
      // Sanitize and validate the imported profile
      const safeProfile: UserProfile = {
        name: typeof parsed.name === 'string' ? parsed.name : '',
        avatar: typeof parsed.avatar === 'string' ? parsed.avatar : 'fox',
        inputMethod: parsed.inputMethod === 'telex' || parsed.inputMethod === 'vni' ? parsed.inputMethod : 'telex',
        score: typeof parsed.score === 'number' ? parsed.score : 0,
        completedLevels: typeof parsed.completedLevels === 'object' ? parsed.completedLevels : {},
        badges: Array.isArray(parsed.badges) ? parsed.badges : []
      };
      
      return safeProfile;
    } catch (e) {
      console.error('Parse failed:', e);
      return null;
    }
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        
        const safeProfile: UserProfile = {
          name: typeof parsed.name === 'string' ? parsed.name : '',
          avatar: typeof parsed.avatar === 'string' ? parsed.avatar : 'fox',
          inputMethod: parsed.inputMethod === 'telex' || parsed.inputMethod === 'vni' ? parsed.inputMethod : 'telex',
          score: typeof parsed.score === 'number' ? parsed.score : 0,
          completedLevels: typeof parsed.completedLevels === 'object' ? parsed.completedLevels : {},
          badges: Array.isArray(parsed.badges) ? parsed.badges : []
        };
        
        setImportError(null);
        // Store temporarily for confirmation
        window.__pendingImportProfile = safeProfile;
        setShowConfirmImport(true);
      } catch (err) {
        setImportError('File không hợp lệ! Vui lòng chọn file .json đúng định dạng.');
        playSound('wrong');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  // Confirm and apply import
  const confirmImport = () => {
    const pendingProfile = window.__pendingImportProfile;
    if (pendingProfile) {
      onSaveProfile(pendingProfile);
      setShowConfirmImport(false);
      setImportCode('');
      setImportError(null);
      playSound('correct');
    }
  };

  // Handle manual code import
  const handleImportCode = () => {
    const parsed = parseImportCode(importCode);
    if (parsed) {
      window.__pendingImportProfile = parsed;
      setShowConfirmImport(true);
    } else {
      setImportError('Mã không hợp lệ! Vui lòng kiểm tra lại mã hoặc file đã tải lên.');
      playSound('wrong');
    }
  };

  // Confirm reset
  const confirmReset = () => {
    onResetProfile();
    setShowConfirmReset(false);
  };

  return (
    <div id="settings-panel-view" className="animate-fade-in">
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_12px_30px_rgba(60,60,100,0.08)] border-0 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-[rgba(0,0,0,0.08)]">
          <button
            onClick={() => { playSound('popup'); onBack(); }}
            className="w-12 h-12 bg-gradient-to-br from-[#5b8cff] to-[#7aa8ff] text-white rounded-full flex items-center justify-center font-bold shadow-[0_8px_20px_rgba(91,140,255,0.25)] transition-transform hover:scale-105 active:scale-95"
          >
            ←
          </button>
          <div className="flex items-center gap-3">
            <Settings className="w-8 h-8 text-[#5b8cff]" />
            <h2 className="text-2xl md:text-3xl font-sans font-black tracking-tight text-[#35354a] uppercase italic">
              Cài Đặt
            </h2>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          <button
            onClick={() => { playSound('popup'); setActiveTab('reset'); }}
            className={`px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all ${
              activeTab === 'reset'
                ? 'bg-gradient-to-br from-[#ff6b6b] to-[#ee5a5a] text-white shadow-lg'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <RotateCcw className="w-4 h-4 inline mr-1" />
            Đặt Lại Tiến Trình
          </button>
          <button
            onClick={() => { playSound('popup'); setActiveTab('export'); }}
            className={`px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all ${
              activeTab === 'export'
                ? 'bg-gradient-to-br from-[#5b8cff] to-[#7aa8ff] text-white shadow-lg'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Download className="w-4 h-4 inline mr-1" />
            Xuất Tiến Trình
          </button>
          <button
            onClick={() => { playSound('popup'); setActiveTab('import'); }}
            className={`px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all ${
              activeTab === 'import'
                ? 'bg-gradient-to-br from-[#5b8cff] to-[#7aa8ff] text-white shadow-lg'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Upload className="w-4 h-4 inline mr-1" />
            Nhập Tiến Trình
          </button>
        </div>

        {/* Tab Content */}
        <div className="min-h-[300px]">
          {/* Reset Tab */}
          {activeTab === 'reset' && (
            <div className="space-y-4">
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6">
                <div className="flex items-start gap-3 mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-500 shrink-0" />
                  <div>
                    <h3 className="font-sans font-black text-lg text-red-700 uppercase">
                      Cảnh Báo Quan Trọng!
                    </h3>
                    <p className="text-sm text-red-600 font-semibold mt-1">
                      Hành động này sẽ xóa toàn bộ tiến trình học tập của bé bao gồm điểm số, sao, và huân chương đã đạt được.
                    </p>
                  </div>
                </div>

                {!showConfirmReset ? (
                  <button
                    onClick={() => { playSound('popup'); setShowConfirmReset(true); }}
                    className="w-full bg-gradient-to-br from-red-500 to-red-600 text-white font-black py-4 px-6 rounded-2xl shadow-lg transition-all hover:translate-y-[-2px] active:translate-y-0 uppercase tracking-wide"
                  >
                    <RotateCcw className="w-5 h-5 inline mr-2" />
                    Bắt Đầu Lại Từ Đầu
                  </button>
                ) : (
                  <div className="space-y-3">
                    <p className="text-center font-bold text-red-700">
                      Bé có chắc chắn muốn xóa tất cả tiến trình không?
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={confirmReset}
                        className="flex-1 bg-gradient-to-br from-red-500 to-red-600 text-white font-black py-3 px-4 rounded-xl shadow-lg transition-all hover:translate-y-[-2px]"
                      >
                        Xóa Tất Cả
                      </button>
                      <button
                        onClick={() => { playSound('popup'); setShowConfirmReset(false); }}
                        className="flex-1 bg-gray-200 text-gray-700 font-black py-3 px-4 rounded-xl shadow-lg transition-all hover:translate-y-[-2px]"
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Export Tab */}
          {activeTab === 'export' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
                <div className="flex items-start gap-3 mb-4">
                  <FileJson className="w-8 h-8 text-blue-500 shrink-0" />
                  <div>
                    <h3 className="font-sans font-black text-lg text-blue-700 uppercase">
                      Xuất Dữ Liệu Học Tập
                    </h3>
                    <p className="text-sm text-blue-600 font-semibold mt-1">
                      Lưu lại tiến trình để chuyển sang máy khác hoặc sao lưu dữ liệu.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-white rounded-xl p-4 border border-blue-100">
                    <p className="text-xs text-gray-500 font-bold mb-2">MÃ SAO LƯU (Base64):</p>
                    <code className="block w-full bg-gray-50 text-xs text-gray-700 p-3 rounded-lg break-all font-mono max-h-32 overflow-y-auto">
                      {exportProgress()}
                    </code>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleCopyCode}
                      className="flex-1 bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all hover:translate-y-[-2px] flex items-center justify-center gap-2"
                    >
                      {copySuccess ? (
                        <>
                          <Check className="w-4 h-4" />
                          Đã Sao Chép!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Sao Chép Mã
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleDownloadJSON}
                      className="flex-1 bg-gradient-to-br from-green-500 to-green-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all hover:translate-y-[-2px] flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Tải File .JSON
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Import Tab */}
          {activeTab === 'import' && (
            <div className="space-y-4">
              <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-6">
                <div className="flex items-start gap-3 mb-4">
                  <Upload className="w-8 h-8 text-purple-500 shrink-0" />
                  <div>
                    <h3 className="font-sans font-black text-lg text-purple-700 uppercase">
                      Nhập Dữ Liệu Học Tập
                    </h3>
                    <p className="text-sm text-purple-600 font-semibold mt-1">
                      Khôi phục tiến trình từ máy khác hoặc file sao lưu.
                    </p>
                  </div>
                </div>

                {importError && (
                  <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-xl mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    <span className="font-bold text-sm">{importError}</span>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="bg-white rounded-xl p-4 border border-purple-100">
                    <label className="block text-xs text-gray-500 font-bold mb-2">
                      DÁN MÃ SAO LƯU HOẶC TẢI FILE LÊN:
                    </label>
                    <textarea
                      value={importCode}
                      onChange={(e) => setImportCode(e.target.value)}
                      placeholder="Dán mã base64 vào đây..."
                      className="w-full h-24 text-xs p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:border-purple-300 font-mono"
                    />
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-xs text-gray-500 font-bold">HOẶC</span>
                      <label className="flex-1 cursor-pointer">
                        <input
                          type="file"
                          accept=".json,application/json"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <div className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg text-center transition-colors flex items-center justify-center gap-2">
                          <Upload className="w-4 h-4" />
                          Chọn File .JSON
                        </div>
                      </label>
                    </div>
                  </div>

                  {!showConfirmImport ? (
                    <button
                      onClick={handleImportCode}
                      disabled={!importCode.trim()}
                      className="w-full bg-gradient-to-br from-purple-500 to-purple-600 disabled:from-gray-300 disabled:to-gray-400 text-white font-black py-4 px-6 rounded-2xl shadow-lg transition-all hover:translate-y-[-2px] active:translate-y-0 uppercase tracking-wide disabled:cursor-not-allowed disabled:hover:translate-y-0"
                    >
                      <Upload className="w-5 h-5 inline mr-2" />
                      Nhập Tiến Trình
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-center font-bold text-purple-700">
                        ⚠️ Tiến trình hiện tại sẽ bị ghi đè! Tiếp tục nhé?
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={confirmImport}
                          className="flex-1 bg-gradient-to-br from-purple-500 to-purple-600 text-white font-black py-3 px-4 rounded-xl shadow-lg transition-all hover:translate-y-[-2px]"
                        >
                          Xác Nhận Nhập
                        </button>
                        <button
                          onClick={() => { playSound('popup'); setShowConfirmImport(false); }}
                          className="flex-1 bg-gray-200 text-gray-700 font-black py-3 px-4 rounded-xl shadow-lg transition-all hover:translate-y-[-2px]"
                        >
                          Hủy
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Extend Window interface for pending import profile
declare global {
  interface Window {
    __pendingImportProfile?: UserProfile;
  }
}
