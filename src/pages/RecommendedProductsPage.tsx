import React from 'react';
import { ChevronRight, PackageSearch, Star, Edit3, Trash2, Plus } from 'lucide-react';
import { ProductItem } from '../lib/store.ts';
import { ProductCard } from '../components/ProductCard.tsx';

interface RecommendedProductsPageProps {
  products?: ProductItem[];
  isOwner?: boolean;
  onNavigateHome: () => void;
  onSelectProduct?: (product: ProductItem) => void;
  onPurchase?: (product: ProductItem) => void;
  onEditProduct?: (product: ProductItem) => void;
  onDeleteProduct?: (id: string, name: string) => Promise<void>;
  onAddProduct?: () => void;
}

export function RecommendedProductsPage({
  products = [],
  isOwner = false,
  onNavigateHome,
  onSelectProduct,
  onPurchase,
  onEditProduct,
  onDeleteProduct,
  onAddProduct
}: RecommendedProductsPageProps) {
  // Filter products flagged as recommended or active
  const recommendedList = products.filter(p => p.isRecommended || p.status === 'active');

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 max-w-6xl space-y-6 animate-fade-in">
      {/* Breadcrumb */}
      <ol className="flex flex-wrap items-center gap-y-2 whitespace-nowrap text-sm text-white/60" aria-label="Breadcrumb">
        <li className="inline-flex items-center">
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
              <path d="M219.31,108.68l-80-80a16,16,0,0,0-22.62,0l-80,80A15.87,15.87,0,0,0,32,120v96a8,8,0,0,0,8,8h64a8,8,0,0,0,8-8V160h32v56a8,8,0,0,0,8,8h64a8,8,0,0,0,8-8V120A15.87,15.87,0,0,0,219.31,108.68ZM208,208H160V152a8,8,0,0,0-8-8H104a8,8,0,0,0-8,8v56H48V120l80-80,80,80Z" />
            </svg>
            <span>หน้าแรก</span>
          </button>
          <ChevronRight className="mx-2 size-4 text-white/30 shrink-0" />
        </li>

        <li className="inline-flex items-center">
          <span className="text-white font-medium truncate" aria-current="page">
            สินค้าแนะนำสำหรับคุณ
          </span>
        </li>
      </ol>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs sm:text-sm font-medium text-[#ff1e27] font-mono">
            รายการสินค้าแนะนำ
          </p>
          <h1 className="text-xl sm:text-2xl font-bold text-white font-heading">
            สินค้าแนะนำสำหรับคุณ (Recommended Products)
          </h1>
          <p className="text-xs sm:text-sm text-white/60">
            คัดสรรสคริปต์และใบอนุญาตยอดนิยมที่มีผู้ใช้งานสูงสุดและอัปเดตล่าสุด
          </p>
        </div>

        {isOwner && onAddProduct && (
          <button
            onClick={onAddProduct}
            className="btn-primary h-10 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-lg cursor-pointer shrink-0"
          >
            <Plus className="size-4" />
            <span>+ เพิ่มสินค้าใหม่</span>
          </button>
        )}
      </div>

      {/* Products Grid or Empty State */}
      {recommendedList.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#0f0f0f] p-12 sm:p-16 flex flex-col items-center justify-center text-center shadow-xl">
          <div className="size-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 mb-4">
            <PackageSearch className="size-8 text-[#ff1e27]" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white font-heading">
            ขณะนี้ยังไม่มีสินค้าแนะนำ
          </h3>
          <p className="text-xs sm:text-sm text-white/40 mt-1 max-w-sm">
            {isOwner 
              ? 'สามารถตั้งค่าให้สินค้าแสดงผลในส่วนแนะนำนี้ได้ผ่านระบบหลังบ้าน'
              : 'ขณะนี้ยังไม่มีสินค้าแนะนำ โปรดติดตามรายการสินค้าใหม่ๆ เร็วๆ นี้'}
          </p>
          <button
            onClick={onNavigateHome}
            className="btn-primary mt-6 h-10 px-6 rounded-lg text-xs sm:text-sm font-medium cursor-pointer"
          >
            กลับสู่หน้าแรก
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 pt-2">
          {recommendedList.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              isOwner={isOwner}
              onSelect={onSelectProduct}
              onPurchase={onPurchase}
              onEdit={onEditProduct}
              onDelete={onDeleteProduct}
            />
          ))}
        </div>
      )}
    </div>
  );
}
