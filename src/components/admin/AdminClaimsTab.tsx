import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle2, XCircle, Clock, ShieldCheck, Loader2 } from 'lucide-react';
import { ClaimItem, listenClaims, updateClaimStatus } from '../../lib/store.ts';

interface AdminClaimsTabProps {
  onShowToast: (msg: string) => void;
}

export const AdminClaimsTab: React.FC<AdminClaimsTabProps> = ({ onShowToast }) => {
  const [claims, setClaims] = useState<ClaimItem[]>([]);
  const [selectedClaim, setSelectedClaim] = useState<ClaimItem | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const unsub = listenClaims(setClaims);
    return () => unsub();
  }, []);

  const handleDecision = async (status: 'approved' | 'rejected') => {
    if (!selectedClaim) return;
    setProcessing(true);
    try {
      await updateClaimStatus(selectedClaim.id, status, adminNote);
      onShowToast(status === 'approved' ? 'อนุมัติการเคลมและออกคีย์ทดแทนแล้ว' : 'ปฏิเสธคำขอเคลมเรียบร้อย');
      setSelectedClaim(null);
      setAdminNote('');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6 text-left animate-fade-in">
      <div className="bg-[#09090b] border border-white/10 p-5 rounded-2xl">
        <h3 className="font-heading text-xl font-bold text-white flex items-center gap-2">
          <AlertTriangle className="size-5 text-[#ff1e27]" />
          <span>จัดการคำขอเคลมสินค้าและประกัน (Warranty & Claims)</span>
        </h3>
        <p className="text-xs text-white/50 mt-1">
          ตรวจสอบปัญหาคีย์ใช้งานไม่ได้ คีย์ซ้ำ หรือคำร้องขอเคลมประกันจากลูกค้าหน้าร้าน
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#09090b] p-5 shadow-xl space-y-3">
        <h4 className="text-sm font-bold text-white">รายการคำขอเคลม ({claims.length})</h4>

        {claims.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <ShieldCheck className="size-8 text-emerald-400/40 mx-auto" />
            <p className="text-xs text-white/40">ขณะนี้ไม่มีรายการแจ้งเคลมสินค้าคงค้าง</p>
          </div>
        ) : (
          claims.map((c) => (
            <div key={c.id} className="p-4 rounded-xl border border-white/10 bg-white/[0.02] flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white">{c.productName}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    c.status === 'approved' ? 'bg-emerald-500/20 text-emerald-300' : c.status === 'rejected' ? 'bg-red-500/20 text-red-300' : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {c.status}
                  </span>
                </div>
                <p className="text-xs text-white/70">เหตุผล: {c.reason}</p>
                <span className="text-[11px] text-white/40 block">ผู้ส่ง: {c.userEmail}</span>
              </div>

              {c.status === 'pending' && (
                <button
                  type="button"
                  onClick={() => setSelectedClaim(c)}
                  className="btn-primary px-3 py-1.5 rounded-lg text-white text-xs font-bold cursor-pointer"
                >
                  พิจารณา
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {selectedClaim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="max-w-md w-full rounded-2xl bg-[#0e0e14] border border-white/15 p-6 shadow-2xl space-y-4">
            <h4 className="font-heading text-base font-bold text-white">พิจารณาคำขอเคลม: {selectedClaim.productName}</h4>
            <p className="text-xs text-white/70 bg-white/5 p-3 rounded-xl border border-white/10">{selectedClaim.reason}</p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/80">หมายเหตุถึงลูกค้า</label>
              <textarea
                rows={2}
                value={adminNote}
                onChange={e => setAdminNote(e.target.value)}
                placeholder="ระบุข้อความตอบกลับหรือ License Key ทดแทน..."
                className="w-full p-2.5 rounded-xl bg-black/60 border border-white/15 text-xs text-white focus:outline-none focus:border-[#ff1e27]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedClaim(null)}
                className="px-4 py-2 rounded-xl text-xs text-white/60 bg-white/5"
              >
                ปิด
              </button>
              <button
                type="button"
                disabled={processing}
                onClick={() => handleDecision('rejected')}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold"
              >
                ปฏิเสธคำขอ
              </button>
              <button
                type="button"
                disabled={processing}
                onClick={() => handleDecision('approved')}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
              >
                อนุมัติเคลม
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
