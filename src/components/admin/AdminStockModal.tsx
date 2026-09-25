import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Plus, 
  Layers, 
  MoreHorizontal, 
  Package, 
  CheckCircle2, 
  List, 
  Search, 
  Copy, 
  Check, 
  Edit2, 
  Trash2, 
  Upload, 
  Download, 
  RefreshCw, 
  Loader2,
  FileText
} from 'lucide-react';
import { 
  ProductItem, 
  LicenseKeyItem, 
  listenLicenseKeys, 
  addSingleLicenseKey, 
  addLicenseKeysBulk, 
  updateLicenseKey, 
  deleteLicenseKey, 
  clearSoldLicenseKeys,
  clearAllProductLicenseKeys,
  syncProductStockFromKeys
} from '../../lib/store.ts';

interface AdminStockModalProps {
  isOpen: boolean;
  product: ProductItem | null;
  onClose: () => void;
  onStockUpdated?: (newStock: number) => void;
  onShowToast?: (msg: string) => void;
}

export const AdminStockModal: React.FC<AdminStockModalProps> = ({
  isOpen,
  product,
  onClose,
  onStockUpdated,
  onShowToast
}) => {
  const [keys, setKeys] = useState<LicenseKeyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Panels
  const [showSingleAdd, setShowSingleAdd] = useState(false);
  const [showBulkAdd, setShowBulkAdd] = useState(false);
  const [showToolsMenu, setShowToolsMenu] = useState(false);

  // Single Add
  const [singleKeyInput, setSingleKeyInput] = useState('');
  const [isSubmittingSingle, setIsSubmittingSingle] = useState(false);

  // Bulk Add
  const [bulkKeysInput, setBulkKeysInput] = useState('');
  const [isSubmittingBulk, setIsSubmittingBulk] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit Single Key
  const [editingKeyId, setEditingKeyId] = useState<string | null>(null);
  const [editingKeyText, setEditingKeyText] = useState('');

  // Copy Feedback
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  // Real-time listener for license keys of this product
  useEffect(() => {
    if (!isOpen || !product) {
      setKeys([]);
      return;
    }

    setLoading(true);
    const unsub = listenLicenseKeys(product.id, (loadedKeys) => {
      setKeys(loadedKeys);
      setLoading(false);
      // Auto report live stock to caller
      const availableCount = loadedKeys.filter(k => !k.isUsed).length;
      onStockUpdated?.(availableCount);
    });

    return () => unsub();
  }, [isOpen, product?.id]);

  if (!isOpen || !product) return null;

  // Stats
  const availableCount = keys.filter(k => !k.isUsed).length;
  const soldCount = keys.filter(k => k.isUsed).length;
  const totalCount = keys.length;

  // Filtered keys by search
  const filteredKeys = keys.filter(k => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      k.keyCode.toLowerCase().includes(q) ||
      (k.usedByEmail && k.usedByEmail.toLowerCase().includes(q))
    );
  });

  // Handlers
  const handleAddSingleKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleKeyInput.trim()) return;
    setIsSubmittingSingle(true);
    try {
      await addSingleLicenseKey(product.id, product.name, singleKeyInput.trim());
      setSingleKeyInput('');
      setShowSingleAdd(false);
      onShowToast?.('เพิ่มคีย์สต็อกเรียบร้อยแล้ว');
    } catch (err: any) {
      alert('เกิดข้อผิดพลาดในการเพิ่มคีย์: ' + err.message);
    } finally {
      setIsSubmittingSingle(false);
    }
  };

  const handleAddBulkKeys = async (e: React.FormEvent) => {
    e.preventDefault();
    const lines = bulkKeysInput
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    if (lines.length === 0) return;
    setIsSubmittingBulk(true);
    try {
      const added = await addLicenseKeysBulk(product.id, product.name, lines);
      setBulkKeysInput('');
      setShowBulkAdd(false);
      onShowToast?.(`เพิ่มคีย์สำเร็จทั้งหมด ${added} รายการ`);
    } catch (err: any) {
      alert('เกิดข้อผิดพลาดในการเพิ่มคีย์: ' + err.message);
    } finally {
      setIsSubmittingBulk(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setBulkKeysInput(content);
        setShowBulkAdd(true);
        onShowToast?.(`โหลดไฟล์สำเร็จ: ${file.name}`);
      }
    };
    reader.readAsText(file);
  };

  const handleToggleKeyStatus = async (keyItem: LicenseKeyItem) => {
    const nextStatus = !keyItem.isUsed;
    await updateLicenseKey(keyItem.id, {
      isUsed: nextStatus,
      productId: product.id,
      usedByEmail: nextStatus ? (keyItem.usedByEmail || 'แอดมินปรับสถานะ') : ''
    });
    onShowToast?.(nextStatus ? 'เปลี่ยนเป็น: ขายแล้ว' : 'เปลี่ยนเป็น: พร้อมขาย');
  };

  const handleSaveEditKey = async (keyId: string) => {
    if (!editingKeyText.trim()) return;
    await updateLicenseKey(keyId, {
      keyCode: editingKeyText.trim(),
      productId: product.id
    });
    setEditingKeyId(null);
    setEditingKeyText('');
    onShowToast?.('แก้ไขคีย์สำเร็จ');
  };

  const handleDeleteKey = async (keyId: string) => {
    if (confirm('คุณต้องการลบคีย์นี้ออกจากสต็อกใช่หรือไม่?')) {
      await deleteLicenseKey(keyId, product.id);
      onShowToast?.('ลบคีย์ออกจากสต็อกแล้ว');
    }
  };

  const handleClearSoldKeys = async () => {
    setShowToolsMenu(false);
    if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบคีย์ที่ขายแล้วทั้งหมด?')) {
      const count = await clearSoldLicenseKeys(product.id);
      onShowToast?.(`ลบคีย์ที่ขายแล้วทั้งหมด ${count} รายการ`);
    }
  };

  const handleClearAllKeys = async () => {
    setShowToolsMenu(false);
    if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบคีย์ทั้งหมดในสต็อกสินค้านี้?')) {
      const count = await clearAllProductLicenseKeys(product.id);
      onShowToast?.(`ลบคีย์ทั้งหมด ${count} รายการเรียบร้อย`);
    }
  };

  const handleCopyAvailableKeys = () => {
    setShowToolsMenu(false);
    const available = keys.filter(k => !k.isUsed).map(k => k.keyCode).join('\n');
    if (!available) {
      onShowToast?.('ไม่มีคีย์คงเหลือให้คัดลอก');
      return;
    }
    navigator.clipboard.writeText(available);
    onShowToast?.(`คัดลอกคีย์คงเหลือทั้งหมด ${availableCount} รายการแล้ว`);
  };

  const handleExportCSV = () => {
    setShowToolsMenu(false);
    if (keys.length === 0) {
      onShowToast?.('ไม่มีรายการคีย์สำหรับส่งออก');
      return;
    }
    const csvContent = 'data:text/csv;charset=utf-8,' + 
      'Key,Status,Buyer,Date\n' +
      keys.map(k => `"${k.keyCode}","${k.isUsed ? 'ขายแล้ว' : 'พร้อมขาย'}","${k.usedByEmail || ''}","${formatKeyDate(k.createdAt)}"`).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `stock_${product.name.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSyncStock = async () => {
    setShowToolsMenu(false);
    const synced = await syncProductStockFromKeys(product.id);
    onStockUpdated?.(synced);
    onShowToast?.(`ซิงค์จำนวนสต็อกสินค้าเรียบร้อย (${synced} ชิ้น)`);
  };

  const handleCopySingleKey = (keyItem: LicenseKeyItem) => {
    navigator.clipboard.writeText(keyItem.keyCode);
    setCopiedKeyId(keyItem.id);
    setTimeout(() => setCopiedKeyId(null), 2000);
    onShowToast?.('คัดลอกคีย์แล้ว');
  };

  function formatKeyDate(timestamp: any): string {
    if (!timestamp) return '25 ก.ย. 2569';
    try {
      const d = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return d.toLocaleDateString('th-TH', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '';
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="max-w-xl w-full rounded-2xl bg-[#09090b] border border-white/10 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col text-left">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-[#0d0d12]">
          <div>
            <h3 className="font-heading text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <span>จัดการสต็อก</span>
            </h3>
            <p className="text-xs text-white/50 truncate max-w-sm mt-0.5 font-medium">
              {product.name}
            </p>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="size-8 rounded-lg text-white/50 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Action Buttons Top Bar */}
        <div className="p-4 sm:px-5 pb-0 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            {/* + เพิ่ม */}
            <button
              type="button"
              onClick={() => {
                setShowSingleAdd(!showSingleAdd);
                setShowBulkAdd(false);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                showSingleAdd 
                  ? 'btn-primary text-white shadow-lg shadow-[#ff1e27]/30' 
                  : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
              }`}
            >
              <Plus className="size-4" />
              <span>เพิ่ม</span>
            </button>

            {/* เพิ่มหลายรายการ */}
            <button
              type="button"
              onClick={() => {
                setShowBulkAdd(!showBulkAdd);
                setShowSingleAdd(false);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                showBulkAdd 
                  ? 'btn-primary text-white shadow-lg shadow-[#ff1e27]/30' 
                  : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
              }`}
            >
              <Layers className="size-4" />
              <span>เพิ่มหลายรายการ</span>
            </button>
          </div>

          {/* ... เครื่องมือ */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowToolsMenu(!showToolsMenu)}
              className="px-3 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <MoreHorizontal className="size-4" />
              <span>เครื่องมือ</span>
            </button>

            {showToolsMenu && (
              <div className="absolute right-0 top-11 w-52 rounded-xl bg-[#121217] border border-white/15 p-1.5 shadow-2xl z-30 space-y-1 animate-fade-in text-xs">
                <button
                  type="button"
                  onClick={handleSyncStock}
                  className="w-full px-3 py-2 rounded-lg text-left text-white/90 hover:text-white hover:bg-white/10 flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="size-3.5 text-[#ff1e27]" />
                  <span>ซิงค์จำนวนเข้าสต็อกสินค้า</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyAvailableKeys}
                  className="w-full px-3 py-2 rounded-lg text-left text-white/90 hover:text-white hover:bg-white/10 flex items-center gap-2 cursor-pointer"
                >
                  <Copy className="size-3.5 text-blue-400" />
                  <span>คัดลอกคีย์คงเหลือทั้งหมด</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="w-full px-3 py-2 rounded-lg text-left text-white/90 hover:text-white hover:bg-white/10 flex items-center gap-2 cursor-pointer"
                >
                  <Download className="size-3.5 text-emerald-400" />
                  <span>ส่งออกไฟล์ (.csv)</span>
                </button>
                <button
                  type="button"
                  onClick={handleClearSoldKeys}
                  className="w-full px-3 py-2 rounded-lg text-left text-amber-400 hover:text-amber-300 hover:bg-amber-500/15 flex items-center gap-2 cursor-pointer"
                >
                  <Trash2 className="size-3.5" />
                  <span>ลบคีย์ที่ขายแล้วทั้งหมด</span>
                </button>
                <button
                  type="button"
                  onClick={handleClearAllKeys}
                  className="w-full px-3 py-2 rounded-lg text-left text-red-400 hover:text-red-300 hover:bg-red-500/15 flex items-center gap-2 cursor-pointer"
                >
                  <Trash2 className="size-3.5" />
                  <span>ลบสต็อกทั้งหมด</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Toggled Card 1: เพิ่มสต็อกใหม่ (Single) */}
        {showSingleAdd && (
          <div className="p-4 sm:px-5">
            <div className="rounded-2xl border border-white/15 bg-white/[0.03] p-4 space-y-3 relative animate-fade-in">
              <div className="flex items-center justify-between">
                <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                  <Plus className="size-4 text-[#ff1e27]" />
                  <span>เพิ่มสต็อกใหม่</span>
                </h4>
                <button 
                  type="button" 
                  onClick={() => setShowSingleAdd(false)}
                  className="text-white/40 hover:text-white"
                >
                  <X className="size-4" />
                </button>
              </div>

              <form onSubmit={handleAddSingleKey} className="space-y-3">
                <input
                  type="text"
                  required
                  value={singleKeyInput}
                  onChange={(e) => setSingleKeyInput(e.target.value)}
                  placeholder="กรอก license / คีย์สต็อก"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/70 border border-white/15 text-xs sm:text-sm text-white focus:outline-none focus:border-[#ff1e27] transition-colors"
                />
                <button
                  type="submit"
                  disabled={isSubmittingSingle || !singleKeyInput.trim()}
                  className="btn-primary w-full h-10 rounded-xl text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-lg shadow-[#ff1e27]/25 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingSingle ? <Loader2 className="size-4 animate-spin" /> : <span>เพิ่มสต็อก</span>}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Toggled Card 2: เพิ่มหลายรายการ (Bulk) */}
        {showBulkAdd && (
          <div className="p-4 sm:px-5">
            <div className="rounded-2xl border border-white/15 bg-white/[0.03] p-4 space-y-3 relative animate-fade-in">
              <div className="flex items-center justify-between">
                <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                  <Layers className="size-4 text-[#ff1e27]" />
                  <span>เพิ่มหลายรายการ</span>
                </h4>
                <button 
                  type="button" 
                  onClick={() => setShowBulkAdd(false)}
                  className="text-white/40 hover:text-white"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="flex items-center justify-between gap-2 flex-wrap">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept=".txt,.csv" 
                  className="hidden" 
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Upload className="size-3.5 text-[#ff1e27]" />
                  <span>อัปโหลด .txt / .csv</span>
                </button>
                <span className="text-[10px] text-white/50">
                  1 บรรทัด = 1 คีย์ (สูงสุด 10,000 รายการ)
                </span>
              </div>

              <form onSubmit={handleAddBulkKeys} className="space-y-3">
                <textarea
                  rows={4}
                  required
                  value={bulkKeysInput}
                  onChange={(e) => setBulkKeysInput(e.target.value)}
                  placeholder={`วางคีย์ทีละบรรทัด\nkey1\nkey2\n...`}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/70 border border-white/15 text-xs font-mono text-white focus:outline-none focus:border-[#ff1e27] transition-colors resize-none"
                />
                <button
                  type="submit"
                  disabled={isSubmittingBulk || !bulkKeysInput.trim()}
                  className="btn-primary w-full h-10 rounded-xl text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-lg shadow-[#ff1e27]/25 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingBulk ? <Loader2 className="size-4 animate-spin" /> : <span>เพิ่มทั้งหมด</span>}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* 3 Stat Cards (คงเหลือ, ขายแล้ว, ทั้งหมด) */}
        <div className="p-4 sm:p-5 grid grid-cols-3 gap-2.5">
          {/* คงเหลือ (Green Accent Box) */}
          <div className="p-3 sm:p-3.5 rounded-xl border border-emerald-500/40 bg-emerald-500/[0.04] space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
              <Package className="size-3.5" />
              <span>คงเหลือ</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-400">
              {availableCount}
            </div>
          </div>

          {/* ขายแล้ว */}
          <div className="p-3 sm:p-3.5 rounded-xl border border-white/10 bg-white/[0.02] space-y-1">
            <div className="flex items-center gap-1.5 text-white/60 text-xs font-semibold">
              <CheckCircle2 className="size-3.5" />
              <span>ขายแล้ว</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-white">
              {soldCount}
            </div>
          </div>

          {/* ทั้งหมด */}
          <div className="p-3 sm:p-3.5 rounded-xl border border-white/10 bg-white/[0.02] space-y-1">
            <div className="flex items-center gap-1.5 text-white/60 text-xs font-semibold">
              <List className="size-3.5" />
              <span>ทั้งหมด</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-white">
              {totalCount}
            </div>
          </div>
        </div>

        {/* Search Input Box */}
        <div className="px-4 sm:px-5">
          <div className="relative">
            <Search className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาคีย์สต็อก..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-xs sm:text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#ff1e27] transition-colors"
            />
          </div>
        </div>

        {/* Key List Header */}
        <div className="px-4 sm:px-5 pt-4 pb-2 flex items-center justify-between text-xs text-white/50">
          <span className="font-semibold text-white/70">พบ {filteredKeys.length} รายการ</span>
        </div>

        {/* Keys Table Container */}
        <div className="px-4 sm:px-5 pb-5 overflow-y-auto flex-1 space-y-2">
          {/* Table Header Bar */}
          <div className="grid grid-cols-12 px-3 py-2 rounded-lg bg-white/5 text-[11px] font-semibold text-white/60">
            <span className="col-span-5 sm:col-span-5">คีย์ / สถานะ</span>
            <span className="col-span-4 sm:col-span-4">ผู้ซื้อ / วันที่</span>
            <span className="col-span-3 sm:col-span-3 text-right">จัดการ</span>
          </div>

          {loading ? (
            <div className="py-12 text-center space-y-2">
              <Loader2 className="size-6 text-[#ff1e27] animate-spin mx-auto" />
              <p className="text-xs text-white/40">กำลังโหลดรายการสต็อก...</p>
            </div>
          ) : filteredKeys.length === 0 ? (
            <div className="py-12 text-center rounded-xl border border-white/10 bg-white/[0.01] space-y-2">
              <Package className="size-8 text-white/20 mx-auto" />
              <p className="text-xs text-white/40 font-medium">
                {searchQuery ? 'ไม่พบคีย์ที่ตรงกับการค้นหา' : 'ยังไม่มีสต็อก — กด “เพิ่ม” เพื่อเริ่มต้น'}
              </p>
            </div>
          ) : (
            filteredKeys.map((k) => {
              const isEditing = editingKeyId === k.id;
              const isCopied = copiedKeyId === k.id;

              return (
                <div
                  key={k.id}
                  className="grid grid-cols-12 items-center px-3 py-2.5 rounded-xl border border-white/10 bg-[#0d0d12] hover:border-white/20 transition-all text-xs gap-2"
                >
                  {/* Column 1: Key & Status Badge */}
                  <div className="col-span-5 sm:col-span-5 min-w-0 space-y-1">
                    {isEditing ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={editingKeyText}
                          onChange={(e) => setEditingKeyText(e.target.value)}
                          className="w-full px-2 py-1 rounded bg-black border border-[#ff1e27] text-xs font-mono text-white"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveEditKey(k.id)}
                          className="p-1 rounded bg-emerald-600 text-white"
                        >
                          <Check className="size-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-white text-xs truncate max-w-[130px] sm:max-w-[170px]" title={k.keyCode}>
                          {k.keyCode}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopySingleKey(k)}
                          className="size-5 rounded flex items-center justify-center text-white/40 hover:text-white transition-colors cursor-pointer"
                          title="คัดลอกคีย์"
                        >
                          {isCopied ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
                        </button>
                      </div>
                    )}

                    <div>
                      {k.isUsed ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/10 text-white/50 text-[10px] font-semibold">
                          <CheckCircle2 className="size-3" />
                          <span>ขายแล้ว</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold">
                          <Package className="size-3" />
                          <span>พร้อมขาย</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Column 2: Buyer / Date */}
                  <div className="col-span-4 sm:col-span-4 min-w-0 text-[11px]">
                    <div className="truncate text-white/80 font-medium" title={k.usedByEmail || 'ยังไม่มีผู้ซื้อ'}>
                      {k.usedByEmail || 'ยังไม่มีผู้ซื้อ'}
                    </div>
                    <div className="text-[10px] text-white/40 font-mono">
                      {formatKeyDate(k.createdAt)}
                    </div>
                  </div>

                  {/* Column 3: Actions */}
                  <div className="col-span-3 sm:col-span-3 flex items-center justify-end gap-1.5">
                    {/* Toggle Status Check Button */}
                    <button
                      type="button"
                      onClick={() => handleToggleKeyStatus(k)}
                      className={`size-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                        k.isUsed 
                          ? 'bg-white/10 text-white/40 hover:text-emerald-400 hover:bg-emerald-500/20' 
                          : 'bg-emerald-500/20 text-emerald-400 hover:bg-white/10 hover:text-white'
                      }`}
                      title={k.isUsed ? 'เปลี่ยนเป็นพร้อมขาย' : 'เปลี่ยนเป็นขายแล้ว'}
                    >
                      <Check className="size-3.5" />
                    </button>

                    {/* Edit Key Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setEditingKeyId(k.id);
                        setEditingKeyText(k.keyCode);
                      }}
                      className="size-7 rounded-lg bg-white/5 hover:bg-white/15 text-white/60 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                      title="แก้ไขคีย์"
                    >
                      <Edit2 className="size-3" />
                    </button>

                    {/* Delete Key Button */}
                    <button
                      type="button"
                      onClick={() => handleDeleteKey(k.id)}
                      className="size-7 rounded-lg bg-red-500/10 hover:bg-red-500/25 text-red-400 flex items-center justify-center transition-colors cursor-pointer"
                      title="ลบคีย์"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};
