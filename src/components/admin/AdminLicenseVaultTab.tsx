import React, { useState, useEffect } from 'react';
import { Key, Plus, Trash2, CheckCircle2, Search, RefreshCw, Wand2, ShieldCheck, AlertCircle } from 'lucide-react';
import { LicenseKeyItem, fetchLicenseKeys, addLicenseKeysBulk, deleteLicenseKey, ProductItem } from '../../lib/store.ts';

interface AdminLicenseVaultTabProps {
  products: ProductItem[];
  onShowToast: (msg: string) => void;
}

export const AdminLicenseVaultTab: React.FC<AdminLicenseVaultTabProps> = ({
  products,
  onShowToast
}) => {
  const [keys, setKeys] = useState<LicenseKeyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProductFilter, setSelectedProductFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Bulk add modal/panel
  const [targetProductId, setTargetProductId] = useState('');
  const [rawKeysText, setRawKeysText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Auto generator
  const [genCount, setGenCount] = useState('10');
  const [genPrefix, setGenPrefix] = useState('XL');

  const loadKeys = async () => {
    setLoading(true);
    try {
      const list = await fetchLicenseKeys(selectedProductFilter === 'all' ? undefined : selectedProductFilter);
      setKeys(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKeys();
  }, [selectedProductFilter]);

  useEffect(() => {
    if (products.length > 0 && !targetProductId) {
      setTargetProductId(products[0].id);
    }
  }, [products]);

  const handleBulkAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetProductId) {
      alert('กรุณาเลือกสินค้าก่อนเพิ่มคีย์');
      return;
    }
    const lines = rawKeysText.split('\n').map(s => s.trim()).filter(Boolean);
    if (lines.length === 0) {
      alert('กรุณากรอกคีย์อย่างน้อย 1 รายการ');
      return;
    }

    setSubmitting(true);
    try {
      const targetProd = products.find(p => p.id === targetProductId);
      const added = await addLicenseKeysBulk(targetProductId, targetProd?.name || 'Digital Item', lines);
      setRawKeysText('');
      await loadKeys();
      onShowToast(`เพิ่มคีย์สำเร็จจำนวน ${added} คีย์ลงในคลัง`);
    } catch (err: any) {
      alert('Error adding keys: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGenerateKeys = () => {
    const count = Math.min(Math.max(Number(genCount) || 5, 1), 100);
    const generated: string[] = [];
    for (let i = 0; i < count; i++) {
      const seg1 = Math.random().toString(36).substring(2, 6).toUpperCase();
      const seg2 = Math.random().toString(36).substring(2, 6).toUpperCase();
      const seg3 = Math.random().toString(36).substring(2, 6).toUpperCase();
      generated.push(`${genPrefix}-${seg1}-${seg2}-${seg3}`);
    }
    setRawKeysText(prev => prev ? prev + '\n' + generated.join('\n') : generated.join('\n'));
    onShowToast(`สร้างรหัสคีย์สุ่มจำนวน ${count} รายการในกล่องข้อความ`);
  };

  const handleDelete = async (id: string) => {
    if (confirm('ลบคีย์นี้ออกจากคลัง?')) {
      await deleteLicenseKey(id);
      await loadKeys();
      onShowToast('ลบคีย์เรียบร้อย');
    }
  };

  const availableCount = keys.filter(k => !k.isUsed).length;
  const usedCount = keys.filter(k => k.isUsed).length;

  const filteredKeys = keys.filter(k => {
    const matchesSearch = k.keyCode.toLowerCase().includes(search.toLowerCase()) ||
      k.productName.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#0f0f13] border border-white/10 p-4 rounded-2xl">
        <div>
          <h3 className="font-heading text-lg font-bold text-white flex items-center gap-2">
            <Key className="size-5 text-[#ff1e27]" />
            <span>คลังคีย์ไลเซนส์ดิจิทัล (License Keys & Digital Vault)</span>
          </h3>
          <p className="text-xs text-white/50 mt-0.5">
            พร้อมส่ง: <span className="text-emerald-400 font-mono font-bold">{availableCount} คีย์</span> • 
            ส่งมอบแล้ว: <span className="text-white/40 font-mono"> {usedCount} คีย์</span>
          </p>
        </div>

        <button
          onClick={loadKeys}
          disabled={loading}
          className="h-9 px-3 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-semibold text-white transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>รีเฟรชคลัง</span>
        </button>
      </div>

      {/* Add Keys & Generator Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Bulk Add Form (8 cols) */}
        <div className="lg:col-span-8 rounded-2xl border border-white/10 bg-[#0d0d12] p-5 space-y-4">
          <h4 className="font-heading text-sm font-bold text-white flex items-center gap-2">
            <Plus className="size-4 text-[#ff1e27]" />
            <span>นำเข้าคีย์ไลเซนส์เข้าสู่ระบบ (Bulk Add Keys)</span>
          </h4>

          <form onSubmit={handleBulkAdd} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1">
                เลือกสินค้าที่ต้องการผูกคีย์
              </label>
              <select
                value={targetProductId}
                onChange={(e) => setTargetProductId(e.target.value)}
                className="w-full bg-[#15151b] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:border-[#ff1e27] focus:outline-none"
              >
                {products.length === 0 ? (
                  <option value="">(ยังไม่มีสินค้า - กรุณาเพิ่มสินค้าก่อน)</option>
                ) : (
                  products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (สต็อก: {p.stock})</option>
                  ))
                )}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-white/80">
                  รายการคีย์ (บรรทัดละ 1 คีย์)
                </label>
                <span className="text-[10px] text-white/40 font-mono">
                  {rawKeysText.split('\n').filter(s => s.trim()).length} คีย์ที่ระบุ
                </span>
              </div>
              <textarea
                rows={4}
                required
                value={rawKeysText}
                onChange={(e) => setRawKeysText(e.target.value)}
                placeholder={"XL-XXXX-XXXX-XXXX\nXL-YYYY-YYYY-YYYY\nXL-ZZZZ-ZZZZ-ZZZZ"}
                className="w-full bg-[#15151b] border border-white/15 rounded-xl p-3 text-xs text-white font-mono focus:border-[#ff1e27] focus:outline-none resize-none"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary h-10 px-6 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg"
              >
                <Plus className="size-4" />
                <span>{submitting ? 'กำลังนำเข้า...' : 'นำเข้าคีย์ลงคลัง'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Generator Helper (4 cols) */}
        <div className="lg:col-span-4 rounded-2xl border border-white/10 bg-[#0d0d12] p-5 flex flex-col justify-between space-y-4">
          <div>
            <h4 className="font-heading text-sm font-bold text-white flex items-center gap-2 mb-2">
              <Wand2 className="size-4 text-amber-400" />
              <span>เครื่องมือสุ่มสร้างคีย์ (Auto Generator)</span>
            </h4>
            <p className="text-[11px] text-white/50 leading-relaxed mb-3">
              สร้างชุดรหัสไลเซนส์มาตรฐาน Xecute Lab อัตโนมัติเพื่อใส่ในช่องด้านข้าง
            </p>

            <div className="space-y-2.5">
              <div>
                <label className="block text-[11px] text-white/70 mb-1">Prefix นำหน้า</label>
                <input
                  type="text"
                  value={genPrefix}
                  onChange={(e) => setGenPrefix(e.target.value.toUpperCase())}
                  className="w-full bg-[#15151b] border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] text-white/70 mb-1">จำนวนที่ต้องการสุ่ม</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={genCount}
                  onChange={(e) => setGenCount(e.target.value)}
                  className="w-full bg-[#15151b] border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGenerateKeys}
            className="w-full py-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-xs font-bold text-amber-300 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Wand2 className="size-3.5" />
            <span>สร้างคีย์สุ่มใส่กล่อง</span>
          </button>
        </div>

      </div>

      {/* Keys List Filter & Table */}
      <div className="rounded-2xl border border-white/10 bg-[#0d0d12] p-4 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหารหัสคีย์ หรือชื่อสินค้า..."
              className="w-full bg-[#15151b] border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:border-[#ff1e27] focus:outline-none"
            />
          </div>

          <select
            value={selectedProductFilter}
            onChange={(e) => setSelectedProductFilter(e.target.value)}
            className="bg-[#15151b] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:border-[#ff1e27] focus:outline-none w-full sm:w-auto"
          >
            <option value="all">คีย์ของทุกสินค้า ({keys.length})</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {keys.length === 0 ? (
          <div className="p-8 text-center text-white/40 text-xs">
            ยังไม่มีคีย์ในคลังไลเซนส์ คุณสามารถเพิ่มคีย์ได้จากฟอร์มด้านบน
          </div>
        ) : filteredKeys.length === 0 ? (
          <div className="p-8 text-center text-white/40 text-xs">
            ไม่พบคีย์ที่ตรงกับการค้นหา
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-white/50 border-b border-white/10 uppercase text-[11px]">
                <tr>
                  <th className="p-3">รหัสคีย์ (License Key)</th>
                  <th className="p-3">สินค้า</th>
                  <th className="p-3">สถานะ</th>
                  <th className="p-3 text-right">ลบ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredKeys.map((k) => (
                  <tr key={k.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-3 font-mono font-bold text-white flex items-center gap-2">
                      <Key className="size-3.5 text-[#ff1e27]" />
                      <span>{k.keyCode}</span>
                    </td>
                    <td className="p-3 text-white/70">{k.productName}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        k.isUsed ? 'bg-white/10 text-white/40' : 'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        {k.isUsed ? 'ส่งมอบแล้ว' : 'พร้อมใช้งาน'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleDelete(k.id)}
                        className="p-1 rounded text-white/30 hover:text-red-400"
                        title="ลบคีย์"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
