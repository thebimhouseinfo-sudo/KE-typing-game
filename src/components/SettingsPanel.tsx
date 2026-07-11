import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { UserProfile } from '../types';
import { playSound } from '../utils/audio';
import { Settings, RotateCcw, Download, Upload, FileJson, AlertTriangle, Camera, CameraOff } from 'lucide-react';

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
  const [importError, setImportError] = useState<string | null>(null);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [showConfirmImport, setShowConfirmImport] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [isScanningQr, setIsScanningQr] = useState(false);
  const [scanStatus, setScanStatus] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scanTimerRef = useRef<number | null>(null);
  const scanStreamRef = useRef<MediaStream | null>(null);
  const [isParentUnlocked, setIsParentUnlocked] = useState(false);
  const [parentAnswer, setParentAnswer] = useState('');
  const [parentError, setParentError] = useState<string | null>(null);
  const [parentChallenge, setParentChallenge] = useState(() => {
    const number = Math.floor(Math.random() * 9) + 2;
    const factor = Math.random() < 0.5 ? 10 : 100;
    return { number, factor, answer: number * factor };
  });

  const refreshParentChallenge = () => {
    const number = Math.floor(Math.random() * 9) + 2;
    const factor = Math.random() < 0.5 ? 10 : 100;
    setParentChallenge({ number, factor, answer: number * factor });
    setParentAnswer('');
  };

  const handleParentUnlock = () => {
    if (Number(parentAnswer.trim()) === parentChallenge.answer) {
      setIsParentUnlocked(true);
      setParentError(null);
      playSound('correct');
      return;
    }

    setParentError('Sai dap an. Vui long thu phep tinh moi.');
    refreshParentChallenge();
    playSound('wrong');
  };

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

  useEffect(() => {
    let cancelled = false;
    const code = exportProgress();
    if (!code) {
      setQrDataUrl('');
      return;
    }

    QRCode.toDataURL(code, { errorCorrectionLevel: 'M', margin: 2, width: 240 })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch((e) => {
        console.error('QR generation failed:', e);
        if (!cancelled) setQrDataUrl('');
      });

    return () => {
      cancelled = true;
    };
  }, [profile]);

  const stopQrScan = () => {
    if (scanTimerRef.current !== null) {
      window.clearInterval(scanTimerRef.current);
      scanTimerRef.current = null;
    }
    scanStreamRef.current?.getTracks().forEach(track => track.stop());
    scanStreamRef.current = null;
    setIsScanningQr(false);
  };

  useEffect(() => {
    return () => stopQrScan();
  }, []);
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

  const handleScannedCode = (code: string) => {
    const parsed = parseImportCode(code);
    if (parsed) {
      window.__pendingImportProfile = parsed;
      setImportCode(code);
      setImportError(null);
      setShowConfirmImport(true);
      setScanStatus('Da quet QR thanh cong.');
      stopQrScan();
      playSound('correct');
    } else {
      setImportError('QR khong hop le! Vui long quet dung QR du lieu tien trinh.');
      playSound('wrong');
    }
  };

  const startQrScan = async () => {
    const BarcodeDetectorCtor = (window as any).BarcodeDetector;
    if (!BarcodeDetectorCtor) {
      setImportError('Trinh duyet nay chua ho tro quet QR truc tiep. Vui long dung file JSON de cap nhat du lieu.');
      playSound('wrong');
      return;
    }

    try {
      setImportError(null);
      setScanStatus('Dang mo camera...');
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      scanStreamRef.current = stream;
      setIsScanningQr(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      const detector = new BarcodeDetectorCtor({ formats: ['qr_code'] });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      setScanStatus('Dua QR vao khung camera.');

      scanTimerRef.current = window.setInterval(async () => {
        const video = videoRef.current;
        if (!video || !context || video.readyState < 2) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const barcodes = await detector.detect(canvas);
        const rawValue = barcodes?.[0]?.rawValue;
        if (rawValue) handleScannedCode(rawValue);
      }, 500);
    } catch (e) {
      console.error('QR scan failed:', e);
      setImportError('Khong mo duoc camera. Vui long kiem tra quyen camera hoac dung file JSON.');
      stopQrScan();
      playSound('wrong');
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

  if (!isParentUnlocked) {
    return (
      <div id="settings-parent-gate" className="animate-fade-in">
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_12px_30px_rgba(60,60,100,0.08)] border-0 max-w-md mx-auto">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-[rgba(0,0,0,0.08)]">
            <button
              onClick={() => { playSound('popup'); onBack(); }}
              className="w-12 h-12 bg-gradient-to-br from-[#5b8cff] to-[#7aa8ff] text-white rounded-full flex items-center justify-center font-bold shadow-[0_8px_20px_rgba(91,140,255,0.25)] transition-transform hover:scale-105 active:scale-95"
            >
              &larr;
            </button>
            <div className="flex items-center gap-3">
              <Settings className="w-8 h-8 text-[#5b8cff]" />
              <h2 className="text-2xl md:text-3xl font-sans font-black tracking-tight text-[#35354a] uppercase italic">
                Phu huynh
              </h2>
            </div>
          </div>

          <div className="space-y-5 text-center">
            <div className="bg-[#f0f7ff] border-2 border-[#5b8cff]/30 rounded-2xl p-5">
              <p className="text-sm text-[#5b8cff] font-black uppercase mb-2">Khu vuc cai dat danh cho phu huynh</p>
              <p className="text-[#35354a] font-bold text-lg">Vui long tra loi phep tinh:</p>
              <div className="text-4xl font-black font-mono text-[#35354a] my-4">
                {parentChallenge.number} x {parentChallenge.factor} = ?
              </div>
              <input
                value={parentAnswer}
                onChange={(e) => {
                  setParentAnswer(e.target.value.replace(/[^0-9]/g, ''));
                  setParentError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleParentUnlock();
                }}
                inputMode="numeric"
                className="w-full h-14 text-center text-2xl font-black font-mono rounded-xl bg-white border-2 border-[#dce8ff] text-[#35354a] focus:outline-none focus:border-[#5b8cff]"
                placeholder="Nhap dap an"
                autoFocus
              />
              {parentError && (
                <p className="text-red-500 font-bold text-sm mt-3">{parentError}</p>
              )}
            </div>

            <button
              onClick={handleParentUnlock}
              disabled={!parentAnswer.trim()}
              className="w-full bg-gradient-to-br from-[#5b8cff] to-[#7aa8ff] disabled:from-gray-300 disabled:to-gray-400 text-white font-black py-4 px-6 rounded-2xl shadow-lg transition-all hover:translate-y-[-2px] active:translate-y-0 uppercase tracking-wide disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              Vao cai dat
            </button>
          </div>
        </div>
      </div>
    );
  }
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
                  <div className="bg-white rounded-xl p-4 border border-blue-100 flex flex-col items-center gap-3">
                    <p className="text-xs text-gray-500 font-bold uppercase">QR du lieu tien trinh</p>
                    {qrDataUrl ? (
                      <img src={qrDataUrl} alt="QR du lieu tien trinh" className="w-60 h-60 rounded-xl border border-blue-100 bg-white p-2" />
                    ) : (
                      <div className="w-60 h-60 rounded-xl border border-blue-100 bg-gray-50 flex items-center justify-center text-gray-400 font-bold text-sm">
                        Dang tao QR...
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleDownloadJSON}
                    className="w-full bg-gradient-to-br from-green-500 to-green-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all hover:translate-y-[-2px] flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Tai du lieu
                  </button>
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
                  <div className="bg-white rounded-xl p-4 border border-purple-100 space-y-3">
                    <button
                      onClick={isScanningQr ? stopQrScan : startQrScan}
                      className="w-full bg-gradient-to-br from-purple-500 to-purple-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all hover:translate-y-[-2px] flex items-center justify-center gap-2"
                    >
                      {isScanningQr ? <CameraOff className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
                      {isScanningQr ? 'Dung quet QR' : 'Quet QR'}
                    </button>

                    {isScanningQr && (
                      <div className="space-y-2">
                        <video ref={videoRef} className="w-full aspect-video rounded-xl bg-black object-cover" muted playsInline />
                        {scanStatus && <p className="text-xs text-purple-600 font-bold text-center">{scanStatus}</p>}
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 font-bold">HOAC</span>
                      <label className="flex-1 cursor-pointer">
                        <input
                          type="file"
                          accept=".json,application/json"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <div className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg text-center transition-colors flex items-center justify-center gap-2">
                          <Upload className="w-4 h-4" />
                          Cap nhat du lieu
                        </div>
                      </label>
                    </div>
                  </div>

                  {showConfirmImport && (
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
