import React, { useState } from 'react';
import { 
  Terminal, 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  Sparkles, 
  ExternalLink,
  Code2,
  RefreshCw,
  Copy,
  Download,
  Tag
} from 'lucide-react';
import { ScriptUpdateItem, DEFAULT_SCRIPT_UPDATES } from '../../lib/store.ts';
import { ScriptUpdateModal } from './ScriptUpdateModal.tsx';

interface AdminScriptUpdatesTabProps {
  updates: ScriptUpdateItem[];
  onSaveUpdate: (update: Partial<ScriptUpdateItem>, id?: string) => Promise<void>;
  onDeleteUpdate: (id: string, title: string) => Promise<void>;
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

export const AdminScriptUpdatesTab: React.FC<AdminScriptUpdatesTabProps> = ({
  updates,
  onSaveUpdate,
  onDeleteUpdate
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUpdate, setEditingUpdate] = useState<ScriptUpdateItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const openAddModal = () => {
    setEditingUpdate(null);
    setModalOpen(true);
  };

  const openEditModal = (item: ScriptUpdateItem) => {
    setEditingUpdate(item);
    setModalOpen(true);
  };

  const handleSeedDefaultUpdates = async () => {
    for (const u of DEFAULT_SCRIPT_UPDATES) {
      await onSaveUpdate(u);
    }
  };

  const handleQuickStatusChange = async (item: ScriptUpdateItem, newStatus: ScriptUpdateItem['status']) => {
    await onSaveUpdate({ status: newStatus }, item.id);
  };

  const handleCopyScript = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#0f0f13] border border-white/10 p-5 rounded-2xl">
        <div>
          <h3 className="font-heading text-lg font-bold text-white flex items-center gap-2">
            <Terminal className="size-5 text-[#ff1e27]" />
            <span>จัดการอัปเดตสคริปต์ & Patch Notes (Script Updates Manager)</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#ff1e27]/15 border border-[#ff1e27]/30 text-white font-mono">
              {updates.length} รายการ
            </span>
          </h3>
          <p className="text-xs text-white/50 mt-1">
            ปรับแต่งรูปแบบ CSS ข้อความอัปเดต, คำอธิบาย, แท็ก และสถานะความปลอดภัยให้เข้าคู่กับหน้าร้าน
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSeedDefaultUpdates}
            className="px-3.5 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-semibold text-white/80 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
            title="รีเซ็ตหรือโหลดตัวอย่างอัปเดตสคริปต์เริ่มต้น"
          >
            <RefreshCw className="size-3.5 text-[#ff1e27]" />
            <span>โหลดตัวอย่างอัปเดต (Seed)</span>
          </button>

          <button
            onClick={openAddModal}
            className="btn-primary h-10 px-5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg shadow-[#ff1e27]/20 cursor-pointer"
          >
            <Plus className="size-4" />
            <span>+ เขียนอัปเดตใหม่</span>
          </button>
        </div>
      </div>

      {/* Updates List - Matching Front-end CSS Cards */}
      {updates.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/15 bg-[#0a0a0e] p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-4 shadow-xl">
          <div className="size-14 rounded-2xl bg-[#ff1e27]/10 border border-[#ff1e27]/25 flex items-center justify-center text-[#ff1e27]">
            <Terminal className="size-7" />
          </div>
          <div className="max-w-md space-y-1">
            <h4 className="font-heading text-lg font-bold text-white">
              ยังไม่มีบันทึกอัปเดตสคริปต์ในระบบ
            </h4>
            <p className="text-xs text-white/50 leading-relaxed">
              คุณสามารถเขียนแจ้งเตือนการอัปเดตแพตช์เวอร์ชันใหม่ เช่น ปรับแก้บายพาส เพิ่มฟังก์ชัน หรือแจ้งสถานะความปลอดภัยได้ทันที
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={openAddModal}
              className="btn-primary h-10 px-6 rounded-xl text-xs font-bold inline-flex items-center gap-2 cursor-pointer shadow-lg shadow-[#ff1e27]/25"
            >
              <Plus className="size-4" />
              <span>เขียนอัปเดตสคริปต์แรก</span>
            </button>
            <button
              onClick={handleSeedDefaultUpdates}
              className="px-4 py-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-semibold text-white/80 hover:text-white transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="size-3.5 text-[#ff1e27]" />
              <span>โหลดตัวอย่างอัปเดต</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {updates.map((item) => {
            const statusStyle = STATUS_CONFIG[item.status] || STATUS_CONFIG.undetected;
            return (
              <div
                key={item.id}
                className="group relative rounded-2xl border border-white/10 bg-gradient-to-b from-[#121217] via-[#0d0d12] to-[#09090c] hover:border-[#ff1e27]/40 transition-all duration-300 p-5 sm:p-6 flex flex-col justify-between space-y-4 shadow-xl overflow-hidden"
              >
                {/* Top Subtle Red Accent Line */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#ff1e27]/60 to-transparent" />

                <div className="space-y-3.5">
                  {/* Top Bar: Game, Version, Date & Status */}
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-[#ff1e27] px-2.5 py-0.5 rounded-md bg-[#ff1e27]/15 border border-[#ff1e27]/30">
                        {item.game} {item.version}
                      </span>
                      <span className="text-xs text-white/40 flex items-center gap-1 font-mono">
                        <Clock className="size-3 text-white/30" />
                        <span>{item.releaseDate || 'ล่าสุด'}</span>
                      </span>
                    </div>

                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                      {statusStyle.label}
                    </span>
                  </div>

                  {/* Title & Script Name */}
                  <div>
                    <span className="text-[11px] text-[#ff1e27] font-semibold block uppercase tracking-wider font-mono">
                      {item.scriptName}
                    </span>
                    <h4 className="font-heading text-base sm:text-lg font-bold text-white mt-0.5 leading-snug group-hover:text-white">
                      {item.title}
                    </h4>
                  </div>

                  {/* Description Box (CSS Styled) */}
                  {item.description && (
                    <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 text-xs text-white/90 leading-relaxed font-normal">
                      {item.description}
                    </div>
                  )}

                  {/* Tags */}
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {item.tags.map((tag, tIdx) => (
                        <span key={tIdx} className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-white/5 text-white/60 border border-white/10 flex items-center gap-1">
                          <Tag className="size-2.5 text-[#ff1e27]" />
                          <span>{tag}</span>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Changelog Bullets */}
                  {item.changelog && item.changelog.length > 0 && (
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
                      <span className="text-[10px] font-mono text-white/40 uppercase block mb-1">
                        รายละเอียดการเปลี่ยนแปลง (Changelog):
                      </span>
                      {item.changelog.map((line, idx) => (
                        <div key={idx} className="text-xs text-white/80 flex items-start gap-2">
                          <span className="text-[#ff1e27] font-bold">•</span>
                          <span className="leading-relaxed">{line}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Script Code & Download Preview */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {item.scriptCode && (
                      <button
                        type="button"
                        onClick={() => handleCopyScript(item.id, item.scriptCode!)}
                        className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-xs text-white/80 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer font-mono"
                      >
                        <Copy className="size-3 text-[#ff1e27]" />
                        <span>{copiedId === item.id ? 'คัดลอกสคริปต์แล้ว!' : 'คัดลอกโค้ดสคริปต์'}</span>
                      </button>
                    )}

                    {item.downloadUrl && (
                      <a
                        href={item.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-[#ff1e27]/15 hover:bg-[#ff1e27]/25 text-[#ff1e27] border border-[#ff1e27]/30 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                      >
                        <Download className="size-3" />
                        <span>ดาวน์โหลดเวอร์ชัน {item.version}</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Footer Toolbar: Quick Status Changer & Edit/Delete */}
                <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  {/* Quick Status Buttons */}
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-white/40 mr-1">สถานะ:</span>
                    {(['undetected', 'updating', 'patched'] as const).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => handleQuickStatusChange(item, st)}
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all cursor-pointer ${
                          item.status === st 
                            ? 'bg-white/20 text-white border border-white/30' 
                            : 'bg-white/5 text-white/50 hover:text-white hover:bg-white/10 border border-white/5'
                        }`}
                      >
                        {st === 'undetected' ? 'Undetected' : st === 'updating' ? 'Updating' : 'Patched'}
                      </button>
                    ))}
                  </div>

                  {/* Edit & Delete Action Buttons */}
                  <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => openEditModal(item)}
                      className="px-3 py-1.5 rounded-xl bg-[#ff1e27]/15 text-[#ff1e27] hover:bg-[#ff1e27] hover:text-white transition-colors text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="size-3.5" />
                      <span>แก้ไข</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteUpdate(item.id, item.title)}
                      className="p-1.5 rounded-xl text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                      title="ลบอัปเดตนี้"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Script Update Modal */}
      <ScriptUpdateModal
        isOpen={modalOpen}
        editingUpdate={editingUpdate}
        onClose={() => setModalOpen(false)}
        onSave={onSaveUpdate}
      />

    </div>
  );
};
