import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  X, 
  Package, 
  ChevronRight,
  PackageSearch,
  Layers,
  Flame,
  Star,
  Folder
} from 'lucide-react';
import { ProductItem, CategoryItem } from '../lib/store.ts';

interface SearchModalProps {
  isOpen: boolean;
  products?: ProductItem[];
  categories?: CategoryItem[];
  onClose: () => void;
  onSelectResult: (view: 'home' | 'category-1' | 'packages' | 'rankings' | 'activities') => void;
  onSelectProduct?: (product: ProductItem) => void;
  onSelectCategory?: (category: CategoryItem) => void;
  onPurchase?: (product: ProductItem) => void;
}

export function SearchModal({ 
  isOpen, 
  products = [], 
  categories = [], 
  onClose, 
  onSelectResult,
  onSelectProduct,
  onSelectCategory,
  onPurchase
}: SearchModalProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input automatically on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setQuery('');
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const trimmed = query.trim().toLowerCase();

  // Filter products
  const matchingProducts = products.filter(p => {
    if (!trimmed) return true;
    return (
      p.name.toLowerCase().includes(trimmed) ||
      (p.categoryName && p.categoryName.toLowerCase().includes(trimmed)) ||
      (p.description && p.description.toLowerCase().includes(trimmed)) ||
      (p.tags && p.tags.some(t => t.toLowerCase().includes(trimmed)))
    );
  });

  // Filter categories
  const matchingCategories = categories.filter(c => {
    if (!trimmed) return true;
    return (
      c.name.toLowerCase().includes(trimmed) ||
      (c.description && c.description.toLowerCase().includes(trimmed)) ||
      c.slug.toLowerCase().includes(trimmed)
    );
  });

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-start justify-center pt-14 sm:pt-24 px-4 bg-black/75 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-white/15 bg-[#0d0d0d] shadow-2xl shadow-black/80 flex flex-col max-h-[85vh] transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="relative flex items-center border-b border-white/10 px-4 py-3.5 sm:py-4 bg-[#111111]">
          <Search className="size-5 text-[#ff1e27] shrink-0 mr-3 animate-pulse" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ค้นหาชื่อสินค้า สคริปต์ หรือหมวดหมู่ในระบบ..."
            className="w-full bg-transparent text-sm sm:text-base text-white placeholder-white/40 focus:outline-none font-medium"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors cursor-pointer mr-1.5"
              aria-label="ล้างคำค้นหา"
            >
              <X className="size-4" />
            </button>
          ) : (
            <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded border border-white/15 bg-white/5 text-[10px] text-white/40 font-mono">
              ESC
            </div>
          )}
          <button
            type="button"
            onClick={onClose}
            className="ml-2 sm:hidden p-1.5 text-xs text-white/60 hover:text-white"
          >
            ปิด
          </button>
        </div>

        {/* Search Results List */}
        <div className="overflow-y-auto p-3 sm:p-4 space-y-4 flex-1 max-h-[60vh]">
          {/* Categories section */}
          {matchingCategories.length > 0 && (
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-white/40 uppercase tracking-wider block px-1">
                หมวดหมู่สินค้า ({matchingCategories.length})
              </span>
              <div className="space-y-1.5">
                {matchingCategories.map(cat => (
                  <div
                    key={cat.id}
                    onClick={() => {
                      if (onSelectCategory) onSelectCategory(cat);
                      onSelectResult('category-1');
                      onClose();
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-white/10 bg-[#141418] hover:bg-[#1a1a22] hover:border-[#ff1e27]/40 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="size-10 rounded-lg overflow-hidden border border-white/10 bg-neutral-900 shrink-0">
                        {cat.imageUrl ? (
                          <img src={cat.imageUrl} alt={cat.name} className="size-full object-cover" />
                        ) : (
                          <div className="size-full flex items-center justify-center text-white/30 text-xs">
                            <Folder className="size-4 text-white/40" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold text-white hover:text-[#ff3b42] truncate">
                          {cat.name}
                        </h4>
                        <span className="text-[11px] text-white/40 truncate block">
                          {cat.description || 'หมวดหมู่สินค้า'}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="size-4 text-white/30 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Products section */}
          {matchingProducts.length > 0 && (
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-white/40 uppercase tracking-wider block px-1">
                รายการสินค้า & Scripts ({matchingProducts.length})
              </span>
              <div className="space-y-1.5">
                {matchingProducts.map(p => (
                  <div
                    key={p.id}
                    onClick={() => {
                      if (onSelectProduct) onSelectProduct(p);
                      onClose();
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-white/10 bg-[#121216] hover:bg-[#191920] hover:border-[#ff1e27]/40 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="size-11 rounded-lg overflow-hidden border border-white/10 bg-neutral-900 shrink-0">
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt={p.name} className="size-full object-cover" />
                        ) : (
                          <div className="size-full flex items-center justify-center text-[#ff1e27]">
                            <Package className="size-4 text-[#ff1e27]" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                            {p.name}
                          </h4>
                          {p.badge && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#ff1e27] text-white">
                              {p.badge}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-white/80 font-mono font-semibold">
                            {p.price.toLocaleString()} บาท
                          </span>
                          <span className="text-[11px] text-white/40">
                            · เหลือ {p.stock ?? 0} ชิ้น
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {onPurchase && (p.stock ?? 0) > 0 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onClose();
                            onPurchase(p);
                          }}
                          className="btn-primary px-2.5 py-1 text-xs rounded-lg text-white font-semibold cursor-pointer shadow-sm"
                        >
                          ซื้อ
                        </button>
                      )}
                      <span className="text-xs text-white/50 bg-white/5 px-2 py-1 rounded-lg">
                        ดูสินค้า
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty search */}
          {matchingProducts.length === 0 && matchingCategories.length === 0 && (
            <div className="py-12 px-4 text-center space-y-3">
              <div className="size-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-white/40">
                <PackageSearch className="size-7 text-[#ff1e27]" />
              </div>
              <h4 className="text-base font-bold text-white font-heading">
                ไม่พบข้อมูลที่คุณค้นหา
              </h4>
              <p className="text-xs text-white/50 max-w-sm mx-auto">
                ลองค้นหาด้วยคำอื่น หรือเลือกดูหมวดหมู่สินค้าในระบบ
              </p>
            </div>
          )}
        </div>

        {/* Footer shortcuts tip */}
        <div className="border-t border-white/10 px-4 py-2.5 bg-[#0a0a0a] flex items-center justify-between text-[11px] text-white/40">
          <div className="flex items-center gap-2">
            <span>กด</span>
            <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/15 text-[10px] text-white/80 font-mono">ESC</kbd>
            <span>เพื่อปิด</span>
          </div>
          <span className="text-white/30">Xecute Lab Store</span>
        </div>
      </div>
    </div>
  );
}
