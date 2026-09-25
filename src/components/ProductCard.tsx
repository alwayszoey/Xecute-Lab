import React from 'react';
import { Edit3, Trash2, Sparkles, Crown, Waves, Wrench, ShieldCheck } from 'lucide-react';
import { ProductItem } from '../lib/store.ts';

interface ProductCardProps {
  product: ProductItem;
  isOwner?: boolean;
  onSelect?: (product: ProductItem) => void;
  onPurchase?: (product: ProductItem) => void;
  onEdit?: (product: ProductItem) => void;
  onDelete?: (id: string, name: string) => Promise<void> | void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isOwner = false,
  onSelect,
  onPurchase,
  onEdit,
  onDelete
}) => {
  const isOutOfStock = (product.stock ?? 0) <= 0 || product.status === 'out_of_stock';
  const isUnderMaintenance = Boolean(product.isUnderMaintenance);
  
  // Calculate effective discount percent
  const discountVal = product.discountPercent && product.discountPercent > 0
    ? product.discountPercent
    : (product.originalPrice && product.originalPrice > product.price
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : null);

  // Card effects styles
  let effectCardClass = 'border-white/10 bg-[#0f0f12] hover:border-[#ff1e27]/50 hover:shadow-[0_0_25px_rgba(255,30,39,0.18)]';
  if (product.effect === 'aurora') {
    effectCardClass = 'border-cyan-500/40 bg-gradient-to-b from-[#0e161c] to-[#0f0f12] hover:border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.15)]';
  } else if (product.effect === 'gold') {
    effectCardClass = 'border-amber-500/40 bg-gradient-to-b from-[#1a1710] to-[#0f0f12] hover:border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.15)]';
  } else if (product.effect === 'rainbow_aura') {
    effectCardClass = 'border-pink-500/40 bg-gradient-to-b from-[#180e1a] to-[#0f0f12] hover:border-pink-400 shadow-[0_0_25px_rgba(236,72,153,0.18)]';
  }

  return (
    <div className={`group relative rounded-2xl border transition-all duration-300 p-3 sm:p-4 flex flex-col justify-between shadow-xl ${effectCardClass}`}>
      <div>
        {/* Card Image Area (Aspect Square) */}
        <div 
          onClick={() => onSelect?.(product)}
          className="relative aspect-square w-full rounded-xl overflow-hidden bg-neutral-900 border border-white/10 cursor-pointer group-hover:border-white/20 transition-all"
        >
          <img 
            src={product.imageUrl || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80'} 
            alt={product.name} 
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Top Left Effect or Shield Icon */}
          <div className="absolute top-2.5 left-2.5 size-7 rounded-lg bg-black/70 backdrop-blur-md border border-white/15 flex items-center justify-center text-white/90 shadow-sm pointer-events-none">
            {product.effect === 'aurora' ? (
              <Waves className="size-4 text-cyan-400" />
            ) : product.effect === 'gold' ? (
              <Crown className="size-4 text-amber-400" />
            ) : product.effect === 'rainbow_aura' ? (
              <Sparkles className="size-4 text-pink-400" />
            ) : (
              <ShieldCheck className="size-4 text-white" />
            )}
          </div>

          {/* Discount Tag (if any) */}
          {discountVal && (
            <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-lg bg-[#ff1e27] text-white text-[10px] font-bold font-mono shadow-md pointer-events-none">
              -{discountVal}%
            </div>
          )}

          {/* Maintenance Overlay Badge */}
          {isUnderMaintenance && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center pointer-events-none">
              <span className="px-3 py-1 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1.5 shadow-lg">
                <Wrench className="size-3.5" />
                กำลังปรับปรุง
              </span>
            </div>
          )}

          {/* Bottom Row on Image: Badge & Price */}
          {((product.badge && product.badge !== 'ถาวร') || (product.price > 0)) && (
            <div className="absolute bottom-2.5 inset-x-2.5 flex items-center justify-between gap-1.5 pointer-events-none">
              {product.badge && product.badge !== 'ถาวร' ? (
                <span className="px-3 py-1 rounded-xl bg-black/80 backdrop-blur-md border border-white/15 text-xs font-bold text-white shadow-md truncate max-w-[120px]">
                  {product.badge}
                </span>
              ) : <div />}
              {product.price > 0 && (
                <span className="px-2.5 py-1 rounded-xl bg-[#1e2330]/90 backdrop-blur-md border border-white/15 text-xs font-bold font-mono text-white shadow-md">
                  {product.price.toLocaleString()}฿
                </span>
              )}
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="pt-3 space-y-1">
          {/* Stock Line & Optional Sales Count */}
          <div className="text-xs text-white/50 flex items-center justify-between font-medium">
            <div className="flex items-center gap-1">
              <span>เหลือ</span>
              <span className={`font-mono font-semibold ${isOutOfStock ? 'text-red-400' : 'text-white/80'}`}>
                {product.stock ?? 0}
              </span>
              <span>ชิ้น</span>
            </div>

            {product.showSalesCount && (
              <span className="text-[11px] text-white/40 font-mono">
                ขายแล้ว {product.salesCount || 0}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 
            onClick={() => onSelect?.(product)}
            className="font-heading text-base sm:text-lg font-bold text-white group-hover:text-[#ff1e27] transition-colors line-clamp-1 cursor-pointer tracking-tight"
            title={product.name}
          >
            {product.name}
          </h3>

          {/* Price Line */}
          <div className="text-sm sm:text-base text-white/50 font-medium flex items-baseline gap-2">
            <div>
              <span className="text-white/90 font-mono font-bold text-base sm:text-lg">
                {product.price.toLocaleString()}
              </span>
              <span className="ml-1 text-xs sm:text-sm">บาท</span>
            </div>

            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs text-white/35 line-through font-mono">
                {product.originalPrice.toLocaleString()}฿
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Area */}
      <div className="pt-3 space-y-2">
        {/* Buy Button / Out of Stock / Maintenance */}
        {isUnderMaintenance ? (
          <button
            type="button"
            disabled
            className="w-full py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold text-amber-400 bg-amber-500/10 border border-amber-500/25 flex items-center justify-center cursor-not-allowed"
          >
            ปิดปรับปรุงชั่วคราว
          </button>
        ) : isOutOfStock ? (
          <button
            type="button"
            disabled
            className="w-full py-2.5 sm:py-3 rounded-xl text-sm font-bold text-white/40 bg-white/5 border border-white/10 flex items-center justify-center cursor-not-allowed"
          >
            สินค้าหมด
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onPurchase ? onPurchase(product) : onSelect?.(product)}
            className="btn-primary w-full py-2.5 sm:py-3 rounded-xl text-sm font-bold text-white shadow-lg shadow-[#ff1e27]/25 flex items-center justify-center cursor-pointer transition-all active:scale-[0.98]"
          >
            ซื้อสินค้า
          </button>
        )}

        {/* Admin Direct Edit & Delete Toolbar */}
        {isOwner && (
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(product);
              }}
              className="flex-1 py-1.5 px-2 rounded-lg bg-[#ff1e27]/15 border border-[#ff1e27]/30 text-[#ff1e27] hover:bg-[#ff1e27] hover:text-white transition-colors text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer"
            >
              <Edit3 className="size-3" />
              <span>แก้ไขสินค้า</span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(product.id, product.name);
              }}
              className="py-1.5 px-3 rounded-lg border border-white/10 bg-white/5 hover:bg-red-500/20 text-white/60 hover:text-red-400 transition-colors text-xs font-semibold flex items-center justify-center cursor-pointer"
              title="ลบสินค้านี้"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
