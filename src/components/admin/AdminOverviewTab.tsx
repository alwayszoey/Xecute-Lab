import React from 'react';
import { 
  Package, 
  Layers, 
  Users, 
  ShoppingBag, 
  Plus, 
  Sparkles, 
  ShieldCheck, 
  Database, 
  Globe, 
  Trash2, 
  ArrowUpRight,
  Clock,
  Terminal,
  Key,
  Tag as TagIcon,
  TrendingUp,
  Ticket,
  AlertTriangle,
  Star,
  Gift,
  Gamepad2,
  MessageCircle,
  Palette
} from 'lucide-react';
import { ProductItem, CategoryItem, UserAccountItem, OrderItem, SiteSettings } from '../../lib/store.ts';

interface AdminOverviewTabProps {
  products: ProductItem[];
  categories: CategoryItem[];
  users: UserAccountItem[];
  orders: OrderItem[];
  settings: SiteSettings;
  onNavigateTab: (tab: any) => void;
  onOpenAddProduct: () => void;
  onSeedSampleData: () => Promise<void>;
  onClearAllProducts: () => Promise<void>;
}

export const AdminOverviewTab: React.FC<AdminOverviewTabProps> = ({
  products,
  categories,
  users,
  orders,
  settings,
  onNavigateTab,
  onOpenAddProduct,
  onSeedSampleData,
  onClearAllProducts
}) => {
  const totalRevenue = orders
    .filter(o => o.status === 'completed')
    .reduce((sum, o) => sum + (o.amount || 0), 0);

  return (
    <div className="space-y-6">
      
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Products Metric */}
        <div 
          onClick={() => onNavigateTab('products')}
          className="rounded-2xl border border-white/10 bg-[#0f0f13] hover:border-[#ff1e27]/50 p-4 transition-all cursor-pointer shadow-lg group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/50 font-medium">สินค้าในฐานข้อมูล</span>
            <div className="size-8 rounded-lg bg-[#ff1e27]/15 text-[#ff1e27] flex items-center justify-center">
              <Package className="size-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="font-heading text-2xl sm:text-3xl font-bold text-white font-mono">
              {products.length}
            </span>
            <span className="text-[11px] text-[#ff1e27] group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
              จัดการ <ArrowUpRight className="size-3" />
            </span>
          </div>
        </div>

        {/* Categories Metric */}
        <div 
          onClick={() => onNavigateTab('categories')}
          className="rounded-2xl border border-white/10 bg-[#0f0f13] hover:border-[#ff1e27]/50 p-4 transition-all cursor-pointer shadow-lg group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/50 font-medium">หมวดหมู่สินค้า</span>
            <div className="size-8 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center">
              <Layers className="size-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="font-heading text-2xl sm:text-3xl font-bold text-white font-mono">
              {categories.length}
            </span>
            <span className="text-[11px] text-blue-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
              จัดการ <ArrowUpRight className="size-3" />
            </span>
          </div>
        </div>

        {/* Users Metric */}
        <div 
          onClick={() => onNavigateTab('users')}
          className="rounded-2xl border border-white/10 bg-[#0f0f13] hover:border-[#ff1e27]/50 p-4 transition-all cursor-pointer shadow-lg group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/50 font-medium">สมาชิกที่ลงทะเบียน</span>
            <div className="size-8 rounded-lg bg-purple-500/15 text-purple-400 flex items-center justify-center">
              <Users className="size-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="font-heading text-2xl sm:text-3xl font-bold text-white font-mono">
              {users.length}
            </span>
            <span className="text-[11px] text-purple-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
              จัดการยศ <ArrowUpRight className="size-3" />
            </span>
          </div>
        </div>

        {/* Orders / Revenue Metric */}
        <div 
          onClick={() => onNavigateTab('orders')}
          className="rounded-2xl border border-white/10 bg-[#0f0f13] hover:border-[#ff1e27]/50 p-4 transition-all cursor-pointer shadow-lg group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/50 font-medium">ยอดสั่งซื้อสำเร็จรวม</span>
            <div className="size-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <ShoppingBag className="size-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="font-heading text-xl sm:text-2xl font-bold text-emerald-400 font-mono">
              ฿{totalRevenue.toLocaleString()}
            </span>
            <span className="text-[11px] text-emerald-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
              {orders.length} ออเดอร์ <ArrowUpRight className="size-3" />
            </span>
          </div>
        </div>

      </div>

      {/* Quick Launchpad Actions */}
      <div className="rounded-2xl border border-white/10 bg-[#0d0d12] p-5 space-y-4">
        <h4 className="font-heading text-sm font-bold text-white flex items-center gap-2">
          <Terminal className="size-4 text-[#ff1e27]" />
          <span>ทางลัดจัดการระบบด่วน (Quick Launchpad)</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={onOpenAddProduct}
            className="p-3.5 rounded-xl border border-white/10 bg-[#14141a] hover:border-[#ff1e27]/60 hover:bg-[#1a1a24] text-left transition-all group"
          >
            <div className="flex items-center gap-2 mb-1.5 text-xs font-bold text-white group-hover:text-[#ff1e27]">
              <Plus className="size-4 text-[#ff1e27]" />
              <span>+ เพิ่มสินค้าใหม่</span>
            </div>
            <p className="text-[11px] text-white/50">สร้างการ์ดสินค้า ตั้งราคา และเพิ่มลงหน้าร้าน</p>
          </button>

          <button
            onClick={() => onNavigateTab('categories')}
            className="p-3.5 rounded-xl border border-white/10 bg-[#14141a] hover:border-blue-500/60 hover:bg-[#141824] text-left transition-all group"
          >
            <div className="flex items-center gap-2 mb-1.5 text-xs font-bold text-white group-hover:text-blue-400">
              <Layers className="size-4 text-blue-400" />
              <span>+ เพิ่มหมวดหมู่</span>
            </div>
            <p className="text-[11px] text-white/50">จัดระเบียบสินค้าและสร้างหมวดหมู่ใหม่</p>
          </button>

          <button
            onClick={() => onNavigateTab('cms')}
            className="p-3.5 rounded-xl border border-white/10 bg-[#14141a] hover:border-amber-500/60 hover:bg-[#1f1b14] text-left transition-all group"
          >
            <div className="flex items-center gap-2 mb-1.5 text-xs font-bold text-white group-hover:text-amber-400">
              <Globe className="size-4 text-amber-400" />
              <span>อัปเดตข้อความประกาศ</span>
            </div>
            <p className="text-[11px] text-white/50">แก้ข้อความตัววิ่ง และสถานะเปิด/ปิดปรับปรุง</p>
          </button>

          <button
            onClick={() => onNavigateTab('users')}
            className="p-3.5 rounded-xl border border-white/10 bg-[#14141a] hover:border-purple-500/60 hover:bg-[#1c1424] text-left transition-all group"
          >
            <div className="flex items-center gap-2 mb-1.5 text-xs font-bold text-white group-hover:text-purple-400">
              <Users className="size-4 text-purple-400" />
              <span>แต่งตั้งยศ/สิทธิ์</span>
            </div>
            <p className="text-[11px] text-white/50">มอบสิทธิ์ Owner, Admin, VIP แก่สมาชิก</p>
          </button>

          <button
            onClick={() => onNavigateTab('keys')}
            className="p-3.5 rounded-xl border border-white/10 bg-[#14141a] hover:border-emerald-500/60 hover:bg-[#14241c] text-left transition-all group"
          >
            <div className="flex items-center gap-2 mb-1.5 text-xs font-bold text-white group-hover:text-emerald-400">
              <Key className="size-4 text-emerald-400" />
              <span>คลังคีย์ & License</span>
            </div>
            <p className="text-[11px] text-white/50">นำเข้าคีย์ดิจิทัล และสร้างคีย์อัตโนมัติ</p>
          </button>

          <button
            onClick={() => onNavigateTab('tags')}
            className="p-3.5 rounded-xl border border-white/10 bg-[#14141a] hover:border-pink-500/60 hover:bg-[#24141d] text-left transition-all group"
          >
            <div className="flex items-center gap-2 mb-1.5 text-xs font-bold text-white group-hover:text-pink-400">
              <TagIcon className="size-4 text-pink-400" />
              <span>จัดการแท็ก & Badges</span>
            </div>
            <p className="text-[11px] text-white/50">กำหนดแท็กคุณสมบัติและป้ายกำกับการ์ด</p>
          </button>

          <button
            onClick={() => onNavigateTab('finance')}
            className="p-3.5 rounded-xl border border-white/10 bg-[#14141a] hover:border-emerald-500/60 hover:bg-[#14241c] text-left transition-all group"
          >
            <div className="flex items-center gap-2 mb-1.5 text-xs font-bold text-white group-hover:text-emerald-400">
              <TrendingUp className="size-4 text-emerald-400" />
              <span>รายงานการเงิน & ยอดขาย</span>
            </div>
            <p className="text-[11px] text-white/50">สรุปรายรับ AOV และสถิติคำสั่งซื้อที่สำเร็จ</p>
          </button>

          <button
            onClick={() => onNavigateTab('promos')}
            className="p-3.5 rounded-xl border border-white/10 bg-[#14141a] hover:border-violet-500/60 hover:bg-[#1f1424] text-left transition-all group"
          >
            <div className="flex items-center gap-2 mb-1.5 text-xs font-bold text-white group-hover:text-violet-400">
              <Ticket className="size-4 text-violet-400" />
              <span>โค้ดส่วนลด & โปรโมชั่น</span>
            </div>
            <p className="text-[11px] text-white/50">สร้างคูปองลด % หรือเงินสด พร้อมจำกัดสิทธิ์</p>
          </button>

          <button
            onClick={() => onNavigateTab('claims')}
            className="p-3.5 rounded-xl border border-white/10 bg-[#14141a] hover:border-red-500/60 hover:bg-[#241414] text-left transition-all group"
          >
            <div className="flex items-center gap-2 mb-1.5 text-xs font-bold text-white group-hover:text-red-400">
              <AlertTriangle className="size-4 text-red-400" />
              <span>จัดการเคลมสินค้า & ประกัน</span>
            </div>
            <p className="text-[11px] text-white/50">อนุมัติ/ปฏิเสธคำร้องขอเปลี่ยนคีย์มีปัญหา</p>
          </button>

          <button
            onClick={() => onNavigateTab('reviews')}
            className="p-3.5 rounded-xl border border-white/10 bg-[#14141a] hover:border-amber-500/60 hover:bg-[#242114] text-left transition-all group"
          >
            <div className="flex items-center gap-2 mb-1.5 text-xs font-bold text-white group-hover:text-amber-400">
              <Star className="size-4 text-amber-400" />
              <span>จัดการรีวิว & ความคิดเห็น</span>
            </div>
            <p className="text-[11px] text-white/50">คัดกรอง ซ่อน หรืออนุมัติการรีวิว 5 ดาว</p>
          </button>

          <button
            onClick={() => onNavigateTab('giveaways')}
            className="p-3.5 rounded-xl border border-white/10 bg-[#14141a] hover:border-pink-500/60 hover:bg-[#241421] text-left transition-all group"
          >
            <div className="flex items-center gap-2 mb-1.5 text-xs font-bold text-white group-hover:text-pink-400">
              <Gift className="size-4 text-pink-400" />
              <span>กิจกรรมแจกของฟรี</span>
            </div>
            <p className="text-[11px] text-white/50">สร้างกิจกรรมชิงโชค คีย์ฟรี และรางวัลสุ่ม</p>
          </button>

          <button
            onClick={() => onNavigateTab('minigames')}
            className="p-3.5 rounded-xl border border-white/10 bg-[#14141a] hover:border-cyan-500/60 hover:bg-[#142324] text-left transition-all group"
          >
            <div className="flex items-center gap-2 mb-1.5 text-xs font-bold text-white group-hover:text-cyan-400">
              <Gamepad2 className="size-4 text-cyan-400" />
              <span>มินิเกม & ระบบสุ่มวงล้อ</span>
            </div>
            <p className="text-[11px] text-white/50">ตั้งค่าราคาหมุน อัตราแจ็กพอต และประวัติ</p>
          </button>

          <button
            onClick={() => onNavigateTab('chat')}
            className="p-3.5 rounded-xl border border-white/10 bg-[#14141a] hover:border-blue-500/60 hover:bg-[#141d24] text-left transition-all group"
          >
            <div className="flex items-center gap-2 mb-1.5 text-xs font-bold text-white group-hover:text-blue-400">
              <MessageCircle className="size-4 text-blue-400" />
              <span>แชทช่วยเหลือลูกค้า</span>
            </div>
            <p className="text-[11px] text-white/50">ตอบกลับข้อความลูกค้าแบบเรียลไทม์</p>
          </button>

          <button
            onClick={() => onNavigateTab('theme')}
            className="p-3.5 rounded-xl border border-white/10 bg-[#14141a] hover:border-purple-500/60 hover:bg-[#201424] text-left transition-all group"
          >
            <div className="flex items-center gap-2 mb-1.5 text-xs font-bold text-white group-hover:text-purple-400">
              <Palette className="size-4 text-purple-400" />
              <span>ปรับแต่งธีม สี & รูปพื้นหลัง</span>
            </div>
            <p className="text-[11px] text-white/50">ปรับแต่งสีหลัก รูปแบบ Dark/Light และรูปพื้นหลัง</p>
          </button>

          <button
            onClick={() => onNavigateTab('database')}
            className="p-3.5 rounded-xl border border-white/10 bg-[#14141a] hover:border-[#ff1e27]/60 hover:bg-[#241414] text-left transition-all group"
          >
            <div className="flex items-center gap-2 mb-1.5 text-xs font-bold text-white group-hover:text-[#ff1e27]">
              <Database className="size-4 text-[#ff1e27]" />
              <span>ตรวจสอบฐานข้อมูลจริง</span>
            </div>
            <p className="text-[11px] text-white/50">ทดสอบ Ping Cloud Firestore และดาวน์โหลด Backup</p>
          </button>

          <button
            onClick={() => onNavigateTab('audit')}
            className="p-3.5 rounded-xl border border-white/10 bg-[#14141a] hover:border-cyan-500/60 hover:bg-[#142224] text-left transition-all group"
          >
            <div className="flex items-center gap-2 mb-1.5 text-xs font-bold text-white group-hover:text-cyan-400">
              <ShieldCheck className="size-4 text-cyan-400" />
              <span>ประวัติความปลอดภัย</span>
            </div>
            <p className="text-[11px] text-white/50">ตรวจสอบ Audit Log ย้อนหลังทุกการกระทำ</p>
          </button>
        </div>
      </div>

      {/* Database State and 1-Click Operations */}
      <div className="rounded-2xl border border-white/10 bg-[#0d0d12] p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <h4 className="font-heading text-sm font-bold text-white flex items-center gap-2">
              <Database className="size-4 text-[#ff1e27]" />
              <span>สถานะฐานข้อมูลจริงของระบบ (Live Firestore Database Status)</span>
            </h4>
            <p className="text-xs text-white/50 mt-0.5">
              ระบบเชื่อมต่อกับ Firestore Database จริง ทุกการเพิ่ม/ลบส่งผลตรงไปยังคอลเลกชันในคลาวด์
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
            Connected (Cloud Firestore)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Seeder Card */}
          <div className="rounded-xl border border-white/5 bg-[#121217] p-4 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-white mb-1">
                <Sparkles className="size-4 text-amber-400" />
                <span>นำเข้าชุดข้อมูลตัวอย่างเริ่มต้น (Seed Starter Catalog)</span>
              </div>
              <p className="text-[11px] text-white/50 leading-relaxed">
                สร้างหมวดหมู่ Category 1 และสินค้าสคริปต์ 3 รายการพร้อมรูปภาพและราคา เพื่อทดสอบการทำงานของหน้าร้านทันทีในคลิกเดียว
              </p>
            </div>
            <button
              onClick={onSeedSampleData}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="size-3.5 text-amber-400" />
              <span>โหลดข้อมูลตัวอย่างเริ่มต้น</span>
            </button>
          </div>

          {/* Reset Card */}
          <div className="rounded-xl border border-white/5 bg-[#121217] p-4 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-white mb-1">
                <Trash2 className="size-4 text-red-400" />
                <span>ล้างข้อมูลสินค้าทั้งหมด (Clear Products Database)</span>
              </div>
              <p className="text-[11px] text-white/50 leading-relaxed">
                ลบสินค้าทั้งหมดออกจากคอลเลกชัน products เพื่อคืนสถานะเป็นฐานข้อมูลว่างเปล่า (0 สินค้า) ตามที่ต้องการ
              </p>
            </div>
            <button
              onClick={onClearAllProducts}
              disabled={products.length === 0}
              className="w-full py-2.5 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 disabled:opacity-40 disabled:pointer-events-none text-xs font-bold text-red-300 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Trash2 className="size-3.5" />
              <span>ล้างสินค้าทั้งหมดในฐานข้อมูล</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
