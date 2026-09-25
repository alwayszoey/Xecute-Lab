import React, { useState } from 'react';
import { TrendingUp, DollarSign, CreditCard, ArrowUpRight, CheckCircle2, Clock, Calendar, Download } from 'lucide-react';
import { OrderItem } from '../../lib/store.ts';

interface AdminFinanceTabProps {
  orders: OrderItem[];
  mode: 'finance' | 'transactions';
}

export const AdminFinanceTab: React.FC<AdminFinanceTabProps> = ({ orders, mode }) => {
  const [filterPeriod, setFilterPeriod] = useState<'today' | 'week' | 'month' | 'all'>('all');

  const completedOrders = orders.filter(o => o.status === 'completed');
  const totalRevenue = completedOrders.reduce((sum, o) => sum + (o.amount || 0), 0);
  const pendingOrders = orders.filter(o => o.status === 'pending');
  const pendingRevenue = pendingOrders.reduce((sum, o) => sum + (o.amount || 0), 0);
  const averageOrderValue = completedOrders.length > 0 ? Math.round(totalRevenue / completedOrders.length) : 0;

  return (
    <div className="space-y-6 text-left animate-fade-in">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#09090b] border border-white/10 p-5 rounded-2xl">
        <div>
          <h3 className="font-heading text-xl font-bold text-white flex items-center gap-2">
            {mode === 'finance' ? (
              <>
                <TrendingUp className="size-5 text-[#ff1e27]" />
                <span>รายงานการเงินและยอดขาย (Financial Report)</span>
              </>
            ) : (
              <>
                <CreditCard className="size-5 text-[#ff1e27]" />
                <span>จัดการธุรกรรมและการชำระเงิน (Transaction Management)</span>
              </>
            )}
          </h3>
          <p className="text-xs text-white/50 mt-1">
            สรุปข้อมูลสถิติรายรับ บันทึกยอดการโอนชำระ และตรวจสอบความถูกต้องของรายการสั่งซื้อ
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterPeriod}
            onChange={(e) => setFilterPeriod(e.target.value as any)}
            className="px-3.5 py-2 rounded-xl bg-black/60 border border-white/15 text-xs text-white focus:outline-none focus:border-[#ff1e27]"
          >
            <option value="today">วันนี้</option>
            <option value="week">สัปดาห์นี้</option>
            <option value="month">เดือนนี้</option>
            <option value="all">ทั้งหมดตลอดกาล</option>
          </select>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl border border-white/10 bg-[#09090b] space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-xs text-white/50">
            <span>รายรับสุทธิ (สำเร็จแล้ว)</span>
            <DollarSign className="size-4 text-emerald-400" />
          </div>
          <div className="font-heading text-2xl sm:text-3xl font-extrabold text-white font-mono">
            ฿{totalRevenue.toLocaleString()}
          </div>
          <span className="text-[11px] text-emerald-400 font-semibold block">
            {completedOrders.length} รายการที่ชำระเงินแล้ว
          </span>
        </div>

        <div className="p-5 rounded-2xl border border-white/10 bg-[#09090b] space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-xs text-white/50">
            <span>ยอดรอดำเนินการ (Pending)</span>
            <Clock className="size-4 text-amber-400" />
          </div>
          <div className="font-heading text-2xl sm:text-3xl font-extrabold text-amber-300 font-mono">
            ฿{pendingRevenue.toLocaleString()}
          </div>
          <span className="text-[11px] text-amber-400 font-semibold block">
            {pendingOrders.length} คำสั่งซื้อรอยืนยัน
          </span>
        </div>

        <div className="p-5 rounded-2xl border border-white/10 bg-[#09090b] space-y-2 shadow-lg">
          <div className="flex items-center justify-between text-xs text-white/50">
            <span>ยอดเฉลี่ยต่อออเดอร์</span>
            <ArrowUpRight className="size-4 text-[#ff1e27]" />
          </div>
          <div className="font-heading text-2xl sm:text-3xl font-extrabold text-white font-mono">
            ฿{averageOrderValue.toLocaleString()}
          </div>
          <span className="text-[11px] text-[#ff1e27] font-semibold block">
            Average Order Value (AOV)
          </span>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="rounded-2xl border border-white/10 bg-[#09090b] p-5 shadow-xl space-y-4">
        <h4 className="text-sm font-bold text-white">บันทึกธุรกรรมล่าสุด ({orders.length} รายการ)</h4>

        {orders.length === 0 ? (
          <div className="p-10 text-center text-xs text-white/40">
            ยังไม่มีประวัติธุรกรรมในระบบ
          </div>
        ) : (
          <div className="divide-y divide-white/5 overflow-x-auto">
            {orders.map((o) => (
              <div key={o.id} className="py-3.5 flex items-center justify-between gap-4 text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-white">{o.id}</span>
                    <span className="text-white/40">•</span>
                    <span className="text-white font-semibold">{o.productName}</span>
                  </div>
                  <span className="text-white/40 block text-[11px]">{o.userEmail}</span>
                </div>

                <div className="text-right space-y-1">
                  <span className="font-mono font-bold text-sm text-emerald-400 block">
                    +฿{o.amount.toLocaleString()}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    o.status === 'completed' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {o.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
