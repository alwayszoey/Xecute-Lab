import React, { useState, useMemo } from 'react';
import { 
  ShoppingCart, 
  Check, 
  Copy, 
  Download, 
  ArrowLeft, 
  Loader2, 
  AlertCircle, 
  Package, 
  Image as ImageIcon,
  CheckCircle2,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { 
  ProductItem, 
  createOrder, 
  claimAvailableKeysForOrder 
} from '../lib/store.ts';
import { type FirebaseUser } from '../lib/firebase.ts';

interface PurchasePageProps {
  initialProduct: ProductItem | null;
  allProducts: ProductItem[];
  currentUser: FirebaseUser | null;
  initialQuantity?: number;
  onNavigateHome: () => void;
  onNavigateAccount?: () => void;
  onShowToast?: (msg: string) => void;
}

export const PurchasePage: React.FC<PurchasePageProps> = ({
  initialProduct,
  allProducts,
  currentUser,
  initialQuantity = 1,
  onNavigateHome,
  onNavigateAccount,
  onShowToast
}) => {
  // If initialProduct is null, default to first available product
  const [selectedProductId, setSelectedProductId] = useState<string>(
    initialProduct?.id || (allProducts.length > 0 ? allProducts[0].id : '')
  );
  const [quantity, setQuantity] = useState<number>(Math.max(1, initialQuantity));
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Success state
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [billNumber, setBillNumber] = useState<string>('');
  const [purchasedKeys, setPurchasedKeys] = useState<string[]>([]);
  const [purchasedProductSnapshot, setPurchasedProductSnapshot] = useState<{
    name: string;
    quantity: number;
    pricePerUnit: number;
    totalAmount: number;
    downloadUrl?: string;
    downloadContent?: string;
  } | null>(null);

  const product = useMemo(() => {
    return allProducts.find(p => p.id === selectedProductId) || initialProduct || null;
  }, [allProducts, selectedProductId, initialProduct]);

  // Pricing calculations
  const unitPrice = useMemo(() => {
    if (!product) return 0;
    if (product.wholesalePrice && quantity >= 5) {
      return product.wholesalePrice;
    }
    return product.price || 0;
  }, [product, quantity]);

  const subtotal = unitPrice * quantity;
  const fee = 0;
  const totalAmount = subtotal + fee;

  // Promotion calculation (Buy X get Y Free)
  const freeBonusCount = useMemo(() => {
    if (!product?.promoBuyCount || !product?.promoFreeCount) return 0;
    if (product.promoBuyCount <= 0 || product.promoFreeCount <= 0) return 0;
    return Math.floor(quantity / product.promoBuyCount) * product.promoFreeCount;
  }, [product, quantity]);

  const totalDeliveredCount = quantity + freeBonusCount;

  // Execute Order
  const handleConfirmPurchase = async () => {
    if (!product) {
      setErrorMsg('กรุณาเลือกสินค้าก่อนทำการซื้อ');
      return;
    }

    if (product.isUnderMaintenance) {
      setErrorMsg('สินค้านี้กำลังอยู่ระหว่างการปรับปรุงระบบ งดรับคำสั่งซื้อชั่วคราว');
      return;
    }

    if (product.stock !== undefined && product.stock < quantity) {
      setErrorMsg(`สินค้าคงเหลือไม่เพียงพอ (มีในสต็อก ${product.stock} ชิ้น)`);
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const buyerEmail = currentUser?.email || 'guest@xecute.com';
      const buyerName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'ลูกค้าทั่วไป';

      // 1. Claim keys from stock if available
      const claimedKeys = await claimAvailableKeysForOrder(product.id, totalDeliveredCount, buyerEmail);

      // If no keys in stock, fallback to product download link / content / license
      const finalDeliveredKeys: string[] = [];
      if (claimedKeys.length > 0) {
        finalDeliveredKeys.push(...claimedKeys);
      } else {
        // Fallback placeholder keys or download payload
        for (let i = 0; i < totalDeliveredCount; i++) {
          finalDeliveredKeys.push(
            product.downloadContent || 
            product.downloadUrl || 
            `${product.name.toUpperCase().replace(/\s+/g, '_')}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
          );
        }
      }

      // Generate authentic Bill Number
      const generatedBill = `BILL-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

      // 2. Save order to Firestore
      await createOrder({
        userId: currentUser?.uid || 'guest',
        userEmail: buyerEmail,
        userName: buyerName,
        productId: product.id,
        productName: product.name,
        amount: totalAmount,
        keyIssued: finalDeliveredKeys.join(', '),
        items: [{
          productId: product.id,
          productName: product.name,
          price: unitPrice,
          quantity: quantity,
          subtotal: subtotal
        }],
        totalAmount: totalAmount,
        status: 'completed',
        paymentMethod: 'promptpay',
        licenseKey: finalDeliveredKeys.join(', '),
        deliveredKeys: finalDeliveredKeys,
        downloadUrl: product.downloadUrl,
        downloadContent: product.downloadContent,
        customFields: {
          billNumber: generatedBill,
          freeBonusCount: freeBonusCount
        }
      });

      // Update state to show success screen
      setBillNumber(generatedBill);
      setPurchasedKeys(finalDeliveredKeys);
      setPurchasedProductSnapshot({
        name: product.name,
        quantity: quantity,
        pricePerUnit: unitPrice,
        totalAmount: totalAmount,
        downloadUrl: product.downloadUrl,
        downloadContent: product.downloadContent
      });
      setOrderCompleted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      onShowToast?.('สั่งซื้อสินค้าสำเร็จแล้ว!');
    } catch (err: any) {
      console.error('Purchase error:', err);
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการประมวลผลคำสั่งซื้อ');
    } finally {
      setIsProcessing(false);
    }
  };

  // Copy helper
  const handleCopyAll = () => {
    if (purchasedKeys.length === 0) return;
    navigator.clipboard.writeText(purchasedKeys.join('\n'));
    onShowToast?.('คัดลอกข้อมูลทั้งหมดเรียบร้อยแล้ว');
  };

  const handleCopySingle = (code: string) => {
    navigator.clipboard.writeText(code);
    onShowToast?.('คัดลอกรหัสแล้ว');
  };

  // Download .txt file helper
  const handleDownloadFile = () => {
    if (!purchasedProductSnapshot) return;
    const content = `XECUTE LAB - BILL RECEIPT\n` +
      `หมายเลขบิล: ${billNumber}\n` +
      `สินค้า: ${purchasedProductSnapshot.name}\n` +
      `จำนวน: ${purchasedProductSnapshot.quantity} ชิ้น\n` +
      `ราคารวม: ฿${purchasedProductSnapshot.totalAmount.toLocaleString()}\n` +
      `วันที่: ${new Date().toLocaleString('th-TH')}\n\n` +
      `=== รายการคีย์ / ข้อมูลดาวน์โหลด ===\n` +
      purchasedKeys.map((k, idx) => `#${idx + 1}: ${k}`).join('\n') +
      (purchasedProductSnapshot.downloadUrl ? `\n\nลิงก์ดาวน์โหลด: ${purchasedProductSnapshot.downloadUrl}` : '') +
      (purchasedProductSnapshot.downloadContent ? `\n\nข้อความคำแนะนำ: ${purchasedProductSnapshot.downloadContent}` : '');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${billNumber}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onShowToast?.('เริ่มดาวน์โหลดใบเสร็จและคีย์แล้ว');
  };

  // --------------------------------------------------------------------------
  // SUCCESS SCREEN (ตัวอย่างหน้าสั่งซื้อสำเร็จ - IMG_0595 & HTML)
  // --------------------------------------------------------------------------
  if (orderCompleted && purchasedProductSnapshot) {
    return (
      <div className="w-full px-4 text-left animate-fade-in">
        <div className="max-w-2xl mx-auto pt-8 pb-24 scale-95 sm:scale-100 transition-all">
          
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center bg-[#10b981] shadow-lg shadow-emerald-500/25">
              <Check className="size-6 text-white stroke-[3]" />
            </div>
            <h1 className="text-2xl font-bold mb-1 font-heading text-[#ff1e27]">
              ซื้อสินค้าสำเร็จ!
            </h1>
            <p className="text-sm text-white font-mono">
              หมายเลขบิล: {billNumber}
            </p>
          </div>

          {/* Card 1: รายละเอียดการซื้อ */}
          <div 
            className="rounded-lg p-4 mb-4 bg-white/[0.05]"
            style={{
              boxShadow: 'rgba(255, 30, 39, 0.125) 0px 4px 6px -1px, rgba(255, 30, 39, 0.063) 0px 2px 4px -1px'
            }}
          >
            <h2 className="text-lg font-bold mb-3 font-heading text-[#ff1e27]">
              รายละเอียดการซื้อ
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-1">
              <div>
                <p className="text-xs text-white">สินค้า</p>
                <p className="font-medium text-sm text-white truncate" title={purchasedProductSnapshot.name}>
                  {purchasedProductSnapshot.name}
                </p>
              </div>
              <div>
                <p className="text-xs text-white">จำนวน</p>
                <p className="font-medium text-sm text-white">
                  {purchasedProductSnapshot.quantity} ชิ้น
                </p>
              </div>
              <div>
                <p className="text-xs text-white">ราคาต่อชิ้น</p>
                <p className="font-medium text-sm text-white flex items-center font-mono">
                  ฿{purchasedProductSnapshot.pricePerUnit.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-white">ราคารวม</p>
                <p className="font-bold text-base text-[#ff1e27] flex items-center font-mono">
                  ฿{purchasedProductSnapshot.totalAmount.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: รายละเอียดสินค้า / คีย์สินค้า */}
          <div 
            className="rounded-lg p-4 mb-4 bg-white/[0.05]"
            style={{
              boxShadow: 'rgba(255, 30, 39, 0.125) 0px 4px 6px -1px, rgba(255, 30, 39, 0.063) 0px 2px 4px -1px'
            }}
          >
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <h2 className="text-lg font-bold font-heading text-[#ff1e27]">
                รายละเอียดสินค้า
              </h2>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyAll}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium text-white hover:opacity-90 btn-primary hover:scale-105 transition-all duration-300 ease-in-out flex items-center gap-2 cursor-pointer shadow-md shadow-[#ff1e27]/25"
                >
                  <Copy className="size-3.5" />
                  <span>คัดลอกทั้งหมด</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadFile}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium text-white hover:opacity-90 btn-primary hover:scale-105 transition-all duration-300 ease-in-out flex items-center gap-2 cursor-pointer shadow-md shadow-[#ff1e27]/25"
                >
                  <Download className="size-3.5" />
                  <span>ดาวน์โหลด</span>
                </button>
              </div>
            </div>

            {/* Keys rows */}
            <div className="space-y-2">
              {purchasedKeys.map((keyString, idx) => (
                <div 
                  key={idx}
                  className="p-3 rounded-lg mb-2 bg-white/[0.04] border border-[#ff1e27]/25"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-white font-mono">#{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleCopySingle(keyString)}
                      className="px-2 py-1 text-xs rounded text-white hover:opacity-90 btn-primary flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="size-3 mr-1" />
                      <span>คัดลอก</span>
                    </button>
                  </div>
                  <code 
                    className="font-mono text-xs px-2 py-1 rounded block w-full truncate bg-white/[0.04] text-white border border-white/10 select-all" 
                    title={keyString}
                    style={{
                      boxShadow: 'rgba(255, 30, 39, 0.125) 0px 2px 4px -1px, rgba(255, 30, 39, 0.063) 0px 1px 2px -1px'
                    }}
                  >
                    {keyString}
                  </code>
                </div>
              ))}
            </div>

            {/* If product has external link */}
            {purchasedProductSnapshot.downloadUrl && (
              <div className="pt-2">
                <a
                  href={purchasedProductSnapshot.downloadUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 w-full text-white bg-white/10 hover:bg-white/15 border border-white/15 transition-colors"
                >
                  <ExternalLink className="size-3.5 text-[#ff1e27]" />
                  <span>เปิดลิงก์ดาวน์โหลดต้นฉบับ</span>
                </a>
              </div>
            )}
          </div>

          {/* Action buttons matching user's template */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={onNavigateHome}
              className="px-4 py-2 rounded-lg font-medium text-white btn-primary hover:scale-105 hover:shadow-lg transition-all duration-300 ease-in-out text-sm cursor-pointer shadow-lg shadow-[#ff1e27]/30"
            >
              กลับหน้าหลัก
            </button>
            <button
              type="button"
              onClick={() => {
                if (onNavigateAccount) {
                  onNavigateAccount();
                } else {
                  onNavigateHome();
                }
              }}
              className="px-4 py-2 rounded-lg font-medium text-white hover:scale-105 hover:shadow-lg transition-all duration-300 ease-in-out text-sm bg-transparent border border-white/20 hover:bg-white/10 cursor-pointer"
              style={{
                boxShadow: 'rgba(255, 30, 39, 0.125) 0px 4px 6px -1px, rgba(255, 30, 39, 0.063) 0px 2px 4px -1px'
              }}
            >
              ดูประวัติการซื้อ
            </button>
          </div>

        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // CONFIRMATION SCREEN (ตัวอย่างหน้ายืนยัน - Matching user's HTML)
  // --------------------------------------------------------------------------
  return (
    <div className="w-full px-4 text-left animate-fade-in">
      <div className="max-w-3xl mx-auto pt-8 pb-24 scale-90">
        
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-1 font-heading text-[#ff1e27]">
            ยืนยันการซื้อ
          </h1>
          <p className="text-sm text-white">
            ตรวจสอบรายละเอียดก่อนทำการซื้อ
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3.5 rounded-lg bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2.5 mb-4">
            <AlertCircle className="size-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Product Selector (In case user opened /purchase directly without item) */}
        {allProducts.length > 0 && (
          <div className="mb-4 space-y-1.5">
            <label className="text-xs font-semibold text-white/80">สินค้าที่ต้องการซื้อ</label>
            <div className="relative">
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-black/70 border border-white/20 text-xs sm:text-sm text-white appearance-none cursor-pointer pr-10 focus:outline-none focus:border-[#ff1e27]"
              >
                {allProducts.map((p) => (
                  <option key={p.id} value={p.id} className="bg-[#111] text-white">
                    {p.name} - ฿{p.price.toLocaleString()} ({p.stock ?? 0} ชิ้น)
                  </option>
                ))}
              </select>
              <ChevronDown className="size-4 absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
            </div>
          </div>
        )}

        {/* Card 1: รายละเอียดสินค้า */}
        <div 
          className="rounded-lg p-4 mb-4 bg-white/[0.05]"
          style={{
            boxShadow: 'rgba(255, 30, 39, 0.125) 0px 4px 6px -1px, rgba(255, 30, 39, 0.063) 0px 2px 4px -1px'
          }}
        >
          <h2 className="text-lg font-bold mb-3 font-heading text-[#ff1e27]">
            รายละเอียดสินค้า
          </h2>

          {product ? (
            <div className="flex items-start space-x-3">
              <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-black border border-white/10 flex items-center justify-center">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="size-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#ff1e27]">
                    <ImageIcon className="size-6 text-white text-sm" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold mb-1 font-heading text-[#ff1e27] truncate">
                  {product.name}
                </h3>
                <p className="text-xs mb-1 text-white line-clamp-2">
                  {product.description || 'สินค้าคุณภาพจาก Xecute Lab'}
                </p>

                <div className="flex items-center space-x-3 text-xs flex-wrap text-white">
                  {/* Quantity selector */}
                  <div className="flex items-center gap-1">
                    <span>จำนวน:</span>
                    <div className="inline-flex items-center border border-white/20 rounded bg-black/60 overflow-hidden mx-1">
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-1.5 py-0.5 text-white/70 hover:text-white hover:bg-white/10 cursor-pointer"
                      >
                        -
                      </button>
                      <strong className="px-2 font-mono text-white text-xs">
                        {quantity}
                      </strong>
                      <button
                        type="button"
                        onClick={() => setQuantity(quantity + 1)}
                        className="px-1.5 py-0.5 text-white/70 hover:text-white hover:bg-white/10 cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                    <span>ชิ้น</span>
                  </div>

                  <span>
                    ราคา: <strong>฿{unitPrice.toLocaleString()}</strong> ต่อชิ้น
                  </span>

                  {freeBonusCount > 0 && (
                    <span className="text-[#ff1e27] font-bold text-xs bg-[#ff1e27]/10 px-1.5 py-0.5 rounded border border-[#ff1e27]/30">
                      +แถมฟรี {freeBonusCount} ชิ้น
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-white/50">ไม่พบข้อมูลสินค้า</p>
          )}
        </div>

        {/* Card 2: สรุปคำสั่งซื้อ */}
        <div 
          className="rounded-lg p-4 mb-4 bg-white/[0.05]"
          style={{
            boxShadow: 'rgba(255, 30, 39, 0.125) 0px 4px 6px -1px, rgba(255, 30, 39, 0.063) 0px 2px 4px -1px'
          }}
        >
          <h2 className="text-lg font-bold mb-3 font-heading text-[#ff1e27]">
            สรุปคำสั่งซื้อ
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-white">
              <span>ราคาสินค้า ({quantity} ชิ้น)</span>
              <span>฿{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs text-white">
              <span>ค่าธรรมเนียม</span>
              <span>฿0</span>
            </div>
            <hr className="border-white/10 my-2" />
            <div className="flex justify-between text-base font-bold text-white">
              <span>ราคารวม</span>
              <span className="text-[#ff1e27] font-bold font-mono text-lg">฿{totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons matching user prompt */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={onNavigateHome}
            disabled={isProcessing}
            className="px-4 py-2 rounded-lg font-medium text-white hover:scale-105 hover:shadow-lg transition-all duration-300 ease-in-out text-sm bg-transparent border border-white/20 hover:bg-white/10 cursor-pointer"
            style={{
              boxShadow: 'rgba(255, 30, 39, 0.125) 0px 4px 6px -1px, rgba(255, 30, 39, 0.063) 0px 2px 4px -1px'
            }}
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={handleConfirmPurchase}
            disabled={isProcessing || !product || (product.stock !== undefined && product.stock <= 0)}
            className="px-4 py-2 rounded-lg font-medium text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 hover:shadow-lg transition-all duration-300 ease-in-out text-sm btn-primary flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-[#ff1e27]/30"
          >
            {isProcessing ? (
              <>
                <Loader2 className="size-4 animate-spin mr-1" />
                <span>กำลังดำเนินการ...</span>
              </>
            ) : (
              <>
                <ShoppingCart className="size-4 mr-1" />
                <span>ยืนยันการซื้อ</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
