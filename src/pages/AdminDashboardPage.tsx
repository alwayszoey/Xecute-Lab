import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Package, 
  Layers, 
  Users, 
  Megaphone, 
  ShoppingBag, 
  ArrowLeft, 
  ExternalLink,
  CheckCircle2,
  LayoutDashboard,
  Trash2,
  Ticket,
  TrendingUp,
  CreditCard,
  Gift,
  Gamepad2,
  History,
  AlertTriangle,
  MessageCircle,
  Palette,
  Database,
  SlidersHorizontal,
  Sparkles,
  Key,
  Star,
  Tag as TagIcon
} from 'lucide-react';
import { 
  ProductItem, 
  CategoryItem, 
  SiteSettings, 
  UserAccountItem, 
  OrderItem,
  DEFAULT_SITE_SETTINGS,
  listenProducts,
  listenCategories,
  listenSiteSettings,
  saveProduct,
  deleteProduct,
  duplicateProduct,
  clearAllProducts,
  saveCategory,
  deleteCategory,
  saveSiteSettings,
  fetchAllUsers,
  updateUserAccount,
  fetchAllOrders,
  updateOrderStatus,
  seedInitialStoreData,
  ScriptUpdateItem,
  listenScriptUpdates,
  saveScriptUpdate,
  deleteScriptUpdate,
  ensureDefaultCategory,
  ensureDefaultScriptUpdates,
  listenGiveaways,
  listenPromoCodes,
  listenClaims,
  listenReviews,
  listenSupportChats,
  listenTrash,
  GiveawayItem,
  PromoCodeItem,
  ClaimItem,
  ReviewItem,
  SupportChatItem,
  TrashItem,
  logAdminActivity
} from '../lib/store.ts';
import { OWNER_EMAIL } from '../components/ProtectedRoute.tsx';
import { type FirebaseUser } from '../lib/firebase.ts';
import { AdminOverviewTab } from '../components/admin/AdminOverviewTab.tsx';
import { AdminProductsTab } from '../components/admin/AdminProductsTab.tsx';
import { AdminCategoriesTab } from '../components/admin/AdminCategoriesTab.tsx';
import { AdminUsersTab } from '../components/admin/AdminUsersTab.tsx';
import { AdminCmsTab } from '../components/admin/AdminCmsTab.tsx';
import { AdminOrdersTab } from '../components/admin/AdminOrdersTab.tsx';
import { AdminProductModal } from '../components/admin/AdminProductModal.tsx';
import { AdminTagsTab } from '../components/admin/AdminTagsTab.tsx';
import { AdminLicenseVaultTab } from '../components/admin/AdminLicenseVaultTab.tsx';
import { AdminDatabaseInspectorTab } from '../components/admin/AdminDatabaseInspectorTab.tsx';
import { AdminAuditTab } from '../components/admin/AdminAuditTab.tsx';
import { AdminScriptUpdatesTab } from '../components/admin/AdminScriptUpdatesTab.tsx';
import { AdminFinanceTab } from '../components/admin/AdminFinanceTab.tsx';
import { AdminPromoCodesTab } from '../components/admin/AdminPromoCodesTab.tsx';
import { AdminReviewsTab } from '../components/admin/AdminReviewsTab.tsx';
import { AdminGiveawaysTab } from '../components/admin/AdminGiveawaysTab.tsx';
import { AdminMiniGamesTab } from '../components/admin/AdminMiniGamesTab.tsx';
import { AdminClaimsTab } from '../components/admin/AdminClaimsTab.tsx';
import { AdminChatTab } from '../components/admin/AdminChatTab.tsx';
import { AdminThemeTab } from '../components/admin/AdminThemeTab.tsx';
import { AdminTrashModal } from '../components/admin/AdminTrashModal.tsx';

interface AdminDashboardPageProps {
  currentUser: FirebaseUser | null;
  onNavigateHome: () => void;
}

export type AdminTab = 
  | 'overview' 
  | 'products' 
  | 'categories' 
  | 'updates' 
  | 'keys' 
  | 'tags' 
  | 'orders' 
  | 'finance' 
  | 'transactions' 
  | 'promos' 
  | 'reviews' 
  | 'giveaways' 
  | 'minigames' 
  | 'minigames-history' 
  | 'claims' 
  | 'chat' 
  | 'users' 
  | 'cms' 
  | 'theme' 
  | 'database' 
  | 'audit';

type TabCategory = 'all' | 'catalog' | 'sales' | 'community' | 'system';

interface TabDefinition {
  id: AdminTab;
  label: string;
  category: TabCategory;
  icon: React.ReactNode;
  badge?: number | string;
  badgeColor?: string;
}

export function AdminDashboardPage({
  currentUser,
  onNavigateHome
}: AdminDashboardPageProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [activeCategory, setActiveCategory] = useState<TabCategory>('all');

  // Real-time Firestore State
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [users, setUsers] = useState<UserAccountItem[]>([]);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [scriptUpdates, setScriptUpdates] = useState<ScriptUpdateItem[]>([]);
  
  // Real-time Auxiliary States
  const [giveaways, setGiveaways] = useState<GiveawayItem[]>([]);
  const [promoCodes, setPromoCodes] = useState<PromoCodeItem[]>([]);
  const [claims, setClaims] = useState<ClaimItem[]>([]);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [chats, setChats] = useState<SupportChatItem[]>([]);
  const [trashItems, setTrashItems] = useState<TrashItem[]>([]);
  
  const [isRefreshingUsers, setIsRefreshingUsers] = useState(false);
  const [isRefreshingOrders, setIsRefreshingOrders] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal States
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [trashModalOpen, setTrashModalOpen] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Set up real-time listeners for all store collections
  useEffect(() => {
    // Ensure default category and script updates exist in Firestore
    ensureDefaultCategory();
    ensureDefaultScriptUpdates();

    const unsubProducts = listenProducts(setProducts);
    const unsubCategories = listenCategories(setCategories);
    const unsubSettings = listenSiteSettings(setSiteSettings);
    const unsubUpdates = listenScriptUpdates(setScriptUpdates);
    const unsubGiveaways = listenGiveaways(setGiveaways);
    const unsubPromoCodes = listenPromoCodes(setPromoCodes);
    const unsubClaims = listenClaims(setClaims);
    const unsubReviews = listenReviews(setReviews);
    const unsubChats = listenSupportChats(setChats);
    const unsubTrash = listenTrash(setTrashItems);

    loadUsers();
    loadOrders();

    return () => {
      unsubProducts();
      unsubCategories();
      unsubSettings();
      unsubUpdates();
      unsubGiveaways();
      unsubPromoCodes();
      unsubClaims();
      unsubReviews();
      unsubChats();
      unsubTrash();
    };
  }, []);

  const loadUsers = async () => {
    setIsRefreshingUsers(true);
    try {
      const list = await fetchAllUsers();
      setUsers(list);
    } finally {
      setIsRefreshingUsers(false);
    }
  };

  const loadOrders = async () => {
    setIsRefreshingOrders(true);
    try {
      const list = await fetchAllOrders();
      setOrders(list);
    } finally {
      setIsRefreshingOrders(false);
    }
  };

  const adminEmail = currentUser?.email || OWNER_EMAIL;

  // Script Updates Actions
  const handleSaveScriptUpdate = async (update: Partial<ScriptUpdateItem>, id?: string) => {
    await saveScriptUpdate(update, id);
    await logAdminActivity(
      adminEmail,
      id ? 'แก้ไขอัปเดตสคริปต์' : 'โพสต์อัปเดตสคริปต์ใหม่',
      `${update.scriptName} (${update.version}): ${update.title}`,
      'system'
    );
    showToast(id ? 'บันทึกการแก้ไขอัปเดตเรียบร้อย' : 'เพิ่มบันทึกอัปเดตสคริปต์เรียบร้อย');
  };

  const handleDeleteScriptUpdate = async (id: string, title: string) => {
    if (confirm(`คุณต้องการลบอัปเดต "${title}" ใช่หรือไม่?`)) {
      await deleteScriptUpdate(id);
      await logAdminActivity(
        adminEmail,
        'ลบอัปเดตสคริปต์',
        `ลบอัปเดต: ${title} (ID: ${id})`,
        'system'
      );
      showToast('ลบบันทึกอัปเดตเรียบร้อยแล้ว');
    }
  };

  // Product Actions
  const handleSaveProduct = async (prod: Partial<ProductItem>, id?: string) => {
    await saveProduct(prod, id);
    await logAdminActivity(
      adminEmail,
      id ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่',
      `${prod.name || 'Product'} (ราคา: ฿${prod.price || 0})`,
      'product'
    );
    showToast(id ? 'บันทึกการแก้ไขสินค้าเรียบร้อย' : 'เพิ่มสินค้าลงหน้าร้านเรียบร้อย');
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (confirm(`คุณแน่ใจหรือไม่ที่จะลบสินค้า "${name}" ออกจากระบบ?`)) {
      await deleteProduct(id);
      await logAdminActivity(
        adminEmail,
        'ลบสินค้า',
        `ลบสินค้า "${name}" (ID: ${id})`,
        'product'
      );
      showToast('ลบสินค้าเรียบร้อยแล้ว');
    }
  };

  const handleDuplicateProduct = async (id: string) => {
    await duplicateProduct(id);
    await logAdminActivity(
      adminEmail,
      'คัดลอกสินค้า',
      `คัดลอกสินค้า ID: ${id}`,
      'product'
    );
    showToast('คัดลอกสินค้าสำเร็จ');
  };

  const handleToggleRecommended = async (product: ProductItem) => {
    await saveProduct({ isRecommended: !product.isRecommended }, product.id);
    await logAdminActivity(
      adminEmail,
      'สลับสถานะสินค้าแนะนำ',
      `${product.name} -> ${!product.isRecommended ? 'แนะนำ' : 'ปกติ'}`,
      'product'
    );
    showToast(product.isRecommended ? 'นำออกจากสินค้าแนะนำแล้ว' : 'ตั้งเป็นสินค้าแนะนำแล้ว');
  };

  // Category Actions
  const handleSaveCategory = async (cat: Partial<CategoryItem>, id?: string) => {
    await saveCategory(cat, id);
    await logAdminActivity(
      adminEmail,
      id ? 'แก้ไขหมวดหมู่' : 'สร้างหมวดหมู่ใหม่',
      `${cat.name} (Slug: /${cat.slug})`,
      'category'
    );
    showToast(id ? 'บันทึกหมวดหมู่เรียบร้อย' : 'เพิ่มหมวดหมู่ใหม่เรียบร้อย');
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (confirm(`คุณต้องการลบหมวดหมู่ "${name}" ใช่หรือไม่?`)) {
      await deleteCategory(id);
      await logAdminActivity(
        adminEmail,
        'ลบหมวดหมู่',
        `ลบหมวดหมู่ "${name}" (ID: ${id})`,
        'category'
      );
      showToast('ลบหมวดหมู่เรียบร้อยแล้ว');
    }
  };

  // User RBAC Actions
  const handleUpdateUser = async (uid: string, data: Partial<UserAccountItem>) => {
    await updateUserAccount(uid, data);
    await logAdminActivity(
      adminEmail,
      'เปลี่ยนยศ/สิทธิ์ผู้ใช้',
      `UID: ${uid.slice(0, 8)}... | Role: ${data.role} | Status: ${data.status} | Balance: ฿${data.balance}`,
      'user'
    );
    await loadUsers();
    showToast('อัปเดตระดับสิทธิ์และสถานะผู้ใช้เรียบร้อย');
  };

  // Site Settings CMS Actions
  const handleSaveSiteSettings = async (settings: Partial<SiteSettings>) => {
    await saveSiteSettings(settings);
    await logAdminActivity(
      adminEmail,
      'อัปเดตการตั้งค่าเว็บไซต์',
      `Status: ${settings.storeStatus || 'normal'} | Theme: ${settings.primaryColor || '#ff1e27'}`,
      'cms'
    );
    showToast('อัปเดตข้อความและการตั้งค่าเว็บไซต์เรียบร้อย');
  };

  // Order Actions
  const handleUpdateOrderStatus = async (orderId: string, status: OrderItem['status']) => {
    await updateOrderStatus(orderId, status);
    await logAdminActivity(
      adminEmail,
      'เปลี่ยนสถานะคำสั่งซื้อ',
      `Order ID: ${orderId} -> ${status}`,
      'order'
    );
    await loadOrders();
    showToast(`อัปเดตสถานะออเดอร์เป็น ${status}`);
  };

  // Seeder & Reset Actions
  const handleSeedSampleData = async () => {
    if (confirm('คุณต้องการนำเข้าชุดข้อมูลตัวอย่างเริ่มต้น (Category 1 และ Scripts 3 รายการ) ลงใน Firestore ใช่หรือไม่?')) {
      await seedInitialStoreData();
      await loadUsers();
      showToast('นำเข้าข้อมูลตัวอย่างเริ่มต้นลงฐานข้อมูลเรียบร้อย!');
    }
  };

  const handleClearAllProducts = async () => {
    if (confirm('คำเตือน: คุณต้องการลบสินค้าทั้งหมดออกจากฐานข้อมูล products ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้')) {
      await clearAllProducts();
      showToast('ล้างข้อมูลสินค้าทั้งหมดในฐานข้อมูลเรียบร้อย');
    }
  };

  const pendingClaimsCount = claims.filter(c => c.status === 'pending').length;
  const openChatsCount = chats.filter(c => c.status === 'open').length;

  // Complete List of All Admin Tabs
  const allTabs: TabDefinition[] = [
    // Catalog & Store
    { id: 'overview', label: 'ภาพรวม (Overview)', category: 'all', icon: <LayoutDashboard className="size-4" /> },
    { id: 'products', label: 'สินค้า & สคริปต์', category: 'catalog', icon: <Package className="size-4" />, badge: products.length },
    { id: 'categories', label: 'หมวดหมู่สินค้า', category: 'catalog', icon: <Layers className="size-4" />, badge: categories.length },
    { id: 'updates', label: 'อัปเดตสคริปต์ (Patch Notes)', category: 'catalog', icon: <Sparkles className="size-4 text-amber-400" />, badge: scriptUpdates.length },
    { id: 'keys', label: 'คลังคีย์ & License', category: 'catalog', icon: <Key className="size-4 text-emerald-400" /> },
    { id: 'tags', label: 'แท็ก & Badges', category: 'catalog', icon: <TagIcon className="size-4 text-pink-400" /> },
    
    // Sales & Finance
    { id: 'orders', label: 'คำสั่งซื้อ (Orders)', category: 'sales', icon: <ShoppingBag className="size-4 text-emerald-400" />, badge: orders.length },
    { id: 'finance', label: 'รายงานการเงิน & ยอดขาย', category: 'sales', icon: <TrendingUp className="size-4 text-emerald-400" /> },
    { id: 'transactions', label: 'จัดการธุรกรรม', category: 'sales', icon: <CreditCard className="size-4 text-cyan-400" /> },
    { id: 'promos', label: 'โค้ดส่วนลด & โปรโมชั่น', category: 'sales', icon: <Ticket className="size-4 text-violet-400" />, badge: promoCodes.length },

    // Community & Customer Care
    { id: 'reviews', label: 'รีวิวสินค้าหน้าร้าน', category: 'community', icon: <Star className="size-4 text-amber-400" />, badge: reviews.length },
    { id: 'giveaways', label: 'กิจกรรมแจกฟรี', category: 'community', icon: <Gift className="size-4 text-pink-400" />, badge: giveaways.length },
    { id: 'minigames', label: 'ตั้งค่ามินิเกม & สุ่ม', category: 'community', icon: <Gamepad2 className="size-4 text-amber-400" /> },
    { id: 'minigames-history', label: 'ประวัติการเล่นมินิเกม', category: 'community', icon: <History className="size-4 text-cyan-400" /> },
    { id: 'claims', label: 'จัดการเคลม & ประกัน', category: 'community', icon: <AlertTriangle className="size-4 text-red-400" />, badge: pendingClaimsCount > 0 ? `${pendingClaimsCount} รอตรวจ` : claims.length, badgeColor: pendingClaimsCount > 0 ? 'bg-red-500/25 text-red-300 border-red-500/40' : undefined },
    { id: 'chat', label: 'แชทบริการลูกค้า', category: 'community', icon: <MessageCircle className="size-4 text-blue-400" />, badge: openChatsCount > 0 ? `${openChatsCount} ข้อความใหม่` : chats.length, badgeColor: openChatsCount > 0 ? 'bg-emerald-500/25 text-emerald-300 border-emerald-500/40' : undefined },

    // System & Customization
    { id: 'users', label: 'จัดการผู้ใช้ & ยศสิทธิ์', category: 'system', icon: <Users className="size-4 text-purple-400" />, badge: users.length },
    { id: 'cms', label: 'ข้อความ & สถานะเว็บ', category: 'system', icon: <Megaphone className="size-4 text-amber-400" /> },
    { id: 'theme', label: 'ปรับแต่งธีม & สีพื้นหลัง', category: 'system', icon: <Palette className="size-4 text-pink-400" /> },
    { id: 'database', label: 'ฐานข้อมูลจริง & Backup', category: 'system', icon: <Database className="size-4 text-[#ff1e27]" /> },
    { id: 'audit', label: 'ประวัติกิจกรรม (Audit)', category: 'system', icon: <ShieldCheck className="size-4 text-cyan-400" /> }
  ];

  const visibleTabs = activeCategory === 'all' 
    ? allTabs 
    : allTabs.filter(t => t.category === activeCategory || t.id === 'overview');

  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#ff1e27] selection:text-white pb-20">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-[#121217] border border-[#ff1e27]/40 text-white shadow-2xl animate-fade-in text-xs font-semibold">
          <CheckCircle2 className="size-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Cyber Command Bar */}
      <header className="sticky top-0 z-40 bg-[#09090c]/90 backdrop-blur-xl border-b border-white/10 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Brand & Page Info */}
          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateHome}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
              title="กลับไปหน้าแรก"
            >
              <ArrowLeft className="size-4" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-xl bg-[#ff1e27] flex items-center justify-center text-white shadow-[0_0_15px_rgba(255,30,39,0.5)]">
                <ShieldCheck className="size-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-heading text-base sm:text-lg font-bold text-white tracking-wide">
                    XECUTE LAB <span className="text-[#ff1e27]">ADMIN</span>
                  </h1>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono">
                    <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    LIVE
                  </span>
                </div>
                <p className="text-[11px] text-white/40 hidden sm:block">
                  ระบบควบคุมหลังบ้านส่วนกลาง (Central Command Dashboard)
                </p>
              </div>
            </div>
          </div>

          {/* Owner Status & Fast Actions */}
          <div className="flex items-center gap-2.5">
            {/* Owner Email Indicator */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#131318] border border-white/10 text-xs">
              <div className="size-2 rounded-full bg-[#ff1e27] animate-ping" />
              <span className="text-white/50">เจ้าของระบบ:</span>
              <span className="text-white font-mono font-bold text-[#ff1e27]">
                {currentUser?.email || OWNER_EMAIL}
              </span>
            </div>

            {/* Trash Bin Trigger */}
            <button
              onClick={() => setTrashModalOpen(true)}
              className="h-9 px-3 rounded-xl border border-white/10 bg-white/5 hover:bg-red-500/15 hover:border-red-500/30 text-xs font-semibold text-white/80 hover:text-red-300 transition-colors flex items-center gap-1.5 cursor-pointer interactive-tap"
              title="เปิดถังขยะกู้คืนข้อมูล"
            >
              <Trash2 className="size-3.5 text-red-400" />
              <span className="hidden sm:inline">ถังขยะ</span>
              {trashItems.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 font-mono text-[10px]">
                  {trashItems.length}
                </span>
              )}
            </button>

            {/* Open Storefront */}
            <button
              onClick={onNavigateHome}
              className="h-9 px-3.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-semibold text-white/90 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>เปิดหน้าร้าน</span>
              <ExternalLink className="size-3.5" />
            </button>
          </div>

        </div>
      </header>

      {/* Main Workspace Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-5 space-y-5">
        
        {/* Category Pills Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <div className="flex items-center gap-1 text-xs text-white/40 font-semibold mr-1 shrink-0">
            <SlidersHorizontal className="size-3.5 text-[#ff1e27]" />
            <span>กลุ่มเมนู:</span>
          </div>

          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeCategory === 'all'
                ? 'bg-[#ff1e27] text-white font-bold shadow-md shadow-[#ff1e27]/25'
                : 'bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/10'
            }`}
          >
            ทั้งหมด (21 หมวด)
          </button>

          <button
            onClick={() => setActiveCategory('catalog')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeCategory === 'catalog'
                ? 'bg-[#ff1e27] text-white font-bold shadow-md shadow-[#ff1e27]/25'
                : 'bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/10'
            }`}
          >
            สินค้า & สคริปต์
          </button>

          <button
            onClick={() => setActiveCategory('sales')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeCategory === 'sales'
                ? 'bg-[#ff1e27] text-white font-bold shadow-md shadow-[#ff1e27]/25'
                : 'bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/10'
            }`}
          >
            การเงิน & ออเดอร์
          </button>

          <button
            onClick={() => setActiveCategory('community')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeCategory === 'community'
                ? 'bg-[#ff1e27] text-white font-bold shadow-md shadow-[#ff1e27]/25'
                : 'bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/10'
            }`}
          >
            ลูกค้า & ชุมชน
          </button>

          <button
            onClick={() => setActiveCategory('system')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeCategory === 'system'
                ? 'bg-[#ff1e27] text-white font-bold shadow-md shadow-[#ff1e27]/25'
                : 'bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/10'
            }`}
          >
            ระบบ & ความปลอดภัย
          </button>
        </div>

        {/* Tab Badges & Navigation Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-white/10">
          {visibleTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-[#ff1e27] text-white shadow-lg shadow-[#ff1e27]/25 font-bold'
                    : 'text-white/65 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/5'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    tab.badgeColor ? tab.badgeColor : isActive ? 'bg-black/30 text-white' : 'bg-white/10 text-white/60'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content Rendering */}
        <div className="min-h-[600px]">
          {activeTab === 'overview' && (
            <AdminOverviewTab
              products={products}
              categories={categories}
              users={users}
              orders={orders}
              settings={siteSettings}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onOpenAddProduct={() => {
                setEditingProduct(null);
                setProductModalOpen(true);
              }}
              onSeedSampleData={handleSeedSampleData}
              onClearAllProducts={handleClearAllProducts}
            />
          )}

          {activeTab === 'products' && (
            <AdminProductsTab
              products={products}
              categories={categories}
              onOpenAddModal={() => {
                setEditingProduct(null);
                setProductModalOpen(true);
              }}
              onOpenEditModal={(p) => {
                setEditingProduct(p);
                setProductModalOpen(true);
              }}
              onDuplicateProduct={handleDuplicateProduct}
              onDeleteProduct={handleDeleteProduct}
              onSwitchToCategories={() => setActiveTab('categories')}
              onOpenTrash={() => setTrashModalOpen(true)}
            />
          )}

          {activeTab === 'categories' && (
            <AdminCategoriesTab
              categories={categories}
              onSaveCategory={handleSaveCategory}
              onDeleteCategory={handleDeleteCategory}
            />
          )}

          {activeTab === 'updates' && (
            <AdminScriptUpdatesTab
              updates={scriptUpdates}
              onSaveUpdate={handleSaveScriptUpdate}
              onDeleteUpdate={handleDeleteScriptUpdate}
            />
          )}

          {activeTab === 'keys' && (
            <AdminLicenseVaultTab
              products={products}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'tags' && (
            <AdminTagsTab
              products={products}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'orders' && (
            <AdminOrdersTab
              orders={orders}
              onUpdateStatus={handleUpdateOrderStatus}
              onRefreshOrders={loadOrders}
              isRefreshing={isRefreshingOrders}
            />
          )}

          {activeTab === 'finance' && (
            <AdminFinanceTab
              orders={orders}
              mode="finance"
            />
          )}

          {activeTab === 'transactions' && (
            <AdminFinanceTab
              orders={orders}
              mode="transactions"
            />
          )}

          {activeTab === 'promos' && (
            <AdminPromoCodesTab
              onShowToast={showToast}
            />
          )}

          {activeTab === 'reviews' && (
            <AdminReviewsTab
              onShowToast={showToast}
            />
          )}

          {activeTab === 'giveaways' && (
            <AdminGiveawaysTab
              onShowToast={showToast}
            />
          )}

          {activeTab === 'minigames' && (
            <AdminMiniGamesTab
              mode="settings"
              onShowToast={showToast}
            />
          )}

          {activeTab === 'minigames-history' && (
            <AdminMiniGamesTab
              mode="history"
              onShowToast={showToast}
            />
          )}

          {activeTab === 'claims' && (
            <AdminClaimsTab
              onShowToast={showToast}
            />
          )}

          {activeTab === 'chat' && (
            <AdminChatTab
              onShowToast={showToast}
            />
          )}

          {activeTab === 'users' && (
            <AdminUsersTab
              users={users}
              onUpdateUser={handleUpdateUser}
              onRefreshUsers={loadUsers}
              isRefreshing={isRefreshingUsers}
            />
          )}

          {activeTab === 'cms' && (
            <AdminCmsTab
              settings={siteSettings}
              onSaveSettings={handleSaveSiteSettings}
            />
          )}

          {activeTab === 'theme' && (
            <AdminThemeTab
              settings={siteSettings}
              onSaveSettings={handleSaveSiteSettings}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'database' && (
            <AdminDatabaseInspectorTab
              productsCount={products.length}
              categoriesCount={categories.length}
              usersCount={users.length}
              ordersCount={orders.length}
              onShowToast={showToast}
            />
          )}

          {activeTab === 'audit' && (
            <AdminAuditTab />
          )}
        </div>

      </main>

      {/* Add / Edit Product Modal (Live Card Preview) */}
      <AdminProductModal
        isOpen={productModalOpen}
        editingProduct={editingProduct}
        categories={categories}
        allProducts={products}
        onClose={() => setProductModalOpen(false)}
        onSave={handleSaveProduct}
      />

      {/* Trash / Recycle Bin Modal */}
      <AdminTrashModal
        isOpen={trashModalOpen}
        onClose={() => setTrashModalOpen(false)}
        onShowToast={showToast}
      />

    </div>
  );
}
