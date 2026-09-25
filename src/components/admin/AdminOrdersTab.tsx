import React, { useState } from 'react';
import { ShoppingBag, Search, CheckCircle2, Clock, RotateCcw, XCircle, Key, RefreshCw, DollarSign } from 'lucide-react';
import { OrderItem } from '../../lib/store.ts';

interface AdminOrdersTabProps {
  orders: OrderItem[];
  onUpdateStatus: (orderId: string, status: OrderItem['status']) => Promise<void>;
  onRefreshOrders: () => void;
  isRefreshing: boolean;
}

export const AdminOrdersTab: React.FC<AdminOrdersTabProps> = ({
  orders,
  onUpdateStatus,
  onRefreshOrders,
  isRefreshing
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      (o.productName && o.productName.toLowerCase().includes(search.toLowerCase())) ||
      (o.userEmail && o.userEmail.toLowerCase().includes(search.toLowerCase())) ||
      (o.id && o.id.toLowerCase().includes(search.toLowerCase())) ||
      (o.keyIssued && o.keyIssued.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = orders
    .filter(o => o.status === 'completed')
    .reduce((sum, o) => sum + (o.amount || 0), 0);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#0f0f13] border border-white/10 p-4 rounded-2xl">
        <div>
          <h3 className="font-heading text-lg font-bold text-white flex items-center gap-2">
            <ShoppingBag className="size-5 text-[#ff1e27]" />
            <span>จัดการคำสั่งซื้อและคีย์ไลเซนส์ (Orders & License Keys)</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#ff1e27]/15 border border-[#ff1e27]/30 text-white font-mono">
              {orders.length} ออเดอร์
            </span>
          </h3>
          <p className="text-xs text-white/50 mt-0.5">
            ยอดจำหน่ายสำเร็จรวม: <span className="text-emerald-400 font-bold font-mono">฿{totalRevenue.toLocaleString()}</span>
          </p>
        </div>

        <button
          onClick={onRefreshOrders}
          disabled={isRefreshing}
          className="h-10 px-4 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-semibold text-white transition-colors flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw className={`size-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>รีเฟรชออเดอร์</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-[#0d0d11] p-3 rounded-xl border border-white/5">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาชื่อสินค้า อีเมลผู้ซื้อ หรือคีย์ไลเซนส์..."
            className="w-full bg-[#15151b] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:border-[#ff1e27] focus:outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[#15151b] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-[#ff1e27] focus:outline-none w-full sm:w-auto"
        >
          <option value="all">ทุกสถานะออเดอร์ ({orders.length})</option>
          <option value="completed">สำเร็จแล้ว (Completed)</option>
          <option value="pending">รอดำเนินการ (Pending)</option>
          <option value="refunded">คืนเงิน (Refunded)</option>
          <option value="cancelled">ยกเลิก (Cancelled)</option>
        </select>
      </div>

      {/* Orders Table */}
      {orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-[#0a0a0e] p-8 text-center text-white/50 text-xs space-y-2">
          <p>ยังไม่มีรายการสั่งซื้อในระบบ</p>
          <p className="text-[11px] text-white/30">เมื่อลูกค้าคลิกสั่งซื้อสินค้าจากหน้าร้าน ข้อมูลการสั่งซื้อจะเข้ามาแสดงผลที่นี่ทันที</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#0d0d11] p-8 text-center text-white/50 text-xs">
          ไม่พบออเดอร์ที่ตรงกับเงื่อนไขการค้นหา
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#0d0d12]">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/5 text-white/60 border-b border-white/10 uppercase font-semibold">
              <tr>
                <th className="p-3.5">รหัสคำสั่งซื้อ & สินค้า</th>
                <th className="p-3.5">ผู้สั่งซื้อ</th>
                <th className="p-3.5">ยอดเงิน</th>
                <th className="p-3.5">คีย์ที่ส่งมอบ</th>
                <th className="p-3.5">สถานะ</th>
                <th className="p-3.5 text-right">เปลี่ยนสถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredOrders.map((o) => (
                <tr key={o.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-3.5">
                    <span className="font-bold text-white block">{o.productName}</span>
                    <span className="text-[10px] text-white/40 font-mono">ID: {o.id.slice(0, 10)}...</span>
                  </td>

                  <td className="p-3.5 text-white/80 font-mono">
                    {o.userEmail || o.userId}
                  </td>

                  <td className="p-3.5 font-mono text-emerald-400 font-bold">
                    ฿{(o.amount || 0).toLocaleString()}
                  </td>

                  <td className="p-3.5">
                    {o.keyIssued ? (
                      <span className="inline-flex items-center gap-1 font-mono text-[10px] bg-white/5 px-2 py-0.5 rounded border border-white/10 text-white/90">
                        <Key className="size-2.5 text-[#ff1e27]" />
                        {o.keyIssued}
                      </span>
                    ) : (
                      <span className="text-white/30 text-[10px]">-</span>
                    )}
                  </td>

                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      o.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                      o.status === 'pending' ? 'bg-amber-500/20 text-amber-300' :
                      o.status === 'refunded' ? 'bg-blue-500/20 text-blue-300' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {o.status}
                    </span>
                  </td>

                  <td className="p-3.5 text-right">
                    <select
                      value={o.status}
                      onChange={(e) => onUpdateStatus(o.id, e.target.value as any)}
                      className="bg-[#15151b] border border-white/10 rounded-lg px-2 py-1 text-[11px] text-white focus:border-[#ff1e27] focus:outline-none"
                    >
                      <option value="completed">Completed</option>
                      <option value="pending">Pending</option>
                      <option value="refunded">Refunded</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
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
