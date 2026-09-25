import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Image as ImageIcon, 
  Layers, 
  Sparkles, 
  Crown, 
  Waves, 
  CircleSlash, 
  Coins, 
  Gift, 
  Link as LinkIcon, 
  Search, 
  Check, 
  Plus, 
  Video, 
  Percent, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  Package,
  Trash2,
  Upload,
  Folder,
  Tag,
  ChevronDown,
  HelpCircle
} from 'lucide-react';
import { ProductItem, CategoryItem } from '../../lib/store.ts';

interface AdminProductModalProps {
  isOpen: boolean;
  editingProduct: ProductItem | null;
  categories: CategoryItem[];
  allProducts?: ProductItem[];
  onClose: () => void;
  onSave: (prod: Partial<ProductItem>, id?: string) => Promise<void>;
}

export const AdminProductModal: React.FC<AdminProductModalProps> = ({
  isOpen,
  editingProduct,
  categories,
  allProducts = [],
  onClose,
  onSave
}) => {
  // Main form fields matching uploaded images
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [badge, setBadge] = useState('ไม่มี');
  const [effect, setEffect] = useState<'none' | 'aurora' | 'gold' | 'rainbow_aura'>('none');
  const [isEffectDropdownOpen, setIsEffectDropdownOpen] = useState(false);
  const [isBadgeDropdownOpen, setIsBadgeDropdownOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  const [price, setPrice] = useState('0');
  const [wholesalePrice, setWholesalePrice] = useState('0');
  
  // USER REQUIREMENT: ลิงก์ดาวน์โหลดจะไม่จำกัดว่าจะเป็นแค่ลิงก์ก็ได้ สามารถเขียนข้อความได้ไม่จำกัด
  const [downloadContent, setDownloadContent] = useState('');
  
  const [videoUrl, setVideoUrl] = useState('');
  const [discountPercent, setDiscountPercent] = useState('0');

  // Points & Promotion
  const [allowPoints, setAllowPoints] = useState(false);
  const [pointPrice, setPointPrice] = useState('0');
  const [promoBuyCount, setPromoBuyCount] = useState('0');
  const [promoFreeCount, setPromoFreeCount] = useState('0');

  // 5 Toggles from screenshot
  const [isActive, setIsActive] = useState(true);
  const [showSalesCount, setShowSalesCount] = useState(false);
  const [isUnderMaintenance, setIsUnderMaintenance] = useState(false);
  const [isOrderProduct, setIsOrderProduct] = useState(false);
  const [requiresInput, setRequiresInput] = useState(false);

  // Images
  const [imageUrl, setImageUrl] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Related Products (0/8)
  const [relatedProductIds, setRelatedProductIds] = useState<string[]>([]);
  const [relatedSearch, setRelatedSearch] = useState('');

  // Stock
  const [stock, setStock] = useState('50');

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setErrorMsg(null);
    setIsEffectDropdownOpen(false);
    setIsBadgeDropdownOpen(false);
    setIsCategoryDropdownOpen(false);

    if (editingProduct) {
      setName(editingProduct.name || '');
      setDescription(editingProduct.description || '');
      setCategoryId(editingProduct.categoryId || (categories[0]?.id || ''));
      setBadge(editingProduct.badge || 'ไม่มี');
      setEffect(editingProduct.effect || 'none');
      setPrice(String(editingProduct.price ?? 0));
      setWholesalePrice(String(editingProduct.wholesalePrice ?? 0));
      setDownloadContent(editingProduct.downloadContent || editingProduct.downloadUrl || '');
      setVideoUrl(editingProduct.videoUrl || '');
      setDiscountPercent(String(editingProduct.discountPercent ?? 0));
      setAllowPoints(Boolean(editingProduct.allowPoints));
      setPointPrice(String(editingProduct.pointPrice ?? 0));
      setPromoBuyCount(String(editingProduct.promoBuyCount ?? 0));
      setPromoFreeCount(String(editingProduct.promoFreeCount ?? 0));
      setIsActive(editingProduct.status !== 'hidden');
      setShowSalesCount(Boolean(editingProduct.showSalesCount));
      setIsUnderMaintenance(Boolean(editingProduct.isUnderMaintenance));
      setIsOrderProduct(Boolean(editingProduct.isOrderProduct));
      setRequiresInput(Boolean(editingProduct.requiresInput));
      setImageUrl(editingProduct.imageUrl || '');
      setImages(editingProduct.images || (editingProduct.imageUrl ? [editingProduct.imageUrl] : []));
      setRelatedProductIds(editingProduct.relatedProductIds || []);
      setStock(String(editingProduct.stock ?? 50));
    } else {
      setName('');
      setDescription('');
      setCategoryId(categories[0]?.id || '');
      setBadge('ไม่มี');
      setEffect('none');
      setPrice('0');
      setWholesalePrice('0');
      setDownloadContent('');
      setVideoUrl('');
      setDiscountPercent('0');
      setAllowPoints(false);
      setPointPrice('0');
      setPromoBuyCount('0');
      setPromoFreeCount('0');
      setIsActive(true);
      setShowSalesCount(false);
      setIsUnderMaintenance(false);
      setIsOrderProduct(false);
      setRequiresInput(false);
      setImageUrl('');
      setImages([]);
      setRelatedProductIds([]);
      setStock('50');
    }
  }, [editingProduct, categories, isOpen]);

  if (!isOpen) return null;

  // Handle Image Upload / Drag and Drop
  const handleFileSelect = (file: File) => {
    if (!file) return;
    if (file.size > 30 * 1024 * 1024) {
      setErrorMsg('ขนาดไฟล์ภาพต้องไม่เกิน 30MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImageUrl(result);
      setImages(prev => [result, ...prev.filter(img => img !== result)].slice(0, 5));
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  // Toggle Related Product (Up to 8)
  const toggleRelatedProduct = (prodId: string) => {
    if (relatedProductIds.includes(prodId)) {
      setRelatedProductIds(relatedProductIds.filter(id => id !== prodId));
    } else {
      if (relatedProductIds.length >= 8) {
        setErrorMsg('สามารถเลือกสินค้าที่เกี่ยวข้องได้สูงสุด 8 รายการ');
        return;
      }
      setRelatedProductIds([...relatedProductIds, prodId]);
    }
  };

  const filteredCatalogForRelated = allProducts
    .filter(p => !editingProduct || p.id !== editingProduct.id)
    .filter(p => !relatedSearch.trim() || p.name.toLowerCase().includes(relatedSearch.toLowerCase()));

  // Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('กรุณากรอกชื่อสินค้า');
      return;
    }

    const priceNum = Math.max(0, parseFloat(price) || 0);
    const wholesalePriceNum = Math.max(0, parseFloat(wholesalePrice) || 0);
    const discountNum = Math.min(100, Math.max(0, parseFloat(discountPercent) || 0));
    const stockNum = Math.max(0, parseInt(stock, 10) || 0);

    const primaryImg = imageUrl.trim() || (images[0] || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80');

    setSaving(true);
    setErrorMsg(null);

    try {
      const selectedCategoryObj = categories.find(c => c.id === categoryId);

      const payload: Partial<ProductItem> = {
        name: name.trim(),
        description: description.trim(),
        categoryId: categoryId || (categories[0]?.id || ''),
        categoryName: selectedCategoryObj?.name || '',
        price: priceNum,
        wholesalePrice: wholesalePriceNum,
        stock: stockNum,
        imageUrl: primaryImg,
        images: images.length > 0 ? images : [primaryImg],
        effect,
        badge: badge === 'ไม่มี' ? '' : badge.trim(),
        downloadUrl: downloadContent.trim(), // Can be URL or text/script code
        downloadContent: downloadContent.trim(), // Unlimited custom text, script, or key
        videoUrl: videoUrl.trim(),
        discountPercent: discountNum,
        allowPoints,
        pointPrice: Math.max(0, parseInt(pointPrice, 10) || 0),
        promoBuyCount: parseInt(promoBuyCount, 10) || 0,
        promoFreeCount: parseInt(promoFreeCount, 10) || 0,
        showSalesCount,
        isUnderMaintenance,
        isOrderProduct,
        requiresInput,
        relatedProductIds,
        status: isActive ? (stockNum <= 0 ? 'out_of_stock' : 'active') : 'hidden',
        isRecommended: true
      };

      await onSave(payload, editingProduct?.id);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการบันทึกสินค้า');
    } finally {
      setSaving(false);
    }
  };

  const selectedCategoryName = categories.find(c => c.id === categoryId)?.name || 'เลือกหมวดหมู่';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#09090c] border border-white/10 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col text-white">
        
        {/* Header - Red Original Style */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-[#0d0d12]">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-xl bg-gradient-to-r from-[#ff1e27] to-[#dc141c] text-white flex items-center justify-center shadow-lg shadow-[#ff1e27]/25">
              <Package className="size-4" />
            </div>
            <h3 className="font-heading text-lg font-bold text-white tracking-wide">
              {editingProduct ? 'แก้ไขข้อมูลสินค้า' : 'เพิ่มสินค้าใหม่'}
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

        {/* Error message banner */}
        {errorMsg && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-white/10">
          
          {/* 1. รูปภาพ (Matching Screenshot 1) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-white/90 block">
              รูปภาพ
            </label>

            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFileSelect(f);
              }}
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="hidden"
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center min-h-[170px] ${
                isDragging 
                  ? 'border-[#ff1e27] bg-[#ff1e27]/10' 
                  : imageUrl 
                  ? 'border-white/15 bg-black/40 hover:border-[#ff1e27]/50' 
                  : 'border-white/15 bg-[#0e0e14] hover:border-[#ff1e27]/40 hover:bg-[#12121a]'
              }`}
            >
              {imageUrl ? (
                <div className="relative group w-full flex flex-col items-center">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="max-h-48 rounded-xl object-contain shadow-lg"
                  />
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors"
                    >
                      เปลี่ยนรูปภาพ
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setImageUrl('');
                        setImages([]);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-xs font-semibold text-red-300 transition-colors"
                    >
                      ลบรูป
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="size-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 mb-3 group-hover:scale-105 transition-transform">
                    <ImageIcon className="size-6 text-white/60" />
                  </div>
                  <p className="text-sm font-bold text-white">
                    คลิก/ลากวาง เพื่ออัปโหลดรูป
                  </p>
                  <p className="text-xs text-white/40 mt-1">
                    รองรับ PNG, JPG, GIF, WebP ขนาดไม่เกิน 30MB
                  </p>
                </>
              )}
            </div>

            {/* Direct URL input */}
            <div className="pt-1">
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value);
                  if (e.target.value.trim()) {
                    setImages(prev => [e.target.value.trim(), ...prev.filter(img => img !== e.target.value.trim())].slice(0, 5));
                  }
                }}
                placeholder="หรือวาง URL รูปภาพที่นี่ (https://...)"
                className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-white/80 placeholder:text-white/30 focus:outline-none focus:border-[#ff1e27]"
              />
            </div>
          </div>

          {/* 2. ชื่อสินค้า * (Matching Screenshot 1) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-white/90 block">
              ชื่อสินค้า <span className="text-[#ff1e27]">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="กรอกชื่อสินค้า"
              className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#ff1e27] transition-colors"
            />
          </div>

          {/* 3. คำอธิบาย (Matching Screenshot 1) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-white/90 block">
              คำอธิบาย
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="คำอธิบายสินค้า (สามารถเว้นวรรคได้)"
              className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#ff1e27] transition-colors resize-y leading-relaxed"
            />
          </div>

          {/* 4. หมวดหมู่ * (Matching Screenshot 2 - with folder icon) */}
          <div className="space-y-1.5 relative">
            <label className="text-xs font-semibold text-white/90 block">
              หมวดหมู่ <span className="text-[#ff1e27]">*</span>
            </label>
            
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsCategoryDropdownOpen(!isCategoryDropdownOpen);
                  setIsEffectDropdownOpen(false);
                  setIsBadgeDropdownOpen(false);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-sm text-white flex items-center justify-between hover:border-white/20 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <div className="size-6 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <Folder className="size-3.5 text-white/80" />
                  </div>
                  <span className="truncate">{selectedCategoryName}</span>
                </div>
                <ChevronDown className={`size-4 text-white/40 transition-transform ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isCategoryDropdownOpen && (
                <div className="absolute z-30 left-0 right-0 mt-1 rounded-xl bg-[#121217] border border-white/15 shadow-2xl py-1 max-h-48 overflow-y-auto">
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setCategoryId(c.id);
                        setIsCategoryDropdownOpen(false);
                      }}
                      className={`w-full px-3.5 py-2 text-left text-xs font-medium flex items-center justify-between hover:bg-white/10 transition-colors ${
                        categoryId === c.id ? 'text-[#ff1e27] bg-[#ff1e27]/10 font-bold' : 'text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Folder className="size-3.5 opacity-60" />
                        <span>{c.name}</span>
                      </div>
                      {categoryId === c.id && <Check className="size-3.5 text-[#ff1e27]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 5. ป้าย (Matching Screenshot 2 - with ban/tag icon) */}
          <div className="space-y-1.5 relative">
            <label className="text-xs font-semibold text-white/90 block">
              ป้าย
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsBadgeDropdownOpen(!isBadgeDropdownOpen);
                  setIsCategoryDropdownOpen(false);
                  setIsEffectDropdownOpen(false);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-sm text-white flex items-center justify-between hover:border-white/20 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="size-6 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    {badge === 'ไม่มี' || !badge ? (
                      <CircleSlash className="size-3.5 text-white/60" />
                    ) : (
                      <Tag className="size-3.5 text-[#ff1e27]" />
                    )}
                  </div>
                  <span>{badge || 'ไม่มี'}</span>
                </div>
                <ChevronDown className={`size-4 text-white/40 transition-transform ${isBadgeDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isBadgeDropdownOpen && (
                <div className="absolute z-30 left-0 right-0 mt-1 rounded-xl bg-[#121217] border border-white/15 shadow-2xl py-1 max-h-48 overflow-y-auto">
                  {['ไม่มี', 'แนะนำ', 'ขายดี', 'มาใหม่', 'ลดราคา', 'VIP', 'แจกฟรี', 'SRC (Source Code)'].map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => {
                        setBadge(b);
                        setIsBadgeDropdownOpen(false);
                      }}
                      className={`w-full px-3.5 py-2 text-left text-xs font-medium flex items-center justify-between hover:bg-white/10 transition-colors ${
                        badge === b ? 'text-[#ff1e27] bg-[#ff1e27]/10 font-bold' : 'text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {b === 'ไม่มี' ? <CircleSlash className="size-3.5 opacity-50" /> : <Tag className="size-3.5 text-[#ff1e27]" />}
                        <span>{b}</span>
                      </div>
                      {badge === b && <Check className="size-3.5 text-[#ff1e27]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 6. เอฟเฟกต์ (Matching Screenshot 3 - with Aurora, Gold, Rainbow Aura, None) */}
          <div className="space-y-1.5 relative">
            <label className="text-xs font-semibold text-white/90 block">
              เอฟเฟกต์
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsEffectDropdownOpen(!isEffectDropdownOpen);
                  setIsCategoryDropdownOpen(false);
                  setIsBadgeDropdownOpen(false);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-sm text-white flex items-center justify-between hover:border-white/20 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="size-6 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    {effect === 'none' && <CircleSlash className="size-3.5 text-white/60" />}
                    {effect === 'aurora' && <Waves className="size-3.5 text-cyan-400" />}
                    {effect === 'gold' && <Crown className="size-3.5 text-amber-400" />}
                    {effect === 'rainbow_aura' && <Sparkles className="size-3.5 text-pink-400" />}
                  </div>
                  <span>
                    {effect === 'none' && 'ไม่มี'}
                    {effect === 'aurora' && 'Aurora'}
                    {effect === 'gold' && 'การ์ดทอง'}
                    {effect === 'rainbow_aura' && 'Aura สายรุ้ง'}
                  </span>
                </div>
                <ChevronDown className={`size-4 text-white/40 transition-transform ${isEffectDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isEffectDropdownOpen && (
                <div className="absolute z-30 left-0 right-0 mt-1 rounded-xl bg-[#121217] border border-white/15 shadow-2xl py-1 overflow-hidden">
                  {[
                    { id: 'none', label: 'ไม่มี', icon: CircleSlash, color: 'text-white/60' },
                    { id: 'aurora', label: 'Aurora', icon: Waves, color: 'text-cyan-400' },
                    { id: 'gold', label: 'การ์ดทอง', icon: Crown, color: 'text-amber-400' },
                    { id: 'rainbow_aura', label: 'Aura สายรุ้ง', icon: Sparkles, color: 'text-pink-400' },
                  ].map((eff) => {
                    const EffIcon = eff.icon;
                    const isSelected = effect === eff.id;
                    return (
                      <button
                        key={eff.id}
                        type="button"
                        onClick={() => {
                          setEffect(eff.id as any);
                          setIsEffectDropdownOpen(false);
                        }}
                        className={`w-full px-3.5 py-2.5 text-left text-xs font-medium flex items-center justify-between hover:bg-white/10 transition-colors ${
                          isSelected ? 'bg-white/10 text-white font-bold' : 'text-white/80'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="size-6 rounded-full bg-white/5 flex items-center justify-center">
                            <EffIcon className={`size-3.5 ${eff.color}`} />
                          </div>
                          <span>{eff.label}</span>
                        </div>
                        {isSelected && <Check className="size-4 text-[#ff1e27]" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* 7. ราคา * (0) & 8. ราคาขายส่ง (0) (Matching Screenshot 2 & 3) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/90 block">
                ราคา <span className="text-[#ff1e27]">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="any"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0"
                className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#ff1e27] transition-colors font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/90 block">
                ราคาขายส่ง
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={wholesalePrice}
                onChange={(e) => setWholesalePrice(e.target.value)}
                placeholder="0"
                className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#ff1e27] transition-colors font-mono"
              />
            </div>
          </div>

          {/* 9. ลิงก์ดาวน์โหลด (USER NOTE: ลิงก์ดาวน์โหลดจะไม่จำกัดว่าจะเป็นแค่ลิงก์ก็ได้ สามารถเขียนข้อความได้ไม่จำกัด) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-white/90 block">
                ลิงก์ดาวน์โหลด
              </label>
              <span className="text-[11px] text-[#ff1e27] font-medium">
                ใส่ได้ทั้ง URL และข้อความ/สคริปต์ไม่จำกัด
              </span>
            </div>
            <textarea
              rows={3}
              value={downloadContent}
              onChange={(e) => setDownloadContent(e.target.value)}
              placeholder="https://example.com/download หรือเขียนข้อความ / สคริปต์โค้ด / คีย์ ได้ไม่จำกัด"
              className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#ff1e27] transition-colors font-mono leading-relaxed"
            />
          </div>

          {/* 10. ลิงก์วิดีโอ (Matching Screenshot 3) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-white/90 block">
              ลิงก์วิดีโอ
            </label>
            <input
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#ff1e27] transition-colors font-mono"
            />
          </div>

          {/* 11. ส่วนลด (%) (Matching Screenshot 3) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-white/90 block">
              ส่วนลด (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={discountPercent}
              onChange={(e) => setDiscountPercent(e.target.value)}
              placeholder="0"
              className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#ff1e27] transition-colors font-mono"
            />
          </div>

          {/* 12. ระบบแต้ม (Matching Screenshot 4 - with coin icon and toggle) */}
          <div className="p-4 rounded-xl border border-white/10 bg-[#0d0d12] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="size-7 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center">
                  <Coins className="size-4" />
                </div>
                <div>
                  <span className="text-xs sm:text-sm font-semibold text-white block">ระบบแต้ม</span>
                  <span className="text-[11px] text-white/50">อนุญาตให้ซื้อด้วยแต้ม</span>
                </div>
              </div>

              {/* Original Red Toggle Switch */}
              <button
                type="button"
                role="switch"
                aria-checked={allowPoints}
                onClick={() => setAllowPoints(!allowPoints)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  allowPoints ? 'bg-[#ff1e27]' : 'bg-white/20'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    allowPoints ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {allowPoints && (
              <div className="pt-2 border-t border-white/5 space-y-1">
                <label className="text-xs text-white/80 block">แต้มที่ต้องใช้สำหรับสินค้านี้</label>
                <input
                  type="number"
                  min="0"
                  value={pointPrice}
                  onChange={(e) => setPointPrice(e.target.value)}
                  placeholder="0"
                  className="w-full px-3.5 py-2 rounded-xl bg-black/60 border border-white/10 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#ff1e27] font-mono"
                />
              </div>
            )}
          </div>

          {/* 13. โปรโมชั่นซื้อแถม (Matching Screenshot 4) */}
          <div className="p-4 sm:p-5 rounded-xl border border-white/10 bg-[#0d0d12] space-y-3">
            <div className="flex items-center gap-2">
              <Gift className="size-4 text-[#ff1e27]" />
              <span className="text-xs sm:text-sm font-bold text-white">โปรโมชันซื้อแถม</span>
            </div>

            <div className="space-y-3 pt-1">
              <div className="space-y-1">
                <label className="text-xs text-white/80 block">ซื้อจำนวน (ชิ้น)</label>
                <input
                  type="number"
                  min="0"
                  value={promoBuyCount}
                  onChange={(e) => setPromoBuyCount(e.target.value)}
                  placeholder="0"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#ff1e27] font-mono"
                />
                <span className="text-[10px] text-white/40 block">จำนวนสินค้าที่ต้องซื้อเพื่อรับโปรโมชัน (0 = ปิดโปรโมชัน)</span>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-white/80 block">แถมจำนวน (ชิ้น)</label>
                <input
                  type="number"
                  min="0"
                  value={promoFreeCount}
                  onChange={(e) => setPromoFreeCount(e.target.value)}
                  placeholder="0"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#ff1e27] font-mono"
                />
                <span className="text-[10px] text-white/40 block">จำนวนสินค้าที่จะแถมให้ (0 = ปิดโปรโมชัน)</span>
              </div>
            </div>
          </div>

          {/* 14. 5 Toggles in Red Original Theme (Matching Screenshot 4) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl border border-white/10 bg-[#0d0d12]">
            {/* เปิดใช้งาน */}
            <div className="flex items-center justify-between p-1.5">
              <span className="text-xs font-semibold text-white/90">เปิดใช้งาน</span>
              <button
                type="button"
                role="switch"
                aria-checked={isActive}
                onClick={() => setIsActive(!isActive)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isActive ? 'bg-[#ff1e27]' : 'bg-white/20'
                }`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isActive ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            {/* แสดงยอดขาย */}
            <div className="flex items-center justify-between p-1.5">
              <span className="text-xs font-semibold text-white/90">แสดงยอดขาย</span>
              <button
                type="button"
                role="switch"
                aria-checked={showSalesCount}
                onClick={() => setShowSalesCount(!showSalesCount)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  showSalesCount ? 'bg-[#ff1e27]' : 'bg-white/20'
                }`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${showSalesCount ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            {/* กำลังปรับปรุง */}
            <div className="flex items-center justify-between p-1.5">
              <span className="text-xs font-semibold text-white/90">กำลังปรับปรุง</span>
              <button
                type="button"
                role="switch"
                aria-checked={isUnderMaintenance}
                onClick={() => setIsUnderMaintenance(!isUnderMaintenance)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isUnderMaintenance ? 'bg-[#ff1e27]' : 'bg-white/20'
                }`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isUnderMaintenance ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            {/* สินค้าแบบออเดอร์ */}
            <div className="flex items-center justify-between p-1.5">
              <span className="text-xs font-semibold text-white/90">สินค้าแบบออเดอร์</span>
              <button
                type="button"
                role="switch"
                aria-checked={isOrderProduct}
                onClick={() => setIsOrderProduct(!isOrderProduct)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isOrderProduct ? 'bg-[#ff1e27]' : 'bg-white/20'
                }`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isOrderProduct ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            {/* จำเป็นต้องกรอกข้อมูล */}
            <div className="flex items-center justify-between p-1.5 sm:col-span-2 border-t border-white/5 pt-2.5">
              <span className="text-xs font-semibold text-white/90">จำเป็นต้องกรอกข้อมูล</span>
              <button
                type="button"
                role="switch"
                aria-checked={requiresInput}
                onClick={() => setRequiresInput(!requiresInput)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  requiresInput ? 'bg-[#ff1e27]' : 'bg-white/20'
                }`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${requiresInput ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            {/* Subtext description as seen in screenshot */}
            <div className="sm:col-span-2 pt-1">
              <span className="text-[10px] text-white/40 block">
                &lt;&lt;กำลังปรับปรุง&gt;&gt; เปิด = ปิดการซื้อชั่วคราว / ปิด = ขายได้ตามปกติ
              </span>
            </div>
          </div>

          {/* 15. สินค้าที่เกี่ยวข้อง (Matching Screenshot 4) */}
          <div className="p-4 sm:p-5 rounded-xl border border-white/10 bg-[#0d0d12] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LinkIcon className="size-4 text-[#ff1e27]" />
                <span className="text-xs sm:text-sm font-bold text-white">สินค้าที่เกี่ยวข้อง</span>
              </div>
              <span className="text-xs font-mono font-bold text-white/60">
                {relatedProductIds.length}/8
              </span>
            </div>
            <p className="text-[11px] text-white/40">
              ถ้าว่าง = ไม่แสดงส่วนสินค้าที่เกี่ยวข้องบนหน้าร้าน
            </p>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={relatedSearch}
                  onChange={(e) => setRelatedSearch(e.target.value)}
                  placeholder="ค้นหาสินค้าเพื่อเพิ่ม..."
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#ff1e27]"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-white/40" />
              </div>
              <button
                type="button"
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#ff1e27] to-[#dc141c] hover:brightness-110 text-xs font-bold text-white transition-all shadow-md shadow-[#ff1e27]/25 cursor-pointer"
              >
                ค้นหา
              </button>
            </div>

            {/* Related Products List (Matching "Sample Product" item in screenshot) */}
            <div className="max-h-44 overflow-y-auto space-y-1.5 scrollbar-thin scrollbar-thumb-white/10 pt-1">
              {filteredCatalogForRelated.length === 0 ? (
                <div className="text-center py-4 text-xs text-white/30">
                  ไม่พบสินค้าอื่นในระบบ
                </div>
              ) : (
                filteredCatalogForRelated.map((p) => {
                  const isSelected = relatedProductIds.includes(p.id);
                  return (
                    <div
                      key={p.id}
                      onClick={() => toggleRelatedProduct(p.id)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#ff1e27]/60 bg-[#ff1e27]/10 text-white'
                          : 'border-white/5 bg-black/40 hover:border-white/20 text-white/70'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        {p.imageUrl ? (
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="size-7 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="size-7 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center text-white/60">
                            <HelpCircle className="size-3.5" />
                          </div>
                        )}
                        <span className="text-xs font-medium truncate">{p.name}</span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-mono text-white/50">฿{p.price}</span>
                        {isSelected ? (
                          <div className="size-5 rounded-md bg-[#ff1e27] text-white flex items-center justify-center">
                            <Check className="size-3" />
                          </div>
                        ) : (
                          <div className="size-5 rounded-md bg-white/10 text-white/60 flex items-center justify-center hover:bg-white/20">
                            <Plus className="size-3" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Stock Input */}
          <div className="space-y-1.5 pt-1">
            <label className="text-xs font-semibold text-white/70 block">
              จำนวนสต็อกคงเหลือ
            </label>
            <input
              type="number"
              min="0"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              placeholder="50"
              className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#ff1e27] font-mono"
            />
          </div>

          {/* Submit Button (Original Red Theme) */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary w-full h-12 rounded-xl text-white font-bold text-sm shadow-xl shadow-[#ff1e27]/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="size-4" />
              <span>{saving ? 'กำลังบันทึกข้อมูล...' : 'บันทึกสินค้า'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
