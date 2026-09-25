import React, { useState, useEffect } from 'react';
import { Terminal, Check, X, Sparkles, ExternalLink, ShieldCheck, Tag, Copy, Download, Clock, AlertTriangle } from 'lucide-react';
import { ScriptUpdateItem } from '../../lib/store.ts';

interface ScriptUpdateModalProps {
  isOpen: boolean;
  editingUpdate: ScriptUpdateItem | null;
  onClose: () => void;
  onSave: (update: Partial<ScriptUpdateItem>, id?: string) => Promise<void>;
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; border: string; desc: string }> = {
  undetected: {
    label: 'Undetected (ปลอดภัย 100%)',
    bg: 'bg-emerald-500/15',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
    desc: 'สคริปต์ปลอดภัย ใช้งานได้ปกติ ไม่ถูกตรวจจับ'
  },
  updating: {
    label: 'Updating (กำลังอัปเดตแพตช์)',
    bg: 'bg-amber-500/15',
    text: 'text-amber-300',
    border: 'border-amber-500/30',
    desc: 'เกมเพิ่งอัปเดต กำลังปรับแต่งสคริปต์ให้ปลอดภัย'
  },
  testing: {
    label: 'Testing (กำลังทดสอบระบบ)',
    bg: 'bg-blue-500/15',
    text: 'text-blue-300',
    border: 'border-blue-500/30',
    desc: 'อยู่ในช่วงทดสอบเวอร์ชัน Beta'
  },
  patched: {
    label: 'Patched (ตรวจจับชั่วคราว)',
    bg: 'bg-red-500/15',
    text: 'text-red-400',
    border: 'border-red-500/30',
    desc: 'ห้ามใช้งานชั่วคราว รอแพตช์ใหม่'
  }
};

export const ScriptUpdateModal: React.FC<ScriptUpdateModalProps> = ({
  isOpen,
  editingUpdate,
  onClose,
  onSave
}) => {
  const [scriptName, setScriptName] = useState('');
  const [game, setGame] = useState('Roblox');
  const [version, setVersion] = useState('v1.0.0');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [status, setStatus] = useState<ScriptUpdateItem['status']>('undetected');
  const [changelogText, setChangelogText] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [scriptCode, setScriptCode] = useState('');
  const [releaseDate, setReleaseDate] = useState(new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (editingUpdate) {
      setScriptName(editingUpdate.scriptName || '');
      setGame(editingUpdate.game || 'Roblox');
      setVersion(editingUpdate.version || 'v1.0.0');
      setTitle(editingUpdate.title || '');
      setDescription(editingUpdate.description || '');
      setTagsInput(editingUpdate.tags ? editingUpdate.tags.join(', ') : '');
      setStatus(editingUpdate.status || 'undetected');
      setChangelogText(editingUpdate.changelog ? editingUpdate.changelog.join('\n') : '');
      setDownloadUrl(editingUpdate.downloadUrl || '');
      setScriptCode(editingUpdate.scriptCode || '');
      setReleaseDate(editingUpdate.releaseDate || new Date().toISOString().slice(0, 10));
    } else {
      setScriptName('Blox Fruits VIP Hub');
      setGame('Roblox');
      setVersion('v4.2.1');
      setTitle('อัปเดตระบบตรวจสอบ HWID และเพิ่มระบบ Auto Farm v2');
      setDescription('ให้รวดเร็วยิ่งขึ้น ปรับปรุงความเสถียรในการรันสคริปต์ และเพิ่มการเข้ารหัสข้อมูล SSL ชั้นสูง เพื่อความปลอดภัยสูงสุดของบัญชีผู้ใช้งาน');
      setTagsInput('Roblox, Auto Farm, SSL Encryption, HWID Bypass');
      setStatus('undetected');
      setChangelogText('อัปเดตระบบตรวจสอบ HWID ให้รวดเร็วยิ่งขึ้น ป้องกันการดักจับ\nปรับปรุงความเสถียรในการรันสคริปต์ ไม่หลุดระหว่างฟาร์ม\nเพิ่มฟังก์ชัน Auto Mirage Island & Race V4 อัตโนมัติ\nรองรับการทำงานร่วมกับ Executor ทุกเวอร์ชัน');
      setDownloadUrl('https://xecutelab.store/download/blox-fruits');
      setScriptCode('loadstring(game:HttpGet("https://raw.githubusercontent.com/XecuteLab/Hub/main/loader.lua"))()');
      setReleaseDate(new Date().toISOString().slice(0, 10));
    }
  }, [editingUpdate, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scriptName.trim() || !title.trim()) return;

    setSaving(true);
    try {
      const changelogList = changelogText
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean);

      const parsedTags = tagsInput
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      await onSave({
        scriptName: scriptName.trim(),
        game: game.trim(),
        version: version.trim(),
        title: title.trim(),
        description: description.trim() || undefined,
        tags: parsedTags.length > 0 ? parsedTags : undefined,
        status,
        changelog: changelogList,
        downloadUrl: downloadUrl.trim() || undefined,
        scriptCode: scriptCode.trim() || undefined,
        releaseDate
      }, editingUpdate ? editingUpdate.id : undefined);
      onClose();
    } catch (err: any) {
      alert('เกิดข้อผิดพลาดในการบันทึกอัปเดตสคริปต์: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const statusStyle = STATUS_CONFIG[status] || STATUS_CONFIG.undetected;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="max-w-2xl w-full rounded-2xl bg-[#0e0e14] border border-white/15 p-5 sm:p-6 shadow-2xl space-y-4 my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-xl bg-[#ff1e27]/15 border border-[#ff1e27]/30 flex items-center justify-center text-[#ff1e27]">
              <Terminal className="size-4" />
            </div>
            <div>
              <h3 className="font-heading text-base font-bold text-white">
                {editingUpdate ? 'แก้ไขข้อมูลอัปเดตสคริปต์ (Edit Script Update)' : 'เขียนบันทึกอัปเดตสคริปต์ใหม่ (New Update)'}
              </h3>
              <p className="text-[11px] text-white/50">
                ปรับแต่งข้อมูลหัวข้อ, คำอธิบาย CSS, สถานะความปลอดภัย และลิงก์ดาวน์โหลด
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="text-xs px-2.5 py-1 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              {showPreview ? 'ซ่อนพรีวิว' : 'ดูตัวอย่างการ์ด'}
            </button>
            <button 
              type="button"
              onClick={onClose} 
              className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* Live Card Preview (Matching NavSectionPage CSS exactly) */}
        {showPreview && (
          <div className="p-4 rounded-xl bg-black/60 border border-white/10 space-y-2">
            <div className="text-[11px] text-white/40 font-mono flex items-center justify-between">
              <span>ตัวอย่างการแสดงผลบนการ์ดอัปเดต (CSS Preview):</span>
              <span className="text-[#ff1e27] font-semibold">Live Preview</span>
            </div>
            <div className="rounded-2xl border border-[#ff1e27]/40 bg-gradient-to-b from-[#14141c] via-[#0d0d12] to-[#0a0a0d] p-5 shadow-xl space-y-3.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#ff1e27] px-2.5 py-0.5 rounded-md bg-[#ff1e27]/15 border border-[#ff1e27]/30">
                    {game} {version}
                  </span>
                  <span className="text-xs text-white/40 flex items-center gap-1 font-mono">
                    <Clock className="size-3 text-white/30" />
                    <span>{releaseDate || 'ล่าสุด'}</span>
                  </span>
                </div>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                  {statusStyle.label}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-[#ff1e27] font-semibold block uppercase tracking-wider font-mono">
                  {scriptName || 'ชื่อสคริปต์'}
                </span>
                <h4 className="text-base font-bold text-white font-heading mt-0.5">
                  {title || 'หัวข้อการอัปเดต'}
                </h4>
              </div>

              {description && (
                <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-white/90 leading-relaxed font-normal">
                  {description}
                </div>
              )}

              {tagsInput && (
                <div className="flex flex-wrap gap-1.5">
                  {tagsInput.split(',').map((t, idx) => (
                    <span key={idx} className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-white/5 text-white/60 border border-white/10">
                      #{t.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          
          {/* Row 1: Script Name & Game */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1">
                ชื่อสคริปต์ / หมวดหมู่ <span className="text-[#ff1e27]">*</span>
              </label>
              <input
                type="text"
                required
                value={scriptName}
                onChange={(e) => setScriptName(e.target.value)}
                placeholder="เช่น Blox Fruits VIP Hub"
                className="w-full bg-[#15151e] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:border-[#ff1e27] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1">
                เกม / แพลตฟอร์ม <span className="text-[#ff1e27]">*</span>
              </label>
              <input
                type="text"
                required
                value={game}
                onChange={(e) => setGame(e.target.value)}
                placeholder="เช่น Roblox, FiveM, Multi-Game"
                className="w-full bg-[#15151e] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:border-[#ff1e27] focus:outline-none"
              />
            </div>
          </div>

          {/* Row 2: Version & Release Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1">เวอร์ชัน (Version)</label>
              <input
                type="text"
                required
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="เช่น v4.2.1"
                className="w-full bg-[#15151e] border border-white/15 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-[#ff1e27] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1">วันที่ปล่อยแพตช์ (Release Date)</label>
              <input
                type="date"
                required
                value={releaseDate}
                onChange={(e) => setReleaseDate(e.target.value)}
                className="w-full bg-[#15151e] border border-white/15 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-[#ff1e27] focus:outline-none"
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-white/80 mb-1">
              หัวข้อการอัปเดต (Update Title) <span className="text-[#ff1e27]">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="เช่น อัปเดตระบบตรวจสอบ HWID และเพิ่มระบบ Auto Farm v2"
              className="w-full bg-[#15151e] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:border-[#ff1e27] focus:outline-none"
            />
          </div>

          {/* Description (Matches the exact CSS in the image) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-white/80">
                คำอธิบาย / รายละเอียดสรุป (CSS Banner Text)
              </label>
              <span className="text-[11px] text-[#ff1e27] font-medium">เข้าคู่กับ CSS ในหน้าร้าน</span>
            </div>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="เช่น ให้รวดเร็วยิ่งขึ้น ปรับปรุงความเสถียรในการรันสคริปต์ และเพิ่มการเข้ารหัสข้อมูล SSL ชั้นสูง"
              className="w-full bg-[#15151e] border border-white/15 rounded-xl p-2.5 text-xs text-white focus:border-[#ff1e27] focus:outline-none resize-none leading-relaxed"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-white/80 mb-1">
              แท็กคีย์เวิร์ด (Tags — คั่นด้วยจุลภาค , )
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="เช่น Roblox, Auto Farm, SSL Encryption, HWID Bypass"
              className="w-full bg-[#15151e] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:border-[#ff1e27] focus:outline-none"
            />
          </div>

          {/* Status Selector with Color Indicators */}
          <div>
            <label className="block text-xs font-semibold text-white/80 mb-1">
              สถานะความปลอดภัยของแพตช์ (Safety Status)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['undetected', 'updating', 'testing', 'patched'] as const).map((s) => {
                const cfg = STATUS_CONFIG[s];
                const isSelected = status === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s)}
                    className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? `${cfg.bg} ${cfg.border} ring-1 ring-white/20`
                        : 'bg-[#15151e] border-white/10 text-white/60 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className={`size-2 rounded-full ${isSelected ? cfg.text.replace('text-', 'bg-') : 'bg-white/30'}`} />
                      <span className={`text-[11px] font-bold truncate ${isSelected ? cfg.text : 'text-white/80'}`}>
                        {cfg.label.split(' ')[0]}
                      </span>
                    </div>
                    <span className="text-[10px] text-white/40 mt-1 line-clamp-1">
                      {cfg.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Changelog Text */}
          <div>
            <label className="block text-xs font-semibold text-white/80 mb-1">
              รายการเปลี่ยนแปลง (Changelog — บรรทัดละ 1 ข้อ)
            </label>
            <textarea
              rows={3}
              value={changelogText}
              onChange={(e) => setChangelogText(e.target.value)}
              placeholder={"+ อัปเดตระบบตรวจสอบ HWID ให้รวดเร็วยิ่งขึ้น\n+ ปรับปรุงความเสถียรในการรันสคริปต์\n- ลบโค้ดส่วนที่ไม่เสถียรออก"}
              className="w-full bg-[#15151e] border border-white/15 rounded-xl p-2.5 text-xs text-white focus:border-[#ff1e27] focus:outline-none resize-none font-mono"
            />
          </div>

          {/* Script Code (Loadstring) & Download URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1">
                โค้ดสคริปต์ / Loadstring (สำหรับปุ่มคัดลอก)
              </label>
              <input
                type="text"
                value={scriptCode}
                onChange={(e) => setScriptCode(e.target.value)}
                placeholder='loadstring(game:HttpGet("..."))()'
                className="w-full bg-[#15151e] border border-white/15 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-[#ff1e27] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1">
                ลิงก์ดาวน์โหลดสคริปต์ (Download Link)
              </label>
              <input
                type="url"
                value={downloadUrl}
                onChange={(e) => setDownloadUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-[#15151e] border border-white/15 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-[#ff1e27] focus:outline-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-white/10">
            <span className="text-[11px] text-white/40">
              * ข้อมูลจะซิงค์แบบ Realtime ไปยังหน้าร้านค้าทันที
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs text-white/60 hover:text-white cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn-primary px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-lg shadow-[#ff1e27]/25"
              >
                <Check className="size-3.5" />
                <span>{saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูลอัปเดต'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
