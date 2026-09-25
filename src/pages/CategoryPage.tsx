import React from 'react';
import { ChevronRight, PackageSearch, ShoppingBag, Star, Edit3, Trash2, Plus, Sparkles } from 'lucide-react';
import { ProductItem } from '../lib/store.ts';
import { ProductCard } from '../components/ProductCard.tsx';

interface CategoryPageProps {
  categoryId?: string;
  categoryName?: string;
  categoryImage?: string;
  categoryDescription?: string;
  products?: ProductItem[];
  isOwner?: boolean;
  onNavigateHome: () => void;
  onNavigateCategories?: () => void;
  onSelectProduct?: (product: ProductItem) => void;
  onPurchase?: (product: ProductItem) => void;
  onEditProduct?: (product: ProductItem) => void;
  onDeleteProduct?: (id: string, name: string) => Promise<void>;
  onEditCategory?: () => void;
  onDeleteCategory?: () => void;
  onAddProduct?: () => void;
}

export function CategoryPage({
  categoryId = 'category-1',
  categoryName = 'Category 1 / หมวดหมู่ที่ 1',
  categoryImage,
  categoryDescription,
  products = [],
  isOwner = false,
  onNavigateHome,
  onNavigateCategories,
  onSelectProduct,
  onPurchase,
  onEditProduct,
  onDeleteProduct,
  onEditCategory,
  onDeleteCategory,
  onAddProduct
}: CategoryPageProps) {
  // Filter products belonging to this category
  const categoryProducts = products.filter(p => 
    p.categoryId === categoryId || 
    categoryId === 'all' || 
    (p.categoryName && p.categoryName.toLowerCase().includes(categoryName.toLowerCase()))
  );

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
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
              <path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,160H40V56H216V200ZM176,88a48,48,0,0,1-96,0,8,8,0,0,1,16,0,32,32,0,0,0,64,0,8,8,0,0,1,16,0Z" />
            </svg>
            <span>หมวดหมู่ทั้งหมด</span>
          </button>
          <ChevronRight className="mx-2 size-4 text-white/30 shrink-0" />
        </li>

        <li className="inline-flex items-center">
          <span className="text-white font-medium truncate max-w-[200px] sm:max-w-xs" aria-current="page">
            {categoryName}
          </span>
        </li>
      </ol>

      {/* Category Banner Image */}
      <div className="relative overflow-hidden rounded-xl border border-white/10 shadow-2xl bg-[#141414]">
        <img
          alt={categoryName}
          width={1200}
          height={300}
          decoding="async"
          className="aspect-[4/1] sm:aspect-[15/4] max-h-72 w-full object-cover rounded-xl"
          src={categoryImage || "https://img.rdcw.co.th/images/3c8f784a0a8cbe99c7e6e9f6dc9a1cc0d8474a530a8dc891e45cd03eed2ce832.jpeg"}
        />
      </div>

      {/* Category Header Information & Admin Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="space-y-1">
          <p className="text-xs sm:text-sm font-medium text-[#ff1e27] font-mono">
            หมวดหมู่สินค้า #{categoryId}
          </p>
          <h1 className="text-xl sm:text-2xl font-bold text-white font-heading">
            {categoryName}
          </h1>
          {categoryDescription && (
            <p className="text-xs sm:text-sm text-white/60 pt-1">
              {categoryDescription}
            </p>
          )}
        </div>

        {/* Admin Category Quick Actions */}
        {isOwner && (
          <div className="flex items-center gap-2 flex-wrap">
            {onAddProduct && (
              <button
                type="button"
                onClick={onAddProduct}
                className="btn-primary h-9 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg cursor-pointer"
              >
                <Plus className="size-3.5" />
                <span>+ เพิ่มสินค้าลงหมวดนี้</span>
              </button>
            )}

            {onEditCategory && (
              <button
                type="button"
                onClick={onEditCategory}
                className="px-3 py-2 rounded-xl bg-[#ff1e27]/15 border border-[#ff1e27]/30 text-[#ff1e27] hover:bg-[#ff1e27] hover:text-white transition-colors text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="size-3.5" />
                <span>แก้ไขหมวดหมู่</span>
              </button>
            )}

            {onDeleteCategory && (
              <button
                type="button"
                onClick={onDeleteCategory}
                className="p-2 rounded-xl border border-white/10 bg-white/5 hover:bg-red-500/20 text-white/60 hover:text-red-400 transition-colors cursor-pointer"
                title="ลบหมวดหมู่นี้"
              >
                <Trash2 className="size-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Real Product Cards or Empty State */}
      {categoryProducts.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#0f0f0f] p-12 sm:p-16 flex flex-col items-center justify-center text-center shadow-xl space-y-3">
          <div className="size-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 mb-2">
            <PackageSearch className="size-8 text-[#ff1e27]" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white font-heading">
            ขณะนี้ยังไม่มีสินค้าในหมวดหมู่นี้
          </h3>
          <p className="text-xs sm:text-sm text-white/40 max-w-sm">
            {isOwner 
              ? 'คุณสามารถเพิ่มสินค้าลงในหมวดหมู่นี้ได้ทันทีผ่านระบบจัดการสินค้า'
              : 'ขณะนี้ยังไม่มีสินค้าในหมวดหมู่นี้ โปรดกลับมาตรวจสอบใหม่อีกครั้งในภายหลัง'}
          </p>
          <div className="flex items-center gap-3 pt-2">
            {isOwner && onAddProduct && (
              <button
                onClick={onAddProduct}
                className="btn-primary h-10 px-5 rounded-xl text-xs sm:text-sm font-semibold cursor-pointer shadow-lg"
              >
                + เพิ่มสินค้าแรกในหมวดนี้
              </button>
            )}
            <button
              onClick={onNavigateHome}
              className="btn-secondary h-10 px-5 rounded-xl text-xs sm:text-sm font-medium cursor-pointer"
            >
              กลับสู่หน้าแรก
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 pt-2">
          {categoryProducts.map((p) => (
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
