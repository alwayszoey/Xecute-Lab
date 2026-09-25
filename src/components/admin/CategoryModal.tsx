import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Image as ImageIcon, 
  Menu, 
  Folder, 
  Tag, 
  Sparkles, 
  Loader2, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { CategoryItem } from '../../lib/store.ts';

interface CategoryModalProps {
  isOpen: boolean;
  editingCategory: CategoryItem | null;
  categories?: CategoryItem[];
  onClose: () => void;
  onSave: (cat: Partial<CategoryItem>, id?: string) => Promise<void>;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  editingCategory,
  categories = [],
  onClose,
  onSave
}) => {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [badge, setBadge] = useState('ไม่มี');
  const [parentCategory, setParentCategory] = useState('ไม่มี (หมวดหมู่หลัก)');
  const [effect, setEffect] = useState('ไม่มี');
  const [isEnabled, setIsEnabled] = useState(true);

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setErrorMsg(null);
    if (editingCategory) {
      setName(editingCategory.name || '');
      setSlug(editingCategory.slug || '');
      setDescription(editingCategory.description || '');
      setImageUrl(editingCategory.imageUrl || '');
      setBadge(editingCategory.badge || 'ไม่มี');
      setParentCategory(editingCategory.parentCategory || 'ไม่มี (หมวดหมู่หลัก)');
      setEffect(editingCategory.effect || 'ไม่มี');
      setIsEnabled(editingCategory.isEnabled !== false && editingCategory.status !== 'hidden');
    } else {
      setName('');
      setSlug('');
      setDescription('');
      setImageUrl('');
      setBadge('ไม่มี');
      setParentCategory('ไม่มี (หมวดหมู่หลัก)');
      setEffect('ไม่มี');
      setIsEnabled(true);
    }
  }, [editingCategory, isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 30 * 1024 * 1024) {
      setErrorMsg('ขนาดไฟล์ภาพต้องไม่เกิน 30MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImageUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingCategory) {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9ก-๙]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setSlug(generatedSlug || 'category');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('กรุณากรอกชื่อหมวดหมู่');
      return;
    }

    setSaving(true);
    setErrorMsg(null);

    try {
      const payload: Partial<CategoryItem> = {
        name: name.trim(),
        slug: slug.trim() || 'category',
        description: description.trim(),
        imageUrl: imageUrl.trim() || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=400&q=80',
        badge: badge === 'ไม่มี' ? '' : badge.trim(),
        parentCategory: parentCategory === 'ไม่มี (หมวดหมู่หลัก)' ? '' : parentCategory,
        effect: effect === 'ไม่มี' ? '' : effect,
        isEnabled,
        status: isEnabled ? 'active' : 'hidden'
      };

      await onSave(payload, editingCategory?.id);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="max-w-lg w-full rounded-2xl bg-[#09090b] border border-white/10 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header - Red Original Theme */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#0d0d12]">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl btn-primary text-white flex items-center justify-center shadow-lg shadow-[#ff1e27]/30">
              <Menu className="size-5" />
            </div>
            <h3 className="font-heading text-base sm:text-lg font-bold text-white">
              {editingCategory ? 'แก้ไขหมวดหมู่' : 'เพิ่มหมวดหมู่ใหม่'}
            </h3>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="size-8 rounded-lg text-white/50 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          
          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="size-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. รูปภาพ Upload Box */}
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-semibold text-white/80">รูปภาพ</label>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept="image/*" 
              className="hidden" 
            />
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="relative w-full border border-dashed border-white/20 hover:border-[#ff1e27] rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer bg-white/[0.02] hover:bg-[#ff1e27]/5 transition-all group min-h-[130px]"
            >
              {imageUrl ? (
                <div className="flex flex-col items-center gap-2">
                  <img src={imageUrl} alt="Category preview" className="size-20 rounded-xl object-cover border border-[#ff1e27]/50 shadow-md" />
                  <span className="text-[11px] text-[#ff1e27] hover:underline">คลิกเพื่อเปลี่ยนรูปภาพ</span>
                </div>
              ) : (
                <>
                  <div className="size-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 mb-2 group-hover:text-[#ff1e27] group-hover:border-[#ff1e27]/40 transition-colors">
                    <ImageIcon className="size-5" />
                  </div>
                  <span className="text-xs font-bold text-white group-hover:text-[#ff1e27] transition-colors">
                    คลิก/ลากวาง เพื่ออัปโหลดรูป
                  </span>
                  <span className="text-[10px] text-white/40 mt-1">
                    รองรับ PNG, JPG, GIF, WebP ขนาดไม่เกิน 30MB
                  </span>
                </>
              )}
            </div>

            {/* Quick URL Input */}
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="หรือวาง URL รูปภาพโดยตรง (https://...)"
              className="w-full mt-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#ff1e27] transition-colors"
            />
          </div>

          {/* 2. ชื่อหมวดหมู่ * */}
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-semibold text-white/80">
              ชื่อหมวดหมู่ <span className="text-[#ff1e27]">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="กรอกชื่อหมวดหมู่"
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#ff1e27] transition-colors"
            />
          </div>

          {/* 3. คำอธิบาย */}
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-semibold text-white/80">
              คำอธิบาย
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="คำอธิบายหมวดหมู่"
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#ff1e27] transition-colors resize-none"
            />
          </div>

          {/* 4. เปิดใช้งาน Toggle Switch (Original Red Theme) */}
          <div className="flex items-center justify-between py-1">
            <span className="text-xs font-semibold text-white/90">เปิดใช้งาน</span>
            <button
              type="button"
              role="switch"
              aria-checked={isEnabled}
              onClick={() => setIsEnabled(!isEnabled)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isEnabled ? 'bg-[#ff1e27]' : 'bg-white/20'
              }`}
            >
              <span
                className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  isEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* 5. ป้าย (Badge) */}
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-semibold text-white/80">ป้าย</label>
            <div className="relative">
              <select
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-xs sm:text-sm text-white focus:outline-none focus:border-[#ff1e27] transition-colors appearance-none cursor-pointer pr-9"
              >
                <option value="ไม่มี" className="bg-[#111] text-white">ไม่มี</option>
                <option value="HOT" className="bg-[#111] text-white">HOT</option>
                <option value="VIP" className="bg-[#111] text-white">VIP</option>
                <option value="NEW" className="bg-[#111] text-white">NEW</option>
                <option value="POPULAR" className="bg-[#111] text-white">POPULAR</option>
                <option value="SRC" className="bg-[#111] text-white">SRC</option>
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/40">
                <Tag className="size-4" />
              </div>
            </div>
          </div>

          {/* 6. หมวดหมู่หลัก (Parent Category) */}
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-semibold text-white/80">หมวดหมู่หลัก</label>
            <div className="relative">
              <select
                value={parentCategory}
                onChange={(e) => setParentCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-xs sm:text-sm text-white focus:outline-none focus:border-[#ff1e27] transition-colors appearance-none cursor-pointer pr-9"
              >
                <option value="ไม่มี (หมวดหมู่หลัก)" className="bg-[#111] text-white">ไม่มี (หมวดหมู่หลัก)</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name} className="bg-[#111] text-white">
                    {c.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/40">
                <Folder className="size-4" />
              </div>
            </div>
          </div>

          {/* 7. เอฟเฟกต์ (Effect) */}
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-semibold text-white/80">เอฟเฟกต์</label>
            <div className="relative">
              <select
                value={effect}
                onChange={(e) => setEffect(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-xs sm:text-sm text-white focus:outline-none focus:border-[#ff1e27] transition-colors appearance-none cursor-pointer pr-9"
              >
                <option value="ไม่มี" className="bg-[#111] text-white">ไม่มี</option>
                <option value="sparkles" className="bg-[#111] text-white">ประกายระยิบระยับ (Sparkles)</option>
                <option value="glow" className="bg-[#111] text-white">เรืองแสงนีออน (Glow)</option>
                <option value="pulse" className="bg-[#111] text-white">ชีพจรกะพริบ (Pulse)</option>
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/40">
                <Sparkles className="size-4 text-[#ff1e27]" />
              </div>
            </div>
          </div>

          {/* Submit Button (Original Red btn-primary) */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary w-full h-11 rounded-xl text-white text-sm font-bold shadow-lg shadow-[#ff1e27]/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>กำลังบันทึกข้อมูล...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-4" />
                  <span>{editingCategory ? 'บันทึกการแก้ไข' : 'เพิ่มหมวดหมู่'}</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
