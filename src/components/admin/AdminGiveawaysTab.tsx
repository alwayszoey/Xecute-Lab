import React, { useState, useEffect } from 'react';
import { Gift, Plus, Trash2, CheckCircle2, Sparkles, Clock, Loader2 } from 'lucide-react';
import { GiveawayItem, listenGiveaways, saveGiveaway, deleteGiveaway } from '../../lib/store.ts';

interface AdminGiveawaysTabProps {
  onShowToast: (msg: string) => void;
}

export const AdminGiveawaysTab: React.FC<AdminGiveawaysTabProps> = ({ onShowToast }) => {
  const [giveaways, setGiveaways] = useState<GiveawayItem[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [itemType, setItemType] = useState<GiveawayItem['itemType']>('key');
  const [rewardValue, setRewardValue] = useState('');
  const [totalCount, setTotalCount] = useState('10');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    const unsub = listenGiveaways(setGiveaways);
    return () => unsub();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !rewardValue.trim()) return;
    setIsSubmitting(true);
    try {
      await saveGiveaway({
        title: title.trim(),
        description: description.trim(),
        itemType,
        rewardValue: rewardValue.trim(),
        totalCount: Number(totalCount) || 10,
        remainingCount: Number(totalCount) || 10,
        status: 'active'
      });
      setTitle('');
      setDescription('');
      setRewardValue('');
      setShowAddForm(false);
      onShowToast('สร้างกิจกรรมแจกฟรีเรียบร้อยแล้ว');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('คุณต้องการลบกิจกรรมแจกฟรีนี้ใช่หรือไม่?')) {
      await deleteGiveaway(id);
      onShowToast('ลบกิจกรรมแจกฟรีแล้ว');
    }
  };

  return (
    <div className="space-y-6 text-left animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#09090b] border border-white/10 p-5 rounded-2xl">
        <div>
          <h3 className="font-heading text-xl font-bold text-white flex items-center gap-2">
            <Gift className="size-5 text-[#ff1e27]" />
            <span>ระบบแจกฟรี (Free Giveaway System)</span>
          </h3>
          <p className="text-xs text-white/50 mt-1">
            สร้างและจัดการสิทธิประโยชน์ โค้ดฟรี หรือคีย์ฟรีสำหรับสมาชิกหน้าร้าน
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2.5 rounded-xl bg-[#ff1e27] hover:bg-[#e0141c] text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-[#ff1e27]/25 cursor-pointer transition-all"
        >
          <Plus className="size-4" />
          <span>{showAddForm ? 'ปิดแบบฟอร์ม' : 'สร้างกิจกรรมแจกฟรีใหม่'}</span>
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleCreate} className="p-5 rounded-2xl bg-[#09090b] border border-[#ff1e27]/30 shadow-xl space-y-4">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="size-4 text-[#ff1e27]" />
            <span>รายละเอียดกิจกรรมแจกฟรี</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/80">ชื่อกิจกรรม *</label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="เช่น แจก VIP Key 30 วัน ประจำสัปดาห์"
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-xs text-white focus:outline-none focus:border-[#ff1e27]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/80">ประเภทของรางวัล</label>
              <select
                value={itemType}
                onChange={e => setItemType(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-xs text-white focus:outline-none focus:border-[#ff1e27]"
              >
                <option value="key">License Key (คีย์)</option>
                <option value="code">โค้ดส่วนลด / โค้ดเติมเงิน</option>
                <option value="script">สคริปต์ VIP</option>
                <option value="balance">เครดิตเงินสด</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/80">รางวัล / ลิงก์ / คีย์แจก *</label>
              <input
                type="text"
                required
                value={rewardValue}
                onChange={e => setRewardValue(e.target.value)}
                placeholder="เช่น XECUTE-FREE-GIVEAWAY-2026 หรือ ลิงก์ดาวน์โหลด"
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-xs text-white focus:outline-none focus:border-[#ff1e27]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/80">จำนวนสิทธิ์ทั้งหมด</label>
              <input
                type="number"
                value={totalCount}
                onChange={e => setTotalCount(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-xs text-white focus:outline-none focus:border-[#ff1e27]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-white/80">เงื่อนไข / คำอธิบายเพิ่มเติม</label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="เช่น สำหรับสมาชิกที่ออนไลน์ประจำวัน..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-xs text-white focus:outline-none focus:border-[#ff1e27] resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 rounded-xl text-xs text-white/60 bg-white/5 cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl btn-primary text-white text-xs font-bold cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'กำลังบันทึก...' : 'เปิดกิจกรรมแจกฟรี'}
            </button>
          </div>
        </form>
      )}

      {/* Giveaways List */}
      <div className="rounded-2xl border border-white/10 bg-[#09090b] p-4 sm:p-6 shadow-xl space-y-3">
        <h4 className="text-sm font-bold text-white mb-2">รายการกิจกรรมแจกฟรีที่เปิดอยู่</h4>

        {giveaways.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <Gift className="size-8 text-white/20 mx-auto" />
            <p className="text-xs text-white/40">ยังไม่มีรายการแจกฟรีในขณะนี้</p>
          </div>
        ) : (
          giveaways.map(g => (
            <div key={g.id} className="p-4 rounded-xl border border-white/10 bg-white/[0.02] flex items-center justify-between gap-4">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white">{g.title}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#ff1e27]/20 text-[#ff1e27] border border-[#ff1e27]/40 font-mono">
                    {g.itemType}
                  </span>
                </div>
                <p className="text-xs text-white/50">{g.description || 'ไม่มีคำอธิบาย'}</p>
                <div className="text-xs text-white/60 font-mono">
                  โค้ด/รางวัล: <span className="text-emerald-400 font-bold">{g.rewardValue}</span> • คงเหลือ: {g.remainingCount}/{g.totalCount} สิทธิ์
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleDelete(g.id)}
                className="size-8 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
