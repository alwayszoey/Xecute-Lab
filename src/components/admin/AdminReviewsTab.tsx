import React, { useState, useEffect } from 'react';
import { MessageSquare, Star, Trash2, CheckCircle2, EyeOff, Loader2 } from 'lucide-react';
import { ReviewItem, listenReviews, updateReviewStatus, deleteReview } from '../../lib/store.ts';

interface AdminReviewsTabProps {
  onShowToast: (msg: string) => void;
}

export const AdminReviewsTab: React.FC<AdminReviewsTabProps> = ({ onShowToast }) => {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);

  useEffect(() => {
    const unsub = listenReviews(setReviews);
    return () => unsub();
  }, []);

  const handleToggleStatus = async (review: ReviewItem) => {
    const newStatus = review.status === 'approved' ? 'hidden' : 'approved';
    await updateReviewStatus(review.id, newStatus);
    onShowToast(newStatus === 'approved' ? 'แสดงรีวิวนี้ที่หน้าร้านแล้ว' : 'ซ่อนรีวิวนี้แล้ว');
  };

  const handleDelete = async (id: string) => {
    if (confirm('คุณต้องการลบรีวิวนี้ใช่หรือไม่?')) {
      await deleteReview(id);
      onShowToast('ลบรีวิวแล้ว');
    }
  };

  return (
    <div className="space-y-6 text-left animate-fade-in">
      <div className="bg-[#09090b] border border-white/10 p-5 rounded-2xl">
        <h3 className="font-heading text-xl font-bold text-white flex items-center gap-2">
          <MessageSquare className="size-5 text-[#ff1e27]" />
          <span>จัดการรีวิวสินค้า (Product Reviews Moderation)</span>
        </h3>
        <p className="text-xs text-white/50 mt-1">
          ตรวจสอบความคิดเห็น คะแนนรีวิว 5 ดาว และควบคุมการแสดงผลรีวิวที่หน้าร้าน
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#09090b] p-5 shadow-xl space-y-3">
        <h4 className="text-sm font-bold text-white">รีวิวทั้งหมด ({reviews.length})</h4>

        {reviews.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <Star className="size-8 text-amber-400/40 mx-auto" />
            <p className="text-xs text-white/40">ยังไม่มีรีวิวจากลูกค้า</p>
          </div>
        ) : (
          reviews.map(r => (
            <div key={r.id} className="p-4 rounded-xl border border-white/10 bg-white/[0.02] flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white">{r.userName || r.userEmail}</span>
                  <div className="flex items-center text-amber-400">
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Star key={i} className="size-3.5 fill-current" />
                    ))}
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    r.status === 'approved' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-white/50'
                  }`}>
                    {r.status}
                  </span>
                </div>
                <p className="text-xs text-white/80">"{r.comment}"</p>
                <span className="text-[11px] text-white/40">สินค้า: {r.productName}</span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleToggleStatus(r)}
                  className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-semibold text-white/80"
                >
                  {r.status === 'approved' ? 'ซ่อน' : 'อนุมัติ'}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(r.id)}
                  className="size-8 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white flex items-center justify-center transition-colors"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
