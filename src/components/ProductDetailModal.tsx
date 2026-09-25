import React, { useState } from 'react';
import { X, ShoppingBag, CheckCircle2, ShieldCheck, Key, Download, Loader2, Edit3, Trash2, Check, FileText, ExternalLink } from 'lucide-react';
import { ProductItem, createOrder } from '../lib/store.ts';
import { type FirebaseUser } from '../lib/firebase.ts';

interface ProductDetailModalProps {
  product: ProductItem | null;
  currentUser: FirebaseUser | null;
  isOwner?: boolean;
  onClose: () => void;
  onRequireLogin: () => void;
  onOpenPurchase?: (product: ProductItem) => void;
  onEdit?: (product: ProductItem) => void;
  onDelete?: (id: string, name: string) => Promise<void>;
}

export function ProductDetailModal({
  product,
  currentUser,
  isOwner = false,
  onClose,
  onRequireLogin,
  onOpenPurchase,
  onEdit,
  onDelete
}: ProductDetailModalProps) {
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState<string | null>(null);

  if (!product) return null;

  const discountPercent = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  const handleBuy = async () => {
    if (onOpenPurchase) {
      onClose();
      onOpenPurchase(product);
      return;
    }

    if (!currentUser) {
      onClose();
      onRequireLogin();
      return;
    }

    setPurchasing(true);
    try {
      const generatedKey = 'KEY-' + Math.random().toString(36).substring(2, 10).toUpperCase() + '-' + Date.now().toString().slice(-4);
      
      await createOrder({
        userId: currentUser.uid,
        userEmail: currentUser.email || 'guest@member.com',
        productId: product.id,
        productName: product.name,
        amount: product.price,
        status: 'completed',
        keyIssued: generatedKey
      });

      setPurchaseSuccess(generatedKey);
    } catch (err: any) {
      alert('เกิดข้อผิดพลาดในการสั่งซื้อ: ' + err.message);
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="max-w-xl w-full rounded-2xl bg-[#0c0c0c] border border-white/15 p-6 sm:p-7 shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <ShoppingBag className="size-5 text-[#ff1e27]" />
            <span className="font-heading text-base font-bold text-white">รายละเอียดสินค้า</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/10 cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Product Image & Badges */}
        <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden border border-white/10 bg-neutral-900">
          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
          {product.badge && (
            <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded text-[11px] font-bold bg-[#ff1e27] text-white shadow-md">
              {product.badge}
            </span>
          )}
          {discountPercent && (
            <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-500 text-black shadow-md">
              -{discountPercent}%
            </span>
          )}
        </div>

        {/* Product Title & Price */}
        <div className="space-y-1.5">
          <span className="text-xs text-[#ff1e27] font-semibold">{product.categoryName || 'หมวดหมู่ทั่วไป'}</span>
          <h2 className="font-heading text-lg sm:text-xl font-bold text-white leading-tight">
            {product.name}
          </h2>
          
          <div className="flex items-baseline gap-2.5 pt-1">
            <span className="font-heading text-2xl font-bold text-white font-mono">
              {product.price.toLocaleString()} <span className="text-base font-sans text-white/60">บาท</span>
            </span>
            {product.originalPrice && (
              <span className="text-sm text-white/40 line-through font-mono">
                {product.originalPrice.toLocaleString()} บาท
              </span>
            )}
            <span className="text-xs text-white/50 ml-auto font-mono">
              เหลือ <strong className={(product.stock ?? 0) > 0 ? "text-white/80" : "text-red-400"}>{product.stock ?? 0} ชิ้น</strong>
            </span>
          </div>
        </div>

        {/* Description */}
        <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
          <span className="text-xs font-semibold text-white/60 block">รายละเอียด & ฟีเจอร์:</span>
          <p className="text-xs sm:text-sm text-white/80 leading-relaxed whitespace-pre-line">
            {product.description || 'ไม่มีคำอธิบายเพิ่มเติม'}
          </p>
        </div>

        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {product.tags.map((t, idx) => (
              <span key={idx} className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-white/5 border border-white/10 text-white/70 inline-flex items-center gap-1">
                <Check className="size-3 text-emerald-400 shrink-0" />
                <span>{t}</span>
              </span>
            ))}
          </div>
        )}

        {/* Success Key Delivery Banner */}
        {purchaseSuccess ? (
          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-left space-y-2 animate-fade-in">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
              <CheckCircle2 className="size-4" />
              <span>การสั่งซื้อสำเร็จ! คีย์ของคุณพร้อมใช้งานแล้ว:</span>
            </div>
            <div className="p-2.5 rounded-lg bg-black border border-white/15 font-mono text-xs text-white select-all flex items-center justify-between">
              <span>{purchaseSuccess}</span>
              <span className="text-[10px] text-emerald-400">บันทึกลงระบบแล้ว</span>
            </div>
            {(product.downloadContent || product.downloadUrl) && (
              <div className="pt-2 text-xs text-white/90 space-y-1.5">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <FileText className="size-3.5 text-emerald-400" />
                  <span>ข้อมูลดาวน์โหลด / รายละเอียดการรับสินค้า:</span>
                </span>
                {(product.downloadContent || product.downloadUrl)?.startsWith('http') ? (
                  <a
                    href={product.downloadContent || product.downloadUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-primary h-9 px-3 rounded-lg text-xs flex items-center gap-1.5 w-full justify-center"
                  >
                    <Download className="size-3.5" />
                    <span>เปิดลิงก์ดาวน์โหลด</span>
                    <ExternalLink className="size-3" />
                  </a>
                ) : (
                  <div className="p-3 rounded-xl bg-black/80 border border-white/15 font-mono text-xs whitespace-pre-wrap break-all select-all text-emerald-300 max-h-48 overflow-y-auto">
                    {product.downloadContent || product.downloadUrl}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="pt-2 space-y-3">
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="btn-secondary h-11 px-5 rounded-xl text-xs sm:text-sm cursor-pointer"
              >
                ปิดหน้าต่าง
              </button>
              <button
                disabled={purchasing || product.stock <= 0}
                onClick={handleBuy}
                className="btn-primary flex-1 h-11 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#ff1e27]/25 disabled:opacity-50"
              >
                {purchasing ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>กำลังทำรายการสั่งซื้อ...</span>
                  </>
                ) : product.stock <= 0 ? (
                  <span>สินค้าหมดชั่วคราว</span>
                ) : (
                  <>
                    <ShieldCheck className="size-4" />
                    <span>สั่งซื้อทันที (฿{product.price.toLocaleString()})</span>
                  </>
                )}
              </button>
            </div>

            {/* Admin Toolbar in Detail Modal */}
            {isOwner && (
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-2">
                <span className="text-xs text-white/50 font-mono">
                  Admin Tools:
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      if (onEdit) onEdit(product);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#ff1e27]/20 border border-[#ff1e27]/30 text-[#ff1e27] hover:bg-[#ff1e27] hover:text-white transition-colors text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit3 className="size-3.5" />
                    <span>แก้ไขสินค้านี้</span>
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (confirm(`คุณต้องการลบสินค้า "${product.name}" ใช่หรือไม่?`)) {
                        onClose();
                        if (onDelete) await onDelete(product.id, product.name);
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-red-500/20 text-white/70 hover:text-red-400 transition-colors text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="size-3.5" />
                    <span>ลบสินค้า</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
