import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  RotateCw, 
  Search, 
  GripVertical, 
  MoreVertical, 
  Edit3, 
  Copy, 
  Key, 
  Sparkles, 
  Gift, 
  Package, 
  CheckCircle2, 
  SlidersHorizontal,
  Sliders,
  Store,
  Layers,
  Check
} from 'lucide-react';
import { ProductItem, CategoryItem, syncAllProductsStock } from '../../lib/store.ts';
import { AdminStockModal } from './AdminStockModal.tsx';

interface AdminProductsTabProps {
  products: ProductItem[];
  categories: CategoryItem[];
  onOpenAddModal: () => void;
  onOpenEditModal: (product: ProductItem) => void;
  onDeleteProduct: (id: string, name: string) => Promise<void>;
  onDuplicateProduct: (id: string) => Promise<void>;
  onSwitchToCategories?: () => void;
  onOpenTrash?: () => void;
  onSyncStock?: () => void;
  onShowToast?: (msg: string) => void;
}

export const AdminProductsTab: React.FC<AdminProductsTabProps> = ({
  products,
  categories,
  onOpenAddModal,
  onOpenEditModal,
  onDeleteProduct,
  onDuplicateProduct,
  onSwitchToCategories,
  onOpenTrash,
  onSyncStock,
  onShowToast
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'relevance' | 'price_asc' | 'price_desc' | 'stock'>('relevance');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Stock Management Modal State
  const [stockModalProduct, setStockModalProduct] = useState<ProductItem | null>(null);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [isSyncingStock, setIsSyncingStock] = useState(false);

  const handleOpenStockModal = (prod: ProductItem) => {
    setActiveMenuId(null);
    setStockModalProduct(prod);
    setIsStockModalOpen(true);
  };

  const handleSyncAllStock = async () => {
    setIsSyncingStock(true);
    try {
      const res = await syncAllProductsStock();
      onShowToast?.(`ซิงค์สต็อกสินค้าทั้งหมดสำเร็จ (${res.updated} รายการ)`);
      if (onSyncStock) onSyncStock();
    } catch (err: any) {
      alert('เกิดข้อผิดพลาดในการซิงค์สต็อก: ' + err.message);
    } finally {
      setIsSyncingStock(false);
    }
  };

  // Filter products
  const filteredProducts = products.filter((p) => {
    const query = searchQuery.trim().toLowerCase();
    const matchQuery = !query || (
      p.name.toLowerCase().includes(query) ||
      (p.description && p.description.toLowerCase().includes(query)) ||
      (p.categoryName && p.categoryName.toLowerCase().includes(query))
    );
    const matchCategory = selectedCategory === 'all' || p.categoryId === selectedCategory;
    return matchQuery && matchCategory;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price_asc') return a.price - b.price;
    if (sortBy === 'price_desc') return b.price - a.price;
    if (sortBy === 'stock') return (b.stock ?? 0) - (a.stock ?? 0);
    return 0; // relevance / natural
  });

  return (
    <div className="space-y-5 animate-fade-in text-left">
      
      {/* Top Switcher Tabs matching IMG_0582 */}
      <div className="p-1.5 rounded-2xl bg-black/60 border border-white/10 flex items-center gap-2 max-w-md">
        <button
          type="button"
          onClick={onSwitchToCategories}
          className="flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
        >
          จัดการหมวดหมู่
        </button>
        <button
          type="button"
          className="flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold btn-primary text-white shadow-lg shadow-[#ff1e27]/30 transition-all cursor-default"
        >
          จัดการสินค้า
        </button>
      </div>

      {/* Filter Card matching IMG_0582 */}
      <div className="rounded-2xl border border-white/10 bg-[#09090b] p-4 sm:p-6 space-y-4 shadow-xl">
        {/* ค้นหาสินค้า */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-white/80">ค้นหาสินค้า</label>
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ชื่อสินค้า, คำอธิบาย, หมวดหมู่..."
            className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#ff1e27] transition-colors"
          />
        </div>

        {/* หมวดหมู่ Dropdown */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-white/80">หมวดหมู่</label>
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-xs sm:text-sm text-white focus:outline-none focus:border-[#ff1e27] transition-colors appearance-none cursor-pointer pr-10"
            >
              <option value="all" className="bg-[#111] text-white">ทุกหมวดหมู่</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id} className="bg-[#111] text-white">
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* เรียงตาม Dropdown */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-white/80">เรียงตาม</label>
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-xs sm:text-sm text-white focus:outline-none focus:border-[#ff1e27] transition-colors appearance-none cursor-pointer pr-10"
            >
              <option value="relevance" className="bg-[#111] text-white">ความสำคัญ</option>
              <option value="price_asc" className="bg-[#111] text-white">ราคา: ต่ำไปสูง</option>
              <option value="price_desc" className="bg-[#111] text-white">ราคา: สูงไปต่ำ</option>
              <option value="stock" className="bg-[#111] text-white">จำนวนสต็อก</option>
            </select>
          </div>
        </div>

        {/* Search Button */}
        <button
          type="button"
          onClick={() => {}}
          className="w-full h-11 rounded-xl bg-[#ff1e27] hover:bg-[#e0141c] text-white text-sm font-bold shadow-lg shadow-[#ff1e27]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Search className="size-4" />
          <span>ค้นหา</span>
        </button>
      </div>

      {/* Product List Section */}
      <div className="space-y-4">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-heading text-lg sm:text-xl font-bold text-white">
              รายการสินค้า
            </h3>
            <span className="text-xs text-white/50">
              ทั้งหมด {sortedProducts.length} รายการ
            </span>
          </div>

          {/* Action buttons on the right */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Trash Bin */}
            <button
              type="button"
              onClick={onOpenTrash}
              className="px-3.5 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="ดูรายการในถังขยะ"
            >
              <Trash2 className="size-4" />
              <span>ถังขยะ</span>
            </button>

            {/* Sync Stock (Blue Button) */}
            <button
              type="button"
              onClick={handleSyncAllStock}
              disabled={isSyncingStock}
              className="px-3.5 py-2 rounded-xl bg-[#3b82f6] hover:bg-[#2563eb] text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-[#3b82f6]/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <RotateCw className={`size-3.5 ${isSyncingStock ? 'animate-spin' : ''}`} />
              <span>{isSyncingStock ? 'กำลัง Sync...' : 'Sync Stock'}</span>
            </button>

            {/* Add Product (Original Red Button) */}
            <button
              type="button"
              onClick={onOpenAddModal}
              className="px-4 py-2 rounded-xl bg-[#ff1e27] hover:bg-[#e0141c] text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-[#ff1e27]/30 transition-all cursor-pointer"
            >
              <Plus className="size-4" />
              <span>เพิ่มสินค้า</span>
            </button>
          </div>
        </div>

        {/* Product List Rows matching IMG_0582 */}
        {sortedProducts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-[#09090b] p-12 text-center space-y-3">
            <div className="size-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-white/30">
              <Package className="size-7" />
            </div>
            <p className="text-sm font-medium text-white/60">ไม่พบรายการสินค้าที่ค้นหา</p>
            <button
              onClick={onOpenAddModal}
              className="px-4 py-2 rounded-xl btn-primary text-white text-xs font-bold shadow-lg"
            >
              + เพิ่มสินค้าใหม่
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedProducts.map((p) => {
              const cat = categories.find(c => c.id === p.categoryId);
              return (
                <div
                  key={p.id}
                  className="group relative rounded-2xl border border-white/10 bg-[#09090b] hover:border-[#ff1e27]/50 p-4 sm:p-5 flex items-start sm:items-center justify-between gap-4 transition-all shadow-xl"
                >
                  <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                    {/* Drag Grip Icon */}
                    <GripVertical className="size-5 text-white/30 shrink-0 cursor-grab mt-1 sm:mt-0" />

                    {/* Thumbnail matching IMG_0582 */}
                    <div className="size-14 sm:size-16 rounded-xl overflow-hidden bg-neutral-900 border border-white/10 shrink-0">
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.name} className="size-full object-cover" />
                      ) : (
                        <div className="size-full flex items-center justify-center text-white/20">
                          <Package className="size-6" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="min-w-0 space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-heading text-sm sm:text-base font-bold text-white truncate max-w-xs sm:max-w-md">
                          {p.name}
                        </h4>
                      </div>

                      <p className="text-xs text-white/40 truncate line-clamp-1 max-w-xs sm:max-w-lg">
                        {p.description || 'ไม่มีคำอธิบาย'}
                      </p>

                      {/* Badges line matching IMG_0582 */}
                      <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                        <button
                          type="button"
                          onClick={() => handleOpenStockModal(p)}
                          className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-[#ff1e27]/20 hover:bg-[#ff1e27]/30 text-[#ff1e27] border border-[#ff1e27]/30 flex items-center gap-1 cursor-pointer transition-colors"
                          title="คลิกเพื่อจัดการสต็อกสินค้า"
                        >
                          <Gift className="size-3" />
                          <span>สต็อก: {p.stock ?? 0}</span>
                        </button>

                        {(p.isRecommended || p.isFeatured || p.badge) && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-[#ff1e27] text-white shadow-sm">
                            {p.badge || (p.isRecommended ? 'แนะนำ' : 'ยอดนิยม')}
                          </span>
                        )}
                      </div>

                      {/* Price & Category info line */}
                      <div className="flex items-center gap-3 text-xs text-white/50 pt-0.5">
                        <span>
                          ราคา <strong className="text-white font-mono font-bold">฿{p.price.toLocaleString()}</strong>
                        </span>
                        <span>•</span>
                        <span className="truncate">
                          หมวดหมู่: <strong className="text-white/80">{cat?.name || p.categoryName || 'ทั่วไป'}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Three-dots menu matching IMG_0582 */}
                  <div className="relative shrink-0">
                    <button
                      type="button"
                      onClick={() => setActiveMenuId(activeMenuId === p.id ? null : p.id)}
                      className="size-9 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <MoreVertical className="size-4" />
                    </button>

                    {/* Dropdown Menu matching IMG_0589 */}
                    {activeMenuId === p.id && (
                      <div className="absolute right-0 top-11 w-48 rounded-xl bg-[#121217] border border-white/15 p-1.5 shadow-2xl z-30 space-y-1 animate-fade-in text-xs">
                        {/* 1. จัดการสต็อก */}
                        <button
                          type="button"
                          onClick={() => handleOpenStockModal(p)}
                          className="w-full px-3 py-2 rounded-lg text-left text-white/90 hover:text-white hover:bg-[#ff1e27]/20 flex items-center gap-2.5 cursor-pointer transition-colors"
                        >
                          <Package className="size-4 text-[#ff1e27]" />
                          <span className="font-semibold">จัดการสต็อก</span>
                        </button>

                        {/* 2. จัดการตัวเลือก */}
                        <button
                          type="button"
                          onClick={() => {
                            setActiveMenuId(null);
                            onShowToast?.('ระบบตัวเลือกสินค้ารองรับผ่านการตั้งค่ารายละเอียด');
                          }}
                          className="w-full px-3 py-2 rounded-lg text-left text-white/80 hover:text-white hover:bg-white/10 flex items-center gap-2.5 cursor-pointer transition-colors"
                        >
                          <SlidersHorizontal className="size-4 text-emerald-400" />
                          <span>จัดการตัวเลือก</span>
                        </button>

                        {/* 3. แก้ไขสินค้า */}
                        <button
                          type="button"
                          onClick={() => {
                            setActiveMenuId(null);
                            onOpenEditModal(p);
                          }}
                          className="w-full px-3 py-2 rounded-lg text-left text-white/80 hover:text-white hover:bg-[#ff1e27]/20 flex items-center gap-2.5 cursor-pointer transition-colors"
                        >
                          <Edit3 className="size-4 text-[#ff1e27]" />
                          <span>แก้ไขสินค้า</span>
                        </button>

                        {/* 4. ทำซ้ำสินค้า */}
                        <button
                          type="button"
                          onClick={() => {
                            setActiveMenuId(null);
                            onDuplicateProduct(p.id);
                          }}
                          className="w-full px-3 py-2 rounded-lg text-left text-white/80 hover:text-white hover:bg-white/10 flex items-center gap-2.5 cursor-pointer transition-colors"
                        >
                          <Copy className="size-4 text-blue-400" />
                          <span>ทำซ้ำสินค้า</span>
                        </button>

                        {/* 5. ลบสินค้า */}
                        <button
                          type="button"
                          onClick={() => {
                            setActiveMenuId(null);
                            onDeleteProduct(p.id, p.name);
                          }}
                          className="w-full px-3 py-2 rounded-lg text-left text-red-400 hover:text-red-300 hover:bg-red-500/15 flex items-center gap-2.5 cursor-pointer transition-colors"
                        >
                          <Trash2 className="size-4" />
                          <span>ลบสินค้า</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Stock Management Modal */}
      <AdminStockModal
        isOpen={isStockModalOpen}
        product={stockModalProduct}
        onClose={() => {
          setIsStockModalOpen(false);
          setStockModalProduct(null);
        }}
        onShowToast={onShowToast}
      />
    </div>
  );
};
