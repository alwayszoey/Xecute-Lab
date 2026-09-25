import React, { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, Check, Sparkles, Hash, Edit3 } from 'lucide-react';
import { MasterTagItem, fetchMasterTags, saveMasterTag, deleteMasterTag, ProductItem } from '../../lib/store.ts';

interface AdminTagsTabProps {
  products: ProductItem[];
  onShowToast: (msg: string) => void;
}

const PRESET_COLORS = ['#ff1e27', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#e11d48'];

export const AdminTagsTab: React.FC<AdminTagsTabProps> = ({
  products,
  onShowToast
}) => {
  const [tags, setTags] = useState<MasterTagItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState(PRESET_COLORS[0]);

  const loadTags = async () => {
    setLoading(true);
    try {
      const list = await fetchMasterTags();
      setTags(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTags();
  }, []);

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    try {
      await saveMasterTag({
        name: newTagName.trim(),
        color: newTagColor
      });
      setNewTagName('');
      await loadTags();
      onShowToast('เพิ่มแท็กใหม่สำเร็จ');
    } catch (err: any) {
      alert('Error creating tag: ' + err.message);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`ลบแท็ก "${name}" ออกจากระบบกลางใช่หรือไม่?`)) {
      await deleteMasterTag(id);
      await loadTags();
      onShowToast('ลบแท็กเรียบร้อย');
    }
  };

  // Count usage of each tag across all products
  const getProductCountForTag = (tagName: string) => {
    return products.filter(p => p.tags && p.tags.some(t => t.toLowerCase() === tagName.toLowerCase())).length;
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#0f0f13] border border-white/10 p-4 rounded-2xl">
        <div>
          <h3 className="font-heading text-lg font-bold text-white flex items-center gap-2">
            <Tag className="size-5 text-[#ff1e27]" />
            <span>จัดการแท็กและป้ายกำกับกลาง (Master Tag & Badge Manager)</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#ff1e27]/15 border border-[#ff1e27]/30 text-white font-mono">
              {tags.length} แท็ก
            </span>
          </h3>
          <p className="text-xs text-white/50 mt-0.5">
            แท็กที่กำหนดไว้ที่นี่สามารถนำไปใช้ติดการ์ดสินค้า เพื่อให้ลูกค้าค้นหาและกรองได้สะดวก
          </p>
        </div>
      </div>

      {/* Add New Tag Card */}
      <div className="rounded-2xl border border-white/10 bg-[#0d0d12] p-5 space-y-4">
        <h4 className="font-heading text-sm font-bold text-white flex items-center gap-2">
          <Plus className="size-4 text-[#ff1e27]" />
          <span>สร้างแท็กคุณสมบัติใหม่</span>
        </h4>

        <form onSubmit={handleCreateTag} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/40" />
            <input
              type="text"
              required
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="ชื่อแท็ก เช่น Roblox, Bypass, Open SRC..."
              className="w-full bg-[#15151b] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:border-[#ff1e27] focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 bg-[#15151b] p-1.5 rounded-xl border border-white/10 self-start sm:self-auto">
            <span className="text-[11px] text-white/50 px-1">สีแท็ก:</span>
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setNewTagColor(c)}
                style={{ backgroundColor: c }}
                className={`size-5 rounded-full transition-transform ${
                  newTagColor === c ? 'scale-125 ring-2 ring-white' : 'opacity-80 hover:opacity-100'
                }`}
              />
            ))}
          </div>

          <button
            type="submit"
            className="btn-primary h-9 px-5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
          >
            <Plus className="size-3.5" />
            <span>สร้างแท็ก</span>
          </button>
        </form>
      </div>

      {/* Tags Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {tags.map((t) => {
          const count = getProductCountForTag(t.name);
          return (
            <div
              key={t.id}
              className="rounded-xl border border-white/10 bg-[#0d0d12] p-3 flex items-center justify-between hover:border-white/20 transition-all shadow-md"
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="size-3 rounded-full shrink-0 shadow-sm"
                  style={{ backgroundColor: t.color || '#ff1e27' }}
                />
                <div>
                  <span className="text-xs font-bold text-white block">
                    #{t.name}
                  </span>
                  <span className="text-[10px] text-white/40">
                    ใช้กับ {count} สินค้า
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleDelete(t.id, t.name)}
                className="p-1 rounded-lg text-white/30 hover:text-red-400 transition-colors"
                title="ลบแท็ก"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          );
        })}
      </div>

    </div>
  );
};
