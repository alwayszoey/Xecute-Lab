import React, { useState, useRef } from 'react';
import { 
  Palette, 
  Upload, 
  Image as ImageIcon, 
  Cat, 
  Sparkles, 
  CheckCircle2, 
  Sliders, 
  Sun, 
  Moon,
  Loader2
} from 'lucide-react';
import { SiteSettings } from '../../lib/store.ts';

interface AdminThemeTabProps {
  settings: SiteSettings;
  onSaveSettings: (settings: Partial<SiteSettings>) => Promise<void>;
  onShowToast: (msg: string) => void;
}

export const AdminThemeTab: React.FC<AdminThemeTabProps> = ({
  settings,
  onSaveSettings,
  onShowToast
}) => {
  const [primaryColor, setPrimaryColor] = useState(settings.primaryColor || '#ff1e27');
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>(settings.themeMode || 'dark');
  const [websiteBgImage, setWebsiteBgImage] = useState(settings.websiteBgImage || '');
  const [bgOpacity, setBgOpacity] = useState(settings.websiteBgOpacity ?? 14);
  const [particleEffect, setParticleEffect] = useState(settings.particleEffect || 'oneko.js');
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setWebsiteBgImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSaveSettings({
        primaryColor,
        themeMode,
        websiteBgImage,
        websiteBgOpacity: Number(bgOpacity),
        particleEffect
      });
      onShowToast('บันทึกการตั้งค่าธีมและสีเรียบร้อยแล้ว!');
    } catch (err: any) {
      alert('เกิดข้อผิดพลาดในการบันทึกธีม: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const RED_PRESETS = [
    { label: 'แดงออริจินัล (Original Red)', hex: '#ff1e27' },
    { label: 'แดงสว่าง (Bright Red)', hex: '#ff3b42' },
    { label: 'แดงสด (Crimson Red)', hex: '#dc141c' },
    { label: 'แดงเข้ม (Deep Wine)', hex: '#8a0b10' },
    { label: 'ส้มเพลิง (Fiery Orange)', hex: '#ff5722' },
    { label: 'ทองคำ (Gold Glow)', hex: '#ffa000' },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in text-left">
      
      {/* Title Header - Red Original Theme */}
      <div className="flex items-center gap-2.5">
        <div className="size-8 rounded-lg bg-[#ff1e27]/20 text-[#ff1e27] flex items-center justify-center">
          <Palette className="size-5" />
        </div>
        <h2 className="font-heading text-xl sm:text-2xl font-bold text-white tracking-tight">
          ตั้งค่าธีมและสี (Theme & Styles)
        </h2>
      </div>

      <form onSubmit={handleSave} className="space-y-6 bg-[#0a0a0d] border border-white/10 p-5 sm:p-7 rounded-2xl shadow-2xl">
        
        {/* 1. สีหลัก (Primary Color) */}
        <div className="space-y-2">
          <label className="text-xs sm:text-sm font-semibold text-white/90 block">
            สีหลัก (Primary Color)
          </label>
          <div className="flex items-center gap-3">
            {/* Color Preview & Native Picker */}
            <label className="relative size-11 rounded-xl overflow-hidden cursor-pointer border border-white/20 shrink-0 shadow-md">
              <input 
                type="color" 
                value={primaryColor} 
                onChange={(e) => setPrimaryColor(e.target.value)} 
                className="absolute -inset-2 w-16 h-16 cursor-pointer opacity-0"
              />
              <div 
                className="size-full transition-transform hover:scale-110" 
                style={{ backgroundColor: primaryColor }}
              />
            </label>

            {/* Hex Text Input */}
            <input
              type="text"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              placeholder="#ff1e27"
              className="flex-1 px-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-sm font-mono text-white focus:outline-none focus:border-[#ff1e27] transition-colors"
            />
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap gap-2 pt-1.5">
            {RED_PRESETS.map((p) => (
              <button
                key={p.hex}
                type="button"
                onClick={() => setPrimaryColor(p.hex)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono border transition-all flex items-center gap-1.5 cursor-pointer ${
                  primaryColor.toLowerCase() === p.hex.toLowerCase()
                    ? 'border-[#ff1e27] bg-[#ff1e27]/20 text-white font-bold'
                    : 'border-white/10 bg-white/5 text-white/70 hover:border-white/25'
                }`}
              >
                <span className="size-2.5 rounded-full shrink-0" style={{ backgroundColor: p.hex }} />
                <span>{p.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 2. ธีม (Theme Mode) */}
        <div className="space-y-2">
          <label className="text-xs sm:text-sm font-semibold text-white/90 block">
            ธีม (Theme Mode)
          </label>
          <div className="grid grid-cols-2 gap-3">
            {/* Light Option */}
            <button
              type="button"
              onClick={() => setThemeMode('light')}
              className={`p-3.5 rounded-xl border flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
                themeMode === 'light'
                  ? 'bg-white text-black border-white font-bold shadow-lg shadow-white/20'
                  : 'bg-white/5 border-white/10 text-white/70 hover:border-white/25'
              }`}
            >
              <div className={`size-4 rounded-full border flex items-center justify-center ${
                themeMode === 'light' ? 'border-black' : 'border-white/40'
              }`}>
                {themeMode === 'light' && <div className="size-2 rounded-full bg-black" />}
              </div>
              <Sun className="size-4" />
              <span className="text-xs sm:text-sm">ธีมขาว</span>
            </button>

            {/* Dark Option */}
            <button
              type="button"
              onClick={() => setThemeMode('dark')}
              className={`p-3.5 rounded-xl border flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
                themeMode === 'dark'
                  ? 'bg-[#121217] text-white border-[#ff1e27] font-bold shadow-lg shadow-[#ff1e27]/25 ring-1 ring-[#ff1e27]'
                  : 'bg-white/5 border-white/10 text-white/70 hover:border-white/25'
              }`}
            >
              <div className={`size-4 rounded-full border flex items-center justify-center ${
                themeMode === 'dark' ? 'border-[#ff1e27]' : 'border-white/40'
              }`}>
                {themeMode === 'dark' && <div className="size-2 rounded-full bg-[#ff1e27]" />}
              </div>
              <Moon className="size-4 text-[#ff1e27]" />
              <span className="text-xs sm:text-sm">ธีมดำ</span>
            </button>
          </div>
        </div>

        {/* 3. รูปพื้นหลังเว็บไซต์ */}
        <div className="space-y-2">
          <label className="text-xs sm:text-sm font-semibold text-white/90 block">
            รูปพื้นหลังเว็บไซต์
          </label>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept="image/*" 
            className="hidden" 
          />
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="relative w-full border border-dashed border-white/20 hover:border-[#ff1e27] rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer bg-white/[0.02] hover:bg-[#ff1e27]/5 transition-all group min-h-[150px]"
          >
            {websiteBgImage ? (
              <div className="flex flex-col items-center gap-2">
                <img 
                  src={websiteBgImage} 
                  alt="Background preview" 
                  className="max-h-32 rounded-xl object-cover border border-[#ff1e27]/50 shadow-md" 
                />
                <span className="text-xs text-[#ff1e27] font-medium hover:underline">
                  คลิกเพื่อเปลี่ยนรูปพื้นหลังใหม่
                </span>
              </div>
            ) : (
              <>
                <div className="size-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 mb-2 group-hover:text-[#ff1e27] group-hover:border-[#ff1e27]/40 transition-colors">
                  <ImageIcon className="size-6" />
                </div>
                <span className="text-xs sm:text-sm font-bold text-white group-hover:text-[#ff1e27] transition-colors">
                  คลิก/ลากวาง เพื่ออัปโหลดรูป
                </span>
                <span className="text-[11px] text-white/40 mt-1">
                  แนะนำ 1920 × 1080 (16:9) รองรับ PNG, JPG, GIF, WebP ไม่เกิน 12MB
                </span>
              </>
            )}
          </div>

          {/* Quick URL Input */}
          <input
            type="url"
            value={websiteBgImage}
            onChange={(e) => setWebsiteBgImage(e.target.value)}
            placeholder="หรือวาง URL รูปภาพพื้นหลัง (https://...)"
            className="w-full mt-1.5 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#ff1e27] transition-colors"
          />
        </div>

        {/* 4. ความชัดของพื้นหลัง (Opacity Slider) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs sm:text-sm font-semibold text-white/90">
              ความชัดของพื้นหลัง
            </label>
            <span className="font-mono font-bold text-xs sm:text-sm text-[#ff1e27] bg-[#ff1e27]/10 px-2.5 py-0.5 rounded-lg border border-[#ff1e27]/30">
              {bgOpacity}%
            </span>
          </div>

          <input 
            type="range"
            min="0"
            max="100"
            value={bgOpacity}
            onChange={(e) => setBgOpacity(Number(e.target.value))}
            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#ff1e27]"
          />

          <span className="text-[11px] text-white/40 block">
            กด “บันทึกธีมและสี” เพื่อใช้กับพื้นหลังหน้าร้าน
          </span>
        </div>

        {/* 5. เอฟเฟกต์พื้นหลัง (Particle / Oneko.js) */}
        <div className="space-y-2">
          <label className="text-xs sm:text-sm font-semibold text-white/90 block">
            เอฟเฟกต์พื้นหลัง (Particle / Screenmate)
          </label>
          <div className="relative">
            <select
              value={particleEffect}
              onChange={(e) => setParticleEffect(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/15 text-xs sm:text-sm text-white focus:outline-none focus:border-[#ff1e27] transition-colors appearance-none cursor-pointer pr-10"
            >
              <option value="oneko.js" className="bg-[#111] text-white">oneko.js (แมวน้อยวิ่งตามเมาส์และทัชสกรีน)</option>
              <option value="particles" className="bg-[#111] text-white">particles (ละอองนีออนลอย)</option>
              <option value="matrix" className="bg-[#111] text-white">matrix (ฝนโค้ดดิจิทัล)</option>
              <option value="none" className="bg-[#111] text-white">ไม่มี (ปิดเอฟเฟกต์)</option>
            </select>
            <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#ff1e27]">
              <Cat className="size-4" />
            </div>
          </div>
        </div>

        {/* Submit Button (Original Red btn-primary) */}
        <div className="pt-3">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary w-full h-12 rounded-xl text-white font-bold text-sm sm:text-base shadow-xl shadow-[#ff1e27]/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="size-5 animate-spin" />
                <span>กำลังบันทึกธีมและสี...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="size-5" />
                <span>บันทึกธีมและสี</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};
