import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Key, 
  ExternalLink, 
  Check, 
  Copy, 
  X, 
  Edit3, 
  Trash2, 
  Sparkles,
  ShoppingBag,
  Send,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Play,
  Gift,
  Coins,
  FileText,
  Download,
  Link as LinkIcon,
  Wrench
} from 'lucide-react';
import { ProductItem, CategoryItem, createOrder } from '../lib/store.ts';
import { type FirebaseUser } from '../lib/firebase.ts';
import { ProductCard } from '../components/ProductCard.tsx';

interface ProductDetailPageProps {
  product: ProductItem;
  category?: CategoryItem | null;
  allProducts?: ProductItem[];
  currentUser?: FirebaseUser | null;
  isOwner?: boolean;
  onNavigateHome: () => void;
  onNavigateCategories: () => void;
  onNavigateCategory: (catId: string) => void;
  onNavigateBack?: () => void;
  onSelectProduct?: (product: ProductItem) => void;
  onOpenPurchase?: (product: ProductItem, quantity: number) => void;
  onEditProduct?: (product: ProductItem) => void;
  onDeleteProduct?: (id: string, name: string) => void;
  onShowToast?: (msg: string) => void;
  onRequireLogin?: () => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  category,
  allProducts = [],
  currentUser,
  isOwner = false,
  onNavigateHome,
  onNavigateCategories,
  onNavigateCategory,
  onSelectProduct,
  onOpenPurchase,
  onEditProduct,
  onDeleteProduct,
  onShowToast,
  onRequireLogin
}) => {
  const [quantity, setQuantity] = useState(1);
  const [customInputVal, setCustomInputVal] = useState('');
  const [customNoteVal, setCustomNoteVal] = useState('');
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [deliveredKey, setDeliveredKey] = useState<string | null>(null);
  const [customSubmitted, setCustomSubmitted] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState<string | null>(null);

  // รองรับรูปภาพปกหลายรูปภาพ สามารถใส่ได้สูงสุด 5 รูป
  const allImages = useMemo(() => {
    const list: string[] = [];
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      list.push(...product.images.filter(Boolean));
    } else if (product.imageUrl) {
      list.push(product.imageUrl);
    }
    if (list.length === 0) {
      list.push('https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80');
    }
    return list.slice(0, 5);
  }, [product.images, product.imageUrl]);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const activeImage = allImages[activeImageIndex] || allImages[0];

  // Helper for YouTube embed
  const youtubeEmbedUrl = useMemo(() => {
    if (!product.videoUrl) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = product.videoUrl.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
  }, [product.videoUrl]);

  // Related Products (max 8)
  const relatedProducts = useMemo(() => {
    if (!product.relatedProductIds || product.relatedProductIds.length === 0) return [];
    return allProducts.filter(p => product.relatedProductIds?.includes(p.id) && p.id !== product.id);
  }, [product.relatedProductIds, allProducts, product.id]);

  // ตรวจจับการเลื่อนหน้าจอ: พอเลื่อนลง ทั้งแถบ +- และปุ่มสั่งซื้อจะซ่อนไปด้วยกัน เลื่อนขึ้นจะกลับมาเหมือนเดิม
  const [showBottomBar, setShowBottomBar] = useState(true);
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          // เลื่อนลงเกิน 50px ให้ซ่อนแถบด้านล่างทั้งหมด (ทั้งปุ่มเพิ่มจำนวน +- และปุ่มสั่งซื้อ)
          if (currentScrollY > lastScrollYRef.current + 6 && currentScrollY > 50) {
            setShowBottomBar(false);
          } else if (currentScrollY < lastScrollYRef.current - 6 || currentScrollY <= 50) {
            // เลื่อนขึ้น หรืออยู่ที่ขอบบนสุดให้แสดงแถบกลับมาเหมือนเดิม
            setShowBottomBar(true);
          }
          lastScrollYRef.current = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const numPrice = Number(product.price || 0);
  const numOrigPrice = Number(product.originalPrice || 0);
  const isOutOfStock = (product.stock ?? 0) <= 0 || product.status === 'out_of_stock';
  const categoryTitle = category?.name || product.categoryName || 'Category 1 / หมวดหมู่ที่ 1';
  const categoryId = category?.id || product.categoryId || 'category-1';

  const discountPercent = numOrigPrice > numPrice
    ? Math.round(((numOrigPrice - numPrice) / numOrigPrice) * 100)
    : null;

  const purchaseType = product.purchaseType || 'standard';

  const handleDecrease = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleIncrease = () => {
    if (quantity < (product.stock || 99)) {
      setQuantity(quantity + 1);
    }
  };

  // 2. รูปแบบคีย์: จัดส่ง License Key ทันที
  const handlePurchaseKey = async () => {
    if (onOpenPurchase) {
      onOpenPurchase(product, quantity);
      return;
    }

    if (!currentUser && onRequireLogin) {
      onRequireLogin();
      return;
    }

    setIsPurchasing(true);
    try {
      const generatedKey = product.keyFormat?.trim() 
        ? `${product.keyFormat.trim()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
        : `XECUTE-VIP-${Math.random().toString(36).substring(2, 7).toUpperCase()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

      setDeliveredKey(generatedKey);

      if (currentUser) {
        await createOrder({
          userId: currentUser.uid,
          userEmail: currentUser.email || 'member@xecutelab.store',
          productId: product.id,
          productName: product.name,
          amount: numPrice * quantity,
          status: 'completed',
          keyIssued: generatedKey
        });
      }

      if (onShowToast) onShowToast('จัดส่ง License Key เรียบร้อยแล้ว!');
    } catch (err: any) {
      if (onShowToast) onShowToast('เกิดข้อผิดพลาดในการสร้างคำสั่งซื้อ: ' + err.message);
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleCopyKey = () => {
    if (!deliveredKey) return;
    navigator.clipboard.writeText(deliveredKey);
    setCopiedKey(true);
    if (onShowToast) onShowToast('คัดลอก License Key ลงคลิปบอร์ดแล้ว');
    setTimeout(() => setCopiedKey(false), 2500);
  };

  // 3. รูปแบบปุ่ม: ลิงก์ภายนอก หรือ Discord Ticket
  const handleButtonClick = () => {
    if (product.buttonLink) {
      const a = document.createElement('a');
      a.href = product.buttonLink;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      if (onShowToast) onShowToast(`ดำเนินการ: ${product.buttonText || 'สั่งซื้อสินค้า'}`);
    }
  };

  // 4. รูปแบบ Custom: ฟอร์มกรอกข้อมูลผู้ซื้อ
  const handleCustomSubmit = async () => {
    if (!customInputVal.trim()) {
      if (onShowToast) onShowToast(`กรุณากรอก ${product.customFieldLabel || 'ข้อมูลผู้ซื้อ'}`);
      return;
    }
    if (!currentUser && onRequireLogin) {
      onRequireLogin();
      return;
    }

    setIsPurchasing(true);
    try {
      const generatedOrderCode = 'CUST-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      if (currentUser) {
        await createOrder({
          userId: currentUser.uid,
          userEmail: currentUser.email || 'member@xecutelab.store',
          productId: product.id,
          productName: `${product.name} [${customInputVal}]`,
          amount: numPrice * quantity,
          status: 'pending',
          keyIssued: `Buyer: ${customInputVal} | Note: ${customNoteVal || '-'}`
        });
      }
      setCustomSubmitted(true);
      if (onShowToast) onShowToast(product.customSuccessMessage || 'ส่งคำสั่งซื้อเรียบร้อยแล้ว ทีมงานกำลังดำเนินการ!');
    } catch (err: any) {
      if (onShowToast) onShowToast('เกิดข้อผิดพลาดในการส่งคำสั่งซื้อ: ' + err.message);
    } finally {
      setIsPurchasing(false);
    }
  };

  // 1. รูปแบบ Standard
  const handleStandardBuy = async () => {
    if (onOpenPurchase) {
      onOpenPurchase(product, quantity);
      return;
    }

    if (!currentUser && onRequireLogin) {
      onRequireLogin();
      return;
    }

    setIsPurchasing(true);
    try {
      const generatedCode = 'ORD-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      if (currentUser) {
        await createOrder({
          userId: currentUser.uid,
          userEmail: currentUser.email || 'member@xecutelab.store',
          productId: product.id,
          productName: product.name,
          amount: numPrice * quantity,
          status: 'completed',
          keyIssued: product.downloadUrl || generatedCode
        });
      }
      setPurchaseSuccess(generatedCode);
      if (onShowToast) onShowToast(`สั่งซื้อ ${product.name} จำนวน ${quantity} ชิ้น เรียบร้อยแล้ว!`);
    } catch (err: any) {
      if (onShowToast) onShowToast('เกิดข้อผิดพลาดในการสั่งซื้อ: ' + err.message);
    } finally {
      setIsPurchasing(false);
    }
  };

  // ปุ่มแบบธีมออริจินอลของเว็บ (Original Theme Button - Red 3D Gradient)
  const renderActionButton = (isMobile: boolean = false) => {
    if (product.isUnderMaintenance) {
      return (
        <button 
          className={`w-full ${isMobile ? 'h-10 text-sm' : 'h-12 text-base'} rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-400 font-bold flex items-center justify-center cursor-not-allowed gap-2`}
          type="button" 
          disabled
        >
          <Wrench className="size-4 shrink-0" />
          <span>งดรับคำสั่งซื้อ (กำลังปรับปรุง)</span>
        </button>
      );
    }

    if (isOutOfStock) {
      return (
        <button 
          className={`w-full ${isMobile ? 'h-10 text-sm' : 'h-12 text-base'} rounded-xl bg-white/5 border border-white/10 text-white/40 font-bold flex items-center justify-center cursor-not-allowed`}
          type="button" 
          disabled
        >
          <span>สินค้าหมด</span>
        </button>
      );
    }

    switch (purchaseType) {
      case 'key':
        return (
          <button
            type="button"
            disabled={isPurchasing}
            onClick={handlePurchaseKey}
            className={`btn-primary w-full ${isMobile ? 'h-10 text-sm' : 'h-12 text-base'} rounded-xl font-bold text-white shadow-lg shadow-[#ff1e27]/30 cursor-pointer active:scale-[0.98] transition-all`}
          >
            <div className="flex items-center justify-center gap-2">
              <Key className="size-4 shrink-0" />
              <span>{isPurchasing ? 'กำลังประมวลผล...' : (product.buttonText || 'สั่งซื้อและรับ License Key ทันที')}</span>
            </div>
          </button>
        );

      case 'button':
        return (
          <button
            type="button"
            onClick={handleButtonClick}
            className={`btn-primary w-full ${isMobile ? 'h-10 text-sm' : 'h-12 text-base'} rounded-xl font-bold text-white shadow-lg shadow-[#ff1e27]/30 cursor-pointer active:scale-[0.98] transition-all`}
          >
            <div className="flex items-center justify-center gap-2">
              {product.buttonLink && <ExternalLink className="size-4 shrink-0" />}
              <span>{product.buttonText || 'สั่งซื้อสินค้านี้'}</span>
            </div>
          </button>
        );

      case 'custom':
        return (
          <button
            type="button"
            disabled={isPurchasing}
            onClick={() => handleCustomSubmit()}
            className={`btn-primary w-full ${isMobile ? 'h-10 text-sm' : 'h-12 text-base'} rounded-xl font-bold text-white shadow-lg shadow-[#ff1e27]/30 cursor-pointer active:scale-[0.98] transition-all`}
          >
            <div className="flex items-center justify-center gap-2">
              <Send className="size-4 shrink-0" />
              <span>{isPurchasing ? 'กำลังบันทึก...' : (product.buttonText || 'ยืนยันและส่งคำสั่งซื้อ')}</span>
            </div>
          </button>
        );

      case 'standard':
      default:
        return (
          <button
            type="button"
            disabled={isPurchasing}
            onClick={handleStandardBuy}
            className={`btn-primary w-full ${isMobile ? 'h-10 text-sm' : 'h-12 text-base'} rounded-xl font-bold text-white shadow-lg shadow-[#ff1e27]/30 cursor-pointer active:scale-[0.98] transition-all`}
          >
            <div className="flex items-center justify-center gap-2">
              <ShoppingBag className="size-4 shrink-0" />
              <span>{isPurchasing ? 'กำลังสั่งซื้อ...' : (product.buttonText || 'ซื้อสินค้า')}</span>
            </div>
          </button>
        );
    }
  };

  return (
    <div className="container p-page space-y-4 md:space-y-5 max-w-6xl mx-auto transition-opacity duration-300">
      
      {/* =========================================================================
          TOP NAVIGATION: BREADCRUMB TRAIL (ไม่มีปุ่มย้อนกลับตามที่ขอ)
          ========================================================================= */}
      <ol className="flex flex-wrap items-center gap-y-2 whitespace-nowrap" aria-label="Breadcrumb">
        {/* 1. หน้าแรก */}
        <li className="inline-flex items-center">
          <a 
            className="text-subtitle flex items-center gap-2 text-sm hover:text-primary focus:text-primary focus:outline-hidden transition-colors cursor-pointer" 
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onNavigateHome();
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
              <path d="M219.31,108.68l-80-80a16,16,0,0,0-22.62,0l-80,80A15.87,15.87,0,0,0,32,120v96a8,8,0,0,0,8,8h64a8,8,0,0,0,8-8V160h32v56a8,8,0,0,0,8,8h64a8,8,0,0,0,8-8V120A15.87,15.87,0,0,0,219.31,108.68ZM208,208H160V152a8,8,0,0,0-8-8H104a8,8,0,0,0-8,8v56H48V120l80-80,80,80Z"></path>
            </svg>
            <span className="line-clamp-1 max-w-65">หน้าแรก</span>
          </a>
          <svg className="text-subtitle mx-2 size-4 shrink-0 overflow-visible" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m9 18 6-6-6-6"></path>
          </svg>
        </li>

        {/* 2. หมวดหมู่ทั้งหมด */}
        <li className="inline-flex items-center">
          <a 
            className="text-subtitle flex items-center gap-2 text-sm hover:text-primary focus:text-primary focus:outline-hidden transition-colors cursor-pointer" 
            href="/categories"
            onClick={(e) => {
              e.preventDefault();
              onNavigateCategories();
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
              <path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,160H40V56H216V200ZM176,88a48,48,0,0,1-96,0,8,8,0,0,1,16,0,32,32,0,0,0,64,0,8,8,0,0,1,16,0Z"></path>
            </svg>
            <span className="line-clamp-1 max-w-65">หมวดหมู่ทั้งหมด</span>
          </a>
          <svg className="text-subtitle mx-2 size-4 shrink-0 overflow-visible" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m9 18 6-6-6-6"></path>
          </svg>
        </li>

        {/* 3. หมวดหมู่ปัจจุบัน เช่น Category 1 / หมวดหมู่ที่ 1 */}
        <li className="inline-flex items-center">
          <a 
            className="text-subtitle flex items-center gap-2 text-sm hover:text-primary focus:text-primary focus:outline-hidden transition-colors cursor-pointer" 
            href={`/categories/${categoryId}`}
            onClick={(e) => {
              e.preventDefault();
              onNavigateCategory(categoryId);
            }}
          >
            <span className="line-clamp-1 max-w-65">{categoryTitle}</span>
          </a>
          <svg className="text-subtitle mx-2 size-4 shrink-0 overflow-visible" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m9 18 6-6-6-6"></path>
          </svg>
        </li>

        {/* 4. รหัสสินค้า / ชื่อสินค้า (Current Page) */}
        <li className="inline-flex items-center">
          <a 
            className="text-subtitle flex items-center gap-2 text-sm hover:text-primary focus:text-primary focus:outline-hidden font-medium text-white transition-colors" 
            aria-current="page" 
            href={`/home/${categoryId}/${product.id}`}
            onClick={(e) => e.preventDefault()}
          >
            <span className="line-clamp-1 max-w-65">{product.name}</span>
          </a>
        </li>
      </ol>

      {/* Admin Action Bar */}
      {isOwner && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-[#ff1e27]/10 border border-[#ff1e27]/30 text-xs">
          <div className="flex items-center gap-2 font-semibold text-white">
            <Sparkles className="size-4 text-[#ff1e27]" />
            <span>โหมดผู้ดูแลระบบ: ปรับแต่งหน้านี้ได้โดยตรง</span>
          </div>
          <div className="flex items-center gap-2">
            {onEditProduct && (
              <button
                type="button"
                onClick={() => onEditProduct(product)}
                className="btn-primary h-8 px-3 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="size-3.5" />
                <span>แก้ไขสินค้านี้</span>
              </button>
            )}
            {onDeleteProduct && (
              <button
                type="button"
                onClick={() => onDeleteProduct(product.id, product.name)}
                className="h-8 px-3 rounded-lg border border-white/15 bg-white/5 hover:bg-red-500/20 text-white/70 hover:text-red-400 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Trash2 className="size-3.5" />
                <span>ลบสินค้า</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          MAIN PRODUCT SECTION (Desktop 12 Columns: 5 cols Left, 7 cols Right)
          ========================================================================= */}
      <section className="space-y-5 pb-36 md:pb-0">
        <div className="grid gap-6 md:grid-cols-12">
          
          {/* =====================================================================
              LEFT COLUMN: Product Image Gallery (รองรับสูงสุด 5 รูป) & Zoom (md:col-span-5)
              ===================================================================== */}
          <div className="md:col-span-5">
            <div className="sticky top-18 space-y-3">
              {/* Main Active Image */}
              <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#0d0d12] shadow-xl group">
                <button 
                  type="button" 
                  aria-label="ขยายรูปภาพสินค้า" 
                  onClick={() => setIsZoomOpen(true)}
                  className="relative block w-full cursor-zoom-in overflow-hidden"
                >
                  <img 
                    alt={product.name} 
                    className="mx-auto aspect-square w-full object-cover transition-all duration-300 group-hover:scale-103" 
                    src={activeImage} 
                  />

                  {/* Top-left Emblem Badge */}
                  <div className="absolute top-2.5 left-2.5 size-7 rounded-lg bg-black/70 backdrop-blur-md border border-white/15 flex items-center justify-center text-white shadow-sm pointer-events-none">
                    <svg className="size-3.5 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2L14.5 8.5L21.5 9.5L16.5 14.5L18 21.5L12 18L6 21.5L7.5 14.5L2.5 9.5L9.5 8.5L12 2Z" />
                    </svg>
                  </div>

                  {/* Top-right Discount Tag */}
                  {discountPercent && (
                    <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-lg bg-amber-500 text-black text-[11px] font-bold font-mono shadow-md pointer-events-none">
                      -{discountPercent}%
                    </span>
                  )}

                  {/* Bottom custom badge (เฉพาะที่มีการระบุ และไม่ใช่ 'ถาวร') */}
                  {product.badge && product.badge !== 'ถาวร' && (
                    <span className="absolute left-2.5 bottom-2.5 px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-md border border-white/15 text-[11px] font-bold text-white shadow-md pointer-events-none">
                      {product.badge}
                    </span>
                  )}

                  {/* Zoom Pill Button */}
                  <span className="fi pointer-events-none absolute right-2 bottom-2 gap-1 rounded-full bg-black/60 px-2.5 py-1 text-xs text-white backdrop-blur-sm border border-white/10 group-hover:bg-black/80 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256">
                      <path d="M152,112a8,8,0,0,1-8,8H120v24a8,8,0,0,1-16,0V120H80a8,8,0,0,1,0-16h24V80a8,8,0,0,1,16,0v24h24A8,8,0,0,1,152,112Zm77.66,117.66a8,8,0,0,1-11.32,0l-50.06-50.07a88.11,88.11,0,1,1,11.31-11.31l50.07,50.06A8,8,0,0,1,229.66,229.66ZM112,184a72,72,0,1,0-72-72A72.08,72.08,0,0,0,112,184Z"></path>
                    </svg>
                    ขยายรูปภาพ
                  </span>
                </button>
              </div>

              {/* Gallery Thumbnails (รองรับสูงสุด 5 รูป) */}
              {allImages.length > 1 && (
                <div className="grid grid-cols-5 gap-2">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-200 cursor-pointer ${
                        activeImageIndex === idx
                          ? 'border-[#ff1e27] ring-2 ring-[#ff1e27]/40 scale-102 shadow-lg shadow-[#ff1e27]/25'
                          : 'border-white/10 hover:border-white/30 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                      <span className="absolute bottom-0.5 right-1 text-[9px] font-mono font-bold text-white/70 bg-black/60 px-1 rounded">
                        {idx + 1}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* =====================================================================
              RIGHT COLUMN: Product Info & Buy Form (md:col-span-7)
              ===================================================================== */}
          <div className="space-y-4 md:col-span-7">
            
            {/* Title & Price Header */}
            <section className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-white font-heading">
                {product.name}
              </h1>
              <section className="fi flex-wrap gap-2 pt-1">
                <p className="flex items-center gap-1.5 text-xl sm:text-2xl font-medium text-primary font-mono">
                  {numPrice.toLocaleString()} <span className="text-base font-sans text-white/80">บาท</span>
                </p>
                {numOrigPrice > numPrice && (
                  <span className="text-sm text-white/40 line-through font-mono self-center">
                    {numOrigPrice.toLocaleString()} บาท
                  </span>
                )}
                {purchaseType === 'key' && (
                  <span className="text-xs text-amber-400 font-semibold px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 ml-2 inline-flex items-center gap-1">
                    <Key className="size-3 text-amber-400" />
                    <span>รูปแบบคีย์ (Key System)</span>
                  </span>
                )}
              </section>
            </section>

            {/* Optional Custom Notice Box */}
            {product.customNoticeBox && (
              <div className="p-3.5 rounded-xl bg-[#ff1e27]/10 border border-[#ff1e27]/30 text-xs sm:text-sm text-white/90 flex items-start gap-2.5">
                <AlertCircle className="size-4 text-[#ff1e27] shrink-0 mt-0.5" />
                <div className="leading-relaxed">{product.customNoticeBox}</div>
              </div>
            )}

            {/* Maintenance Warning Banner if Under Maintenance */}
            {product.isUnderMaintenance && (
              <div className="p-4 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs sm:text-sm flex items-center gap-3">
                <Wrench className="size-5 shrink-0 text-amber-400" />
                <div>
                  <span className="font-bold text-white block">สินค้านี้กำลังปิดปรับปรุงชั่วคราว</span>
                  <span className="text-white/70 text-xs">ขออภัยในความไม่สะดวก ระบบงดรับคำสั่งซื้อสินค้านี้ชั่วคราว</span>
                </div>
              </div>
            )}

            {/* Buy X Get Y Free Promotion Banner */}
            {Boolean(product.promoBuyCount && product.promoBuyCount > 0 && product.promoFreeCount && product.promoFreeCount > 0) && (
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#ff1e27]/20 to-[#dc141c]/10 border border-[#ff1e27]/30 text-xs sm:text-sm flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="size-7 rounded-lg bg-[#ff1e27] text-white flex items-center justify-center shrink-0 shadow-md shadow-[#ff1e27]/40">
                    <Gift className="size-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">โปรโมชันพิเศษ ซื้อแถม!</span>
                    <span className="text-white/70 text-xs">ซื้อครบทุกๆ {product.promoBuyCount} ชิ้น แถมฟรี {product.promoFreeCount} ชิ้น</span>
                  </div>
                </div>
                {quantity >= (product.promoBuyCount || 1) && (
                  <span className="px-2.5 py-1 rounded-lg bg-[#ff1e27] text-white font-bold text-xs shrink-0 shadow-md">
                    แถมฟรี +{Math.floor(quantity / (product.promoBuyCount || 1)) * (product.promoFreeCount || 0)} ชิ้น
                  </span>
                )}
              </div>
            )}

            {/* Points Allowance Info */}
            {product.allowPoints && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs flex items-center justify-between text-white/90">
                <div className="flex items-center gap-2">
                  <Coins className="size-4 text-amber-400" />
                  <span>สินค้านี้รองรับการชำระด้วยแต้มสะสม</span>
                </div>
                <span className="font-mono font-bold text-amber-400">
                  {product.pointPrice ? `${product.pointPrice.toLocaleString()} แต้ม` : 'ใช้แต้มแลกได้'}
                </span>
              </div>
            )}

            {/* 1. สามารถปรับแต่งหน้าสินค้าหรือเขียนอะไรก็ได้: รายละเอียดสินค้า CARD */}
            <section className="space-y-2">
              <div className="rounded-xl border border-white/10 bg-card text-card-foreground shadow-xs space-y-3 p-4">
                <div className="fi gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="text-primary size-5">
                    <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm16-40a8,8,0,0,1-8,8,16,16,0,0,1-16-16V128a8,8,0,0,1,0-16,16,16,0,0,1,16,16v40A8,8,0,0,1,144,176ZM112,84a12,12,0,1,1,12,12A12,12,0,0,1,112,84Z"></path>
                  </svg>
                  <h2 className="text-subtitle font-medium text-sm sm:text-base">รายละเอียดสินค้า</h2>
                </div>

                <div className="whitespace-pre-line text-xs sm:text-sm text-white/80 leading-relaxed">
                  <div className="scoped-html-content space-y-2">
                    {product.customContent ? (
                      <div className="space-y-2">
                        {product.customContent}
                      </div>
                    ) : (
                      <p>{product.description || 'ไม่มีคำอธิบายเพิ่มเติมสำหรับสินค้านี้'}</p>
                    )}
                  </div>
                </div>

                {/* Feature Tags */}
                {product.tags && product.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/5">
                    {product.tags.map((t, idx) => (
                      <span 
                        key={idx} 
                        className="px-2.5 py-0.5 rounded-md text-[11px] font-mono bg-white/5 border border-white/10 text-white/70 inline-flex items-center gap-1"
                      >
                        <Check className="size-3 text-emerald-400" />
                        <span>{t}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Optional Video Preview Section */}
            {product.videoUrl && (
              <div className="rounded-xl border border-white/10 bg-card p-4 space-y-3 shadow-xs">
                <div className="fi gap-2">
                  <Play className="size-4 text-[#ff1e27] fill-[#ff1e27]" />
                  <h3 className="font-heading font-bold text-sm sm:text-base text-white">วิดีโอตัวอย่างสินค้า</h3>
                </div>
                {youtubeEmbedUrl ? (
                  <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-white/10 bg-black">
                    <iframe
                      src={youtubeEmbedUrl}
                      title={product.name}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  </div>
                ) : (
                  <a
                    href={product.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-secondary h-10 px-4 rounded-xl text-xs flex items-center justify-center gap-2 text-white"
                  >
                    <ExternalLink className="size-3.5" />
                    <span>เปิดดูวิดีโอตัวอย่างบน YouTube</span>
                  </a>
                )}
              </div>
            )}

            {/* ===================================================================
                BUY FORM SECTION (2.คีย์, 3.ปุ่ม, 4.custom)
                =================================================================== */}
            <form id="product-buy-form" onSubmit={(e) => { e.preventDefault(); }} className="space-y-4">
              <section>
                <div className="rounded-xl border border-white/10 bg-card text-card-foreground shadow-xs space-y-4 p-4">
                  
                  {/* Quantity Controller (ธีมออริจินอลของเว็บ) */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-subtitle text-xs sm:text-sm">
                      <p className="text-subtitle font-medium">จำนวนสินค้า</p>
                      <span className="font-mono text-xs">
                        คงเหลือ <strong className={isOutOfStock ? "text-destructive" : "text-white/90"}>{product.stock ?? 0}</strong> ชิ้น
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Decrement Button (ธีมออริจินอล) */}
                      <button 
                        className="btn-secondary size-10 rounded-xl font-bold text-white shrink-0 p-0 cursor-pointer shadow-md disabled:opacity-40" 
                        type="button" 
                        aria-label="ลดจำนวน" 
                        disabled={quantity <= 1 || isOutOfStock}
                        onClick={handleDecrease}
                      >
                        <span className="text-lg leading-none">−</span>
                      </button>

                      {/* Number Input (ธีมออริจินอล) */}
                      <input 
                        className="flex h-10 rounded-xl border border-white/15 bg-[#0d0d12] px-3 py-2 text-sm text-center w-full font-mono font-bold text-white focus:border-[#ff1e27] focus:outline-none shadow-inner" 
                        inputMode="numeric" 
                        min="1" 
                        max={product.stock || 99} 
                        step="1" 
                        aria-label="จำนวนสินค้า" 
                        disabled={isOutOfStock} 
                        type="number" 
                        value={quantity}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 1;
                          setQuantity(Math.max(1, Math.min(val, product.stock || 99)));
                        }}
                      />

                      {/* Increment Button (ธีมออริจินอล) */}
                      <button 
                        className="btn-secondary size-10 rounded-xl font-bold text-white shrink-0 p-0 cursor-pointer shadow-md disabled:opacity-40" 
                        type="button" 
                        aria-label="เพิ่มจำนวน" 
                        disabled={quantity >= (product.stock || 99) || isOutOfStock}
                        onClick={handleIncrease}
                      >
                        <span className="text-lg leading-none">+</span>
                      </button>
                    </div>

                    {/* Stock Status text */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
                      <p className="text-xs text-white/50">
                        {isOutOfStock ? 'สินค้าหมดชั่วคราว' : 'มีสินค้าพร้อมจำหน่าย'}
                      </p>
                      {!isOutOfStock && (
                        <p className="text-sm text-white/70 font-mono">
                          ราคารวม: <strong className="text-white">{(numPrice * quantity).toLocaleString()}</strong> บาท
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 4. รูปแบบ Custom: แสดงช่องกรอกข้อมูลสำหรับลูกค้า */}
                  {purchaseType === 'custom' && (
                    <div className="p-3.5 rounded-xl bg-[#141418] border border-white/10 space-y-3">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                        <Send className="size-3.5 text-primary" />
                        <span>ระบุข้อมูลคำสั่งซื้อเพิ่มเติม:</span>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-white/80 mb-1">
                          {product.customFieldLabel || 'ข้อมูลเพิ่มเติมสำหรับผู้ขาย:'}
                        </label>
                        <input
                          type="text"
                          value={customInputVal}
                          onChange={(e) => setCustomInputVal(e.target.value)}
                          placeholder={product.customFieldPlaceholder || 'เช่น Roblox Username / Discord Tag'}
                          className="w-full bg-[#0d0d12] border border-white/15 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:border-primary focus:outline-none"
                        />
                      </div>

                      {product.customNoteLabel && (
                        <div>
                          <label className="block text-xs font-medium text-white/80 mb-1">
                            {product.customNoteLabel}
                          </label>
                          <textarea
                            rows={2}
                            value={customNoteVal}
                            onChange={(e) => setCustomNoteVal(e.target.value)}
                            placeholder="ระบุข้อความหรือหมายเหตุเพิ่มเติม..."
                            className="w-full bg-[#0d0d12] border border-white/15 rounded-xl p-2.5 text-xs text-white focus:border-primary focus:outline-none resize-none"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Buy Button (ธีมออริจินอลของเว็บ) */}
                  <div>
                    {renderActionButton(false)}
                  </div>

                  {/* 2. รูปแบบคีย์: License Key Delivery Card */}
                  {deliveredKey && (
                    <div className="p-4 rounded-xl bg-[#ff1e27]/10 border border-[#ff1e27]/30 space-y-3 animate-fade-in">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-white font-bold text-xs sm:text-sm">
                          <Key className="size-4 text-primary" />
                          <span>License Key ของคุณ:</span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                          พร้อมใช้งาน
                        </span>
                      </div>

                      <div className="flex items-center gap-2 p-2.5 rounded-lg bg-black/75 border border-white/15 font-mono text-xs sm:text-sm text-white select-all">
                        <span className="truncate flex-1 font-bold text-[#ff3b42]">{deliveredKey}</span>
                        <button
                          type="button"
                          onClick={handleCopyKey}
                          className="btn-primary px-3 py-1 rounded-lg text-white text-xs font-bold flex items-center gap-1 cursor-pointer shrink-0"
                        >
                          {copiedKey ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                          <span>{copiedKey ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                        </button>
                      </div>
                      <p className="text-[11px] text-white/60 flex items-center gap-1.5">
                        <Sparkles className="size-3 text-amber-400" />
                        <span>นำคีย์นี้ไปกรอกใน Key System ของสคริปต์เพื่อปลดล็อกสิทธิ์ใช้งาน</span>
                      </p>
                    </div>
                  )}

                  {/* 4. รูปแบบ Custom: Success Banner */}
                  {customSubmitted && (
                    <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
                      <Check className="size-4 text-emerald-400 shrink-0" />
                      <span>{product.customSuccessMessage || 'บันทึกคำสั่งซื้อของคุณเรียบร้อยแล้ว ทีมงานกำลังดำเนินการ!'}</span>
                    </div>
                  )}

                  {/* 1. Standard Buy Success Banner */}
                  {purchaseSuccess && (
                    <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs space-y-2.5 animate-fade-in">
                      <div className="flex items-center gap-1.5 font-bold text-sm">
                        <Check className="size-4 text-emerald-400 shrink-0" />
                        <span>สั่งซื้อสำเร็จ! หมายเลขคำสั่งซื้อ: {purchaseSuccess}</span>
                      </div>
                      {(product.downloadContent || product.downloadUrl) && (
                        <div className="pt-2 text-xs text-white/90 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white flex items-center gap-1.5">
                              <FileText className="size-3.5 text-emerald-400" />
                              <span>ข้อมูลการดาวน์โหลด / รายละเอียดการรับสินค้า:</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(product.downloadContent || product.downloadUrl || '');
                                if (onShowToast) onShowToast('คัดลอกข้อมูลเรียบร้อยแล้ว');
                              }}
                              className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white font-mono text-[10px] flex items-center gap-1 cursor-pointer"
                            >
                              <Copy className="size-3" />
                              <span>คัดลอก</span>
                            </button>
                          </div>

                          {(product.downloadContent || product.downloadUrl)?.startsWith('http') && (
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
                          )}

                          <div className="p-3.5 rounded-xl bg-black/85 border border-white/15 font-mono text-xs whitespace-pre-wrap break-all select-all text-emerald-300 max-h-56 overflow-y-auto leading-relaxed">
                            {product.downloadContent || product.downloadUrl}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              </section>
            </form>

          </div>

        </div>

        {/* =====================================================================
            RELATED PRODUCTS SECTION (สินค้าที่เกี่ยวข้อง สูงสุด 8 รายการ)
            ===================================================================== */}
        {relatedProducts.length > 0 && (
          <div className="mt-12 pt-8 border-t border-white/10 space-y-4 text-left">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LinkIcon className="size-5 text-[#ff1e27]" />
                <h3 className="font-heading text-lg sm:text-xl font-bold text-white">
                  สินค้าที่เกี่ยวข้อง
                </h3>
              </div>
              <span className="text-xs text-white/40 font-mono">
                {relatedProducts.length} รายการ
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {relatedProducts.map((relProd) => (
                <ProductCard
                  key={relProd.id}
                  product={relProd}
                  isOwner={isOwner}
                  onSelect={(p) => {
                    onSelectProduct?.(p);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  onEdit={onEditProduct}
                  onDelete={onDeleteProduct}
                />
              ))}
            </div>
          </div>
        )}

        {/* =====================================================================
            MOBILE FIXED BOTTOM BAR
            - พอเลื่อนลง ทั้งปุ่มเพิ่มจำนวน +- และปุ่มสั่งซื้อจะซ่อนลงไปด้านล่างแบบสมูท
            - พอเลื่อนขึ้น ทั้งหมดจะเลื่อนกลับมาแสดงเหมือนเดิม
            ===================================================================== */}
        <div 
          className={`fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#0d0d12]/95 px-4 pt-2.5 pb-[calc(env(safe-area-inset-bottom)+0.6rem)] backdrop-blur-md md:hidden shadow-2xl transition-all duration-300 ease-in-out transform ${
            showBottomBar 
              ? 'translate-y-0 opacity-100 pointer-events-auto' 
              : 'translate-y-full opacity-0 pointer-events-none'
          }`}
        >
          <div className="space-y-2">
            
            {/* Top row: แถบ +- และราคา */}
            <div className="flex items-center justify-between gap-3 pb-1">
              <div className="min-w-0">
                <p className="font-bold text-primary font-mono text-sm sm:text-base">
                  {(numPrice * quantity).toLocaleString()} บาท
                  <span className="text-subtitle text-xs font-sans font-normal ml-1">({quantity} ชิ้น)</span>
                </p>
              </div>

              {/* Mobile Quantity selector (ธีมออริจินอลของเว็บ) */}
              <div className="flex items-center gap-1.5">
                <button 
                  className="btn-secondary size-8 rounded-lg font-bold text-white shrink-0 p-0 cursor-pointer disabled:opacity-40" 
                  type="button" 
                  aria-label="ลดจำนวน" 
                  disabled={quantity <= 1 || isOutOfStock}
                  onClick={handleDecrease}
                >
                  <span className="text-base leading-none">−</span>
                </button>

                <input 
                  className="flex rounded-lg border border-white/15 bg-[#141418] px-2 py-1 text-xs text-center h-8 w-12 font-mono font-bold text-white focus:outline-none" 
                  inputMode="numeric" 
                  min="1" 
                  max={product.stock || 99} 
                  step="1" 
                  aria-label="จำนวนสินค้า" 
                  disabled={isOutOfStock} 
                  type="number" 
                  value={quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 1;
                    setQuantity(Math.max(1, Math.min(val, product.stock || 99)));
                  }}
                />

                <button 
                  className="btn-secondary size-8 rounded-lg font-bold text-white shrink-0 p-0 cursor-pointer disabled:opacity-40" 
                  type="button" 
                  aria-label="เพิ่มจำนวน" 
                  disabled={quantity >= (product.stock || 99) || isOutOfStock}
                  onClick={handleIncrease}
                >
                  <span className="text-base leading-none">+</span>
                </button>
              </div>
            </div>

            {/* Bottom row: ปุ่มกดซื้อธีมออริจินอลของเว็บ */}
            <div className="w-full">
              {renderActionButton(true)}
            </div>

          </div>
        </div>

      </section>

      {/* =========================================================================
          IMAGE EXPAND LIGHTBOX MODAL (รองรับสลับดูภาพทั้ง 5 รูปพร้อมอนิเมชั่นสมูท)
          ========================================================================= */}
      {isZoomOpen && (
        <div 
          onClick={() => setIsZoomOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-fade-in cursor-zoom-out"
        >
          <div className="relative max-w-3xl w-full flex flex-col items-center gap-3" onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsZoomOpen(false)}
              className="absolute -top-11 right-0 p-2 rounded-xl text-white/70 hover:text-white bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
            >
              <X className="size-5" />
            </button>

            {/* Zoom Image Viewport with Previous/Next Arrows */}
            <div className="relative w-full rounded-2xl border border-white/20 overflow-hidden bg-black shadow-2xl flex items-center justify-center">
              <img
                src={activeImage}
                alt={product.name}
                className="w-full max-h-[75vh] object-contain transition-all duration-300"
              />

              {allImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 size-10 rounded-full bg-black/70 hover:bg-[#ff1e27] text-white flex items-center justify-center transition-all cursor-pointer shadow-lg border border-white/20"
                    title="รูปก่อนหน้า"
                  >
                    <ChevronLeft className="size-6" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImageIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 size-10 rounded-full bg-black/70 hover:bg-[#ff1e27] text-white flex items-center justify-center transition-all cursor-pointer shadow-lg border border-white/20"
                    title="รูปถัดไป"
                  >
                    <ChevronRight className="size-6" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails in Zoom Modal */}
            {allImages.length > 1 && (
              <div className="flex items-center gap-2 p-1.5 rounded-xl bg-black/60 border border-white/10 backdrop-blur-md">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`size-12 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                      activeImageIndex === idx 
                        ? 'border-[#ff1e27] scale-105 shadow-md shadow-[#ff1e27]/40' 
                        : 'border-white/20 opacity-50 hover:opacity-90'
                    }`}
                  >
                    <img src={img} alt={`Thumb ${idx + 1}`} className="size-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
