import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  GripVertical, 
  Trash, 
  Layers, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { CategoryItem } from '../../lib/store.ts';
import { CategoryModal } from './CategoryModal.tsx';

interface AdminCategoriesTabProps {
  categories: CategoryItem[];
  onSaveCategory: (cat: Partial<CategoryItem>, id?: string) => Promise<void>;
  onDeleteCategory: (id: string, name: string) => Promise<void>;
  onOpenTrash?: () => void;
  onSwitchToProducts?: () => void;
}

export const AdminCategoriesTab: React.FC<AdminCategoriesTabProps> = ({
  categories,
  onSaveCategory,
  onDeleteCategory,
  onOpenTrash,
  onSwitchToProducts
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);

  const openAddModal = () => {
    setEditingCategory(null);
    setModalOpen(true);
  };

  const openEditModal = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setModalOpen(true);
  };

  return (
    <div className="space-y-5 animate-fade-in text-left">
      
      {/* Top Switcher Tabs matching IMG_0581 & IMG_0582 */}
      <div className="p-1.5 rounded-2xl bg-black/60 border border-white/10 flex items-center gap-2 max-w-md">
        <button
          type="button"
          className="flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold btn-primary text-white shadow-lg shadow-[#ff1e27]/30 transition-all cursor-default"
        >
          จัดการหมวดหมู่
        </button>
        <button
          type="button"
          onClick={onSwitchToProducts}
          className="flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
        >
          จัดการสินค้า
        </button>
      </div>

      {/* Main Container Card matching IMG_0581 */}
      <div className="rounded-2xl border border-white/10 bg-[#09090b] shadow-2xl overflow-hidden">
        
        {/* Card Header */}
        <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 bg-[#0d0d12]">
          <h3 className="font-heading text-lg sm:text-xl font-bold text-white tracking-tight">
            รายการหมวดหมู่
          </h3>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
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

            {/* Add Category Button (Original Red) */}
            <button
              type="button"
              onClick={openAddModal}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-[#ff1e27] hover:bg-[#e0141c] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-[#ff1e27]/30 transition-all cursor-pointer"
            >
              <Plus className="size-4" />
              <span>เพิ่มหมวดหมู่ใหม่</span>
            </button>
          </div>
        </div>

        {/* Table List Header matching IMG_0581 */}
        <div className="grid grid-cols-12 px-4 py-3 border-b border-white/10 bg-black/40 text-xs font-semibold text-white/50">
          <div className="col-span-8 sm:col-span-9 flex items-center gap-3">
            <GripVertical className="size-4 opacity-40" />
            <span>ชื่อหมวดหมู่</span>
          </div>
          <div className="col-span-4 sm:col-span-3 text-right">
            <span>การดำเนินการ</span>
          </div>
        </div>

        {/* Table Rows */}
        {categories.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="size-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-white/30">
              <Layers className="size-7" />
            </div>
            <p className="text-sm font-medium text-white/60">ยังไม่มีหมวดหมู่สินค้าในระบบ</p>
            <button
              onClick={openAddModal}
              className="px-4 py-2 rounded-xl btn-primary text-white text-xs font-bold shadow-lg"
            >
              + เพิ่มหมวดหมู่แรก
            </button>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {categories.map((cat) => (
              <div 
                key={cat.id} 
                className="grid grid-cols-12 items-center px-4 py-3.5 hover:bg-white/[0.02] transition-colors"
              >
                {/* Drag Handle & Category Info */}
                <div className="col-span-8 sm:col-span-9 flex items-center gap-3 min-w-0">
                  <GripVertical className="size-4 text-white/30 shrink-0 cursor-grab" />
                  
                  {cat.imageUrl && (
                    <img 
                      src={cat.imageUrl} 
                      alt={cat.name} 
                      className="size-9 rounded-lg object-cover border border-white/10 shrink-0 hidden sm:block" 
                    />
                  )}

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-bold text-sm sm:text-base text-white truncate block">
                        {cat.name}
                      </span>
                      {cat.badge && cat.badge !== 'ไม่มี' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ff1e27]/20 text-[#ff1e27] border border-[#ff1e27]/40 shrink-0">
                          {cat.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-white/40 truncate block mt-0.5">
                      {cat.description || cat.slug || 'Category'}
                    </span>
                  </div>
                </div>

                {/* Action Buttons matching IMG_0581 */}
                <div className="col-span-4 sm:col-span-3 flex items-center justify-end gap-2">
                  {/* Red Edit Button */}
                  <button
                    type="button"
                    onClick={() => openEditModal(cat)}
                    className="size-8 sm:size-9 rounded-xl btn-primary text-white flex items-center justify-center transition-all shadow-md shadow-[#ff1e27]/20 cursor-pointer"
                    title="แก้ไขหมวดหมู่"
                  >
                    <Edit3 className="size-4" />
                  </button>

                  {/* Red Delete Button */}
                  <button
                    type="button"
                    onClick={() => onDeleteCategory(cat.id, cat.name)}
                    className="size-8 sm:size-9 rounded-xl bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-all shadow-md shadow-red-600/20 cursor-pointer"
                    title="ลบหมวดหมู่"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Modal matching IMG_0583 */}
      <CategoryModal
        isOpen={modalOpen}
        editingCategory={editingCategory}
        categories={categories}
        onClose={() => setModalOpen(false)}
        onSave={async (data, id) => {
          await onSaveCategory(data, id);
          setModalOpen(false);
        }}
      />

    </div>
  );
};
