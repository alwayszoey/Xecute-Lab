import React, { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, CheckCircle2, Ticket, Percent } from 'lucide-react';
import { PromoCodeItem, listenPromoCodes, savePromoCode, deletePromoCode } from '../../lib/store.ts';

interface AdminPromoCodesTabProps {
  onShowToast: (msg: string) => void;
}

export const AdminPromoCodesTab: React.FC<AdminPromoCodesTabProps> = ({ onShowToast }) => {
  const [codes, setCodes] = useState<PromoCodeItem[]>([]);
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<PromoCodeItem['discountType']>('percentage');
  const [discountValue, setDiscountValue] = useState('10');
  const [usageLimit, setUsageLimit] = useState('50');
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    const unsub = listenPromoCodes(setCodes);
    return () => unsub();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    await savePromoCode({
      code: code.trim().toUpperCase(),
      discountType,
      discountValue: Number(discountValue) || 10,
      usageLimit: Number(usageLimit) || 50,
      status: 'active'
    });
    setCode('');
    setShowAddForm(false);
    onShowToast('สร้างโค้ดส่วนลดเรียบร้อยแล้ว');
  };

  const handleDelete = async (id: string) => {
    if (confirm('คุณต้องการลบโค้ดนี้ใช่หรือไม่?')) {
      await deletePromoCode(id);
      onShowToast('ลบโค้ดส่วนลดแล้ว');
    }
  };

  return (
    <div className="space-y-6 text-left animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#09090b] border border-white/10 p-5 rounded-2xl">
        <div>
          <h3 className="font-heading text-xl font-bold text-white flex items-center gap-2">
            <Ticket className="size-5 text-[#ff1e27]" />
            <span>จัดการโค้ดส่วนลดและโปรโมชั่น (Promo Codes Manager)</span>
          </h3>
          <p className="text-xs text-white/50 mt-1">
            สร้างคูปองลดราคา กำหนดเปอร์เซ็นต์หรือยอดเงินคงที่ พร้อมจำกัดจำนวนครั้งการใช้งาน
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2.5 rounded-xl bg-[#ff1e27] hover:bg-[#e0141c] text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-[#ff1e27]/25 cursor-pointer"
        >
          <Plus className="size-4" />
          <span>{showAddForm ? 'ปิดฟอร์ม' : 'เพิ่มโค้ดใหม่'}</span>
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleCreate} className="p-5 rounded-2xl bg-[#09090b] border border-[#ff1e27]/30 shadow-xl space-y-4">
          <h4 className="text-sm font-bold text-white">สร้างโค้ดโปรโมชั่น</h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/80">รหัสโค้ด (Code) *</label>
              <input
                type="text"
                required
                value={code}
                onChange={e => setCode(e.target.value)}
                placeholder="เช่น XECUTE2026"
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-xs text-white font-mono uppercase focus:outline-none focus:border-[#ff1e27]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/80">ประเภทส่วนลด</label>
              <select
                value={discountType}
                onChange={e => setDiscountType(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-xs text-white focus:outline-none focus:border-[#ff1e27]"
              >
                <option value="percentage">คิดเป็นเปอร์เซ็นต์ (%)</option>
                <option value="fixed_amount">จำนวนเงินคงที่ (บาท)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/80">มูลค่าส่วนลด</label>
              <input
                type="number"
                value={discountValue}
                onChange={e => setDiscountValue(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-xs text-white focus:outline-none focus:border-[#ff1e27]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 rounded-xl text-xs text-white/60 bg-white/5"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#ff1e27] hover:bg-[#e0141c] text-white text-xs font-bold shadow-md shadow-[#ff1e27]/25"
            >
              สร้างโค้ด
            </button>
          </div>
        </form>
      )}

      <div className="rounded-2xl border border-white/10 bg-[#09090b] p-5 shadow-xl space-y-3">
        <h4 className="text-sm font-bold text-white">โค้ดที่ใช้งานได้ทั้งหมด ({codes.length})</h4>

        {codes.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <Ticket className="size-8 text-white/20 mx-auto" />
            <p className="text-xs text-white/40">ยังไม่มีโค้ดโปรโมชั่นในระบบ</p>
          </div>
        ) : (
          codes.map(c => (
            <div key={c.id} className="p-4 rounded-xl border border-white/10 bg-white/[0.02] flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm text-[#ff1e27] bg-[#ff1e27]/10 px-2.5 py-0.5 rounded border border-[#ff1e27]/30">
                    {c.code}
                  </span>
                  <span className="text-xs text-emerald-400 font-bold">
                    ลด {c.discountValue}{c.discountType === 'percentage' ? '%' : ' บาท'}
                  </span>
                </div>
                <span className="text-xs text-white/50 block">
                  ใช้งานแล้ว: {c.usedCount} ครั้ง (จำกัดสูงสุด {c.usageLimit} ครั้ง)
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleDelete(c.id)}
                className="size-8 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white flex items-center justify-center transition-colors"
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
