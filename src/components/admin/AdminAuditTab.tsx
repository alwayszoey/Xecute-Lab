import React, { useState, useEffect } from 'react';
import { ShieldCheck, Clock, Search, RefreshCw, UserCheck, Package, Layers, Key, Globe } from 'lucide-react';
import { AuditLogItem, fetchAuditLogs } from '../../lib/store.ts';

export const AdminAuditTab: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadLogs = async () => {
    setLoading(true);
    try {
      const list = await fetchAuditLogs();
      setLogs(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filteredLogs = logs.filter(l => 
    (l.action && l.action.toLowerCase().includes(search.toLowerCase())) ||
    (l.details && l.details.toLowerCase().includes(search.toLowerCase())) ||
    (l.adminEmail && l.adminEmail.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#0f0f13] border border-white/10 p-4 rounded-2xl">
        <div>
          <h3 className="font-heading text-lg font-bold text-white flex items-center gap-2">
            <ShieldCheck className="size-5 text-[#ff1e27]" />
            <span>ประวัติกิจกรรมและความปลอดภัย (Audit & Security Logs)</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#ff1e27]/15 border border-[#ff1e27]/30 text-white font-mono">
              {logs.length} บันทึก
            </span>
          </h3>
          <p className="text-xs text-white/50 mt-0.5">
            บันทึกการเปลี่ยนแปลงสินค้า, การมอบยศผู้ใช้, การแก้ไขข้อความหน้าเว็บ และการจัดการคีย์
          </p>
        </div>

        <button
          onClick={loadLogs}
          disabled={loading}
          className="h-9 px-3 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-semibold text-white transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>รีเฟรชบันทึก</span>
        </button>
      </div>

      {/* Filter */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/40" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ค้นหากิจกรรม ผู้ดำเนินการ หรือรายละเอียด..."
          className="w-full bg-[#15151b] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:border-[#ff1e27] focus:outline-none"
        />
      </div>

      {/* Logs Table */}
      {logs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-[#0a0a0e] p-8 text-center text-white/40 text-xs">
          ยังไม่มีประวัติกิจกรรมในบันทึก เมื่อมีการสร้างหรือแก้ไขข้อมูลในระบบหลังบ้าน ข้อมูลจะถูกบันทึกลง Firestore อัตโนมัติ
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#0d0d12] p-8 text-center text-white/40 text-xs">
          ไม่พบบันทึกที่ตรงกับการค้นหา
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#0d0d12]">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/5 text-white/60 border-b border-white/10 uppercase text-[11px]">
              <tr>
                <th className="p-3">เวลา</th>
                <th className="p-3">หมวดหมู่</th>
                <th className="p-3">การกระทำ (Action)</th>
                <th className="p-3">รายละเอียด</th>
                <th className="p-3 text-right">ผู้ดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredLogs.map((l) => (
                <tr key={l.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-3 text-white/50 font-mono text-[11px] whitespace-nowrap">
                    {l.createdAt?.toDate ? l.createdAt.toDate().toLocaleString() : 'เมื่อสักครู่'}
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/5 border border-white/10 text-white/80">
                      {l.category}
                    </span>
                  </td>
                  <td className="p-3 font-bold text-white">{l.action}</td>
                  <td className="p-3 text-white/70">{l.details}</td>
                  <td className="p-3 text-right font-mono text-[#ff1e27] text-[11px]">
                    {l.adminEmail}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};
