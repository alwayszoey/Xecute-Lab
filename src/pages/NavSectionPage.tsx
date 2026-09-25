import React, { useState } from 'react';
import { 
  Package, 
  Trophy, 
  Sparkles, 
  MessageSquare, 
  ChevronRight, 
  ExternalLink, 
  ShieldCheck, 
  Send, 
  Clock, 
  Flame, 
  Layers, 
  Mail,
  CheckCircle2,
  AlertCircle,
  Plus,
  Edit3,
  Trash2,
  Download,
  Terminal,
  RefreshCw,
  Copy,
  Tag,
  Check,
  Search
} from 'lucide-react';
import { 
  CategoryItem, 
  ProductItem, 
  ScriptUpdateItem, 
  DEFAULT_SCRIPT_UPDATES,
  DEFAULT_CATEGORY 
} from '../lib/store.ts';
import { ScriptUpdateModal } from '../components/admin/ScriptUpdateModal.tsx';
import { CategoryModal } from '../components/admin/CategoryModal.tsx';

interface NavSectionPageProps {
  sectionId: 'packages' | 'rankings' | 'activities' | 'contact';
  categories?: CategoryItem[];
  products?: ProductItem[];
  scriptUpdates?: ScriptUpdateItem[];
  isOwner?: boolean;
  onNavigateHome: () => void;
  onOpenCategory?: () => void;
  onSelectCategory?: (category: CategoryItem) => void;
  onSelectProduct?: (product: ProductItem) => void;
  onSaveScriptUpdate?: (update: Partial<ScriptUpdateItem>, id?: string) => Promise<void>;
  onDeleteScriptUpdate?: (id: string, title: string) => Promise<void>;
  onSaveCategory?: (cat: Partial<CategoryItem>, id?: string) => Promise<void>;
  onDeleteCategory?: (id: string, name: string) => Promise<void>;
  onEditProduct?: (product: ProductItem) => void;
  onDeleteProduct?: (id: string, name: string) => Promise<void>;
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; border: string }> = {
  undetected: {
    label: 'Undetected (ปลอดภัย 100%)',
    bg: 'bg-emerald-500/15',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30'
  },
  updating: {
    label: 'Updating (กำลังอัปเดตแพตช์)',
    bg: 'bg-amber-500/15',
    text: 'text-amber-300',
    border: 'border-amber-500/30'
  },
  testing: {
    label: 'Testing (กำลังทดสอบระบบ)',
    bg: 'bg-blue-500/15',
    text: 'text-blue-300',
    border: 'border-blue-500/30'
  },
  patched: {
    label: 'Patched (ตรวจจับชั่วคราว)',
    bg: 'bg-red-500/15',
    text: 'text-red-400',
    border: 'border-red-500/30'
  }
};

export function NavSectionPage({ 
  sectionId, 
  categories = [], 
  products = [], 
  scriptUpdates = [],
  isOwner = false,
  onNavigateHome, 
  onOpenCategory,
  onSelectCategory,
  onSelectProduct,
  onSaveScriptUpdate,
  onDeleteScriptUpdate,
  onSaveCategory,
  onDeleteCategory,
  onEditProduct,
  onDeleteProduct
}: NavSectionPageProps) {
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSent, setContactSent] = useState(false);

  // Script Update Modal States for Admin
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [editingUpdate, setEditingUpdate] = useState<ScriptUpdateItem | null>(null);

  // Category Modal States for Admin
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<CategoryItem | null>(null);

  // Script Updates filter & copy states
  const [copiedScriptId, setCopiedScriptId] = useState<string | null>(null);
  const [filterGame, setFilterGame] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const handleCopyScript = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedScriptId(id);
    setTimeout(() => setCopiedScriptId(null), 2000);
  };

  const getSectionData = () => {
    switch (sectionId) {
      case 'packages':
        return {
          title: 'แพ็คเกจ / สินค้า',
          subtitle: 'เลือกชมหมวดหมู่สินค้า และรายการแพ็คเกจสคริปต์คุณภาพสูงทั้งหมด',
          icon: <Package className="size-6 text-[#ff1e27]" />
        };
      case 'rankings':
        return {
          title: 'อันดับยอดนิยม',
          subtitle: 'สถิติสคริปต์และแพ็คเกจยอดนิยมที่มีผู้ใช้งานมากที่สุดประจำเดือน',
          icon: <Trophy className="size-6 text-[#ff1e27]" />
        };
      case 'activities':
        return {
          title: 'อัปเดตสคริปต์ & Patch Notes',
          subtitle: 'ศูนย์รวมบันทึกประวัติการอัปเดตเวอร์ชัน, สถานะความปลอดภัย (Undetected) และแพตช์ล่าสุด',
          icon: <Sparkles className="size-6 text-[#ff1e27]" />
        };
      case 'contact':
        return {
          title: 'ติดต่อร้านค้า & แอดมิน',
          subtitle: 'ช่องทางการสอบถามข้อมูล แจ้งปัญหาการใช้งาน หรือขอความช่วยเหลือตลอด 24 ชม.',
          icon: <MessageSquare className="size-6 text-[#ff1e27]" />
        };
      default:
        return {
          title: 'ข้อมูล',
          subtitle: 'รายละเอียดหน้าร้านค้า',
          icon: <Package className="size-6 text-[#ff1e27]" />
        };
    }
  };

  const info = getSectionData();

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactMessage.trim()) return;
    setContactSent(true);
    setTimeout(() => {
      setContactSubject('');
      setContactMessage('');
    }, 1000);
  };

  const handleOpenAddUpdate = () => {
    setEditingUpdate(null);
    setUpdateModalOpen(true);
  };

  const handleOpenEditUpdate = (item: ScriptUpdateItem) => {
    setEditingUpdate(item);
    setUpdateModalOpen(true);
  };

  const handleDeleteUpdateConfirm = async (id: string, title: string) => {
    if (confirm(`คุณต้องการลบการแจ้งเตือนอัปเดตสคริปต์ "${title}" ใช่หรือไม่?`)) {
      if (onDeleteScriptUpdate) {
        await onDeleteScriptUpdate(id, title);
      }
    }
  };

  const handleOpenAddCategory = () => {
    setEditingCat(null);
    setCatModalOpen(true);
  };

  const handleOpenEditCategory = (cat: CategoryItem) => {
    setEditingCat(cat);
    setCatModalOpen(true);
  };

  const handleDeleteCategoryConfirm = async (id: string, name: string) => {
    if (confirm(`คุณต้องการลบหมวดหมู่ "${name}" ใช่หรือไม่?`)) {
      if (onDeleteCategory) {
        await onDeleteCategory(id, name);
      }
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 max-w-6xl space-y-8 animate-fade-in">
      
      {/* Breadcrumb */}
      <ol className="flex flex-wrap items-center gap-y-2 whitespace-nowrap text-sm text-white/60" aria-label="Breadcrumb">
        <li className="inline-flex items-center">
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
              <path d="M219.31,108.68l-80-80a16,16,0,0,0-22.62,0l-80,80A15.87,15.87,0,0,0,32,120v96a8,8,0,0,0,8,8h64a8,8,0,0,0,8-8V160h32v56a8,8,0,0,0,8,8h64a8,8,0,0,0,8-8V120A15.87,15.87,0,0,0,219.31,108.68ZM208,208H160V152a8,8,0,0,0-8-8H104a8,8,0,0,0-8,8v56H48V120l80-80,80,80Z" />
            </svg>
            <span>หน้าแรก</span>
          </button>
          <ChevronRight className="mx-2 size-4 text-white/30 shrink-0" />
        </li>

        <li className="inline-flex items-center">
          <span className="text-white font-medium truncate" aria-current="page">
            {info.title}
          </span>
        </li>
      </ol>

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-[#141414] via-[#0c0c0c] to-[#170505] p-6 sm:p-10 shadow-2xl">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <div className="size-10 rounded-xl bg-[#ff1e27]/10 border border-[#ff1e27]/20 flex items-center justify-center shadow-inner">
                {info.icon}
              </div>
              <span className="text-xs font-semibold text-[#ff1e27] tracking-wider uppercase font-mono">
                Xecute Lab Store
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
              {info.title}
            </h1>
            <p className="text-sm text-white/60">
              {info.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Admin Actions on Header Banner */}
            {isOwner && sectionId === 'activities' && (
              <button
                onClick={handleOpenAddUpdate}
                className="btn-primary h-9 px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg cursor-pointer"
              >
                <Plus className="size-4" />
                <span>+ เขียนอัปเดตใหม่</span>
              </button>
            )}

            {isOwner && sectionId === 'packages' && (
              <button
                onClick={handleOpenAddCategory}
                className="btn-primary h-9 px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg cursor-pointer"
              >
                <Plus className="size-4" />
                <span>+ เพิ่มหมวดหมู่ใหม่</span>
              </button>
            )}

            <button
              onClick={onNavigateHome}
              className="btn-secondary h-9 px-4 rounded-xl text-xs shrink-0 cursor-pointer"
            >
              ← กลับหน้าแรก
            </button>
          </div>
        </div>

        {/* Ambient Decorative Light */}
        <div className="absolute right-0 top-0 -mr-16 -mt-16 size-64 rounded-full bg-[#ff1e27]/10 blur-3xl pointer-events-none" />
      </div>

      {/* =========================================================================
          VIEW CONTENT DEPENDING ON SECTION
          ========================================================================= */}

      {/* SECTION 1: PACKAGES / CATEGORIES */}
      {sectionId === 'packages' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white font-heading flex items-center gap-2">
              <Layers className="size-5 text-[#ff1e27]" />
              <span>หมวดหมู่สินค้าทั้งหมด ({categories.length})</span>
            </h2>
            {isOwner && (
              <button
                onClick={handleOpenAddCategory}
                className="btn-primary px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="size-3.5" />
                <span>เพิ่มหมวดหมู่</span>
              </button>
            )}
          </div>

          {categories.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/15 bg-[#0a0a0e] p-8 text-center space-y-3">
              <p className="text-xs text-white/50">ยังไม่มีหมวดหมู่สินค้าในระบบ</p>
              {isOwner && onSaveCategory && (
                <button
                  onClick={() => onSaveCategory(DEFAULT_CATEGORY, 'category-1')}
                  className="btn-primary px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  + โหลดหมวดหมู่เริ่มต้น (Category 1)
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {categories.map((cat) => {
                const count = products.filter(p => p.categoryId === cat.id).length;
                return (
                  <div 
                    key={cat.id}
                    className="group relative rounded-2xl border border-white/10 bg-[#0f0f0f] hover:bg-[#141414] p-5 transition-all duration-300 hover:border-[#ff1e27]/40 shadow-xl flex flex-col justify-between"
                  >
                    <div>
                      {/* Banner Image */}
                      <div 
                        onClick={() => onSelectCategory ? onSelectCategory(cat) : (onOpenCategory && onOpenCategory())}
                        className="aspect-video w-full rounded-xl overflow-hidden mb-4 border border-white/10 bg-neutral-900 cursor-pointer"
                      >
                        <img
                          src={cat.imageUrl || "https://img.rdcw.co.th/images/3c8f784a0a8cbe99c7e6e9f6dc9a1cc0d8474a530a8dc891e45cd03eed2ce832.jpeg"}
                          alt={cat.name}
                          className="size-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-[#ff1e27]">
                          หมวดหมู่ #{cat.orderIndex || 1}
                        </span>
                        <span className="text-[11px] text-emerald-400 font-mono">
                          {count} สินค้า
                        </span>
                      </div>

                      <h3 
                        onClick={() => onSelectCategory ? onSelectCategory(cat) : (onOpenCategory && onOpenCategory())}
                        className="text-base font-bold text-white group-hover:text-[#ff3b42] transition-colors cursor-pointer line-clamp-1"
                      >
                        {cat.name}
                      </h3>

                      <p className="text-xs text-white/50 mt-1 line-clamp-2">
                        {cat.description || `มีสินค้าพร้อมจำหน่าย ${count} รายการ`}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => onSelectCategory ? onSelectCategory(cat) : (onOpenCategory && onOpenCategory())}
                        className="text-xs text-white/80 hover:text-white flex items-center gap-1 font-semibold cursor-pointer"
                      >
                        <span>เข้าชมหมวดหมู่</span>
                        <ChevronRight className="size-3.5 text-[#ff1e27]" />
                      </button>

                      {/* DIRECT EDIT & DELETE FOR ADMIN */}
                      {isOwner && (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEditCategory(cat);
                            }}
                            className="px-2 py-1 rounded-lg bg-[#ff1e27]/15 text-[#ff1e27] hover:bg-[#ff1e27] hover:text-white transition-colors text-xs font-semibold flex items-center gap-1 cursor-pointer"
                            title="แก้ไขหมวดหมู่"
                          >
                            <Edit3 className="size-3" />
                            <span>แก้ไข</span>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCategoryConfirm(cat.id, cat.name);
                            }}
                            className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                            title="ลบหมวดหมู่"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: RANKINGS */}
      {sectionId === 'rankings' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-[#0f0f0f] overflow-hidden shadow-xl">
            <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="size-5 text-[#ff1e27]" />
                <h2 className="text-base font-bold text-white font-heading">
                  อันดับความนิยมสูงสุดประจำสัปดาห์
                </h2>
              </div>
              <span className="text-xs text-white/40">อัปเดตแบบเรียลไทม์</span>
            </div>

            <div className="p-12 sm:p-16 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <div className="size-20 rounded-2xl bg-[#ff1e27]/10 border border-[#ff1e27]/25 flex items-center justify-center text-[#ff1e27] shadow-[0_0_30px_rgba(255,30,39,0.25)] animate-pulse">
                  <Trophy className="size-10" />
                </div>
                <div className="absolute -top-1 -right-1 size-3.5 rounded-full bg-[#ff1e27] animate-ping opacity-60" />
              </div>

              <div className="space-y-2 max-w-md">
                <h3 className="text-lg sm:text-2xl font-bold text-white font-heading tracking-tight">
                  “เอ๊ะ..ดูเหมือนว่าตอนนี้จะยังไม่มีอันดับความนิยมนะ!”
                </h3>
                <p className="text-xs sm:text-sm text-white/50 leading-relaxed">
                  ตารางอันดับสคริปต์และแพ็คเกจยอดนิยมกำลังรอข้อมูลการใช้งานจริง สามารถเข้าชมหมวดหมู่สินค้าเพื่อเริ่มสั่งซื้อได้เลย
                </p>
              </div>

              <div className="pt-2 flex items-center gap-3">
                {onOpenCategory && (
                  <button
                    type="button"
                    onClick={onOpenCategory}
                    className="btn-primary h-9 px-5 rounded-xl text-xs sm:text-sm font-medium cursor-pointer"
                  >
                    เลือกชมหมวดหมู่สินค้า
                  </button>
                )}
                <button
                  type="button"
                  onClick={onNavigateHome}
                  className="btn-secondary h-9 px-4 rounded-xl text-xs sm:text-sm cursor-pointer"
                >
                  กลับสู่หน้าแรก
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: ACTIVITIES & SCRIPT UPDATES (DYNAMIC FROM FIRESTORE WITH EDIT/DELETE/ADD) */}
      {sectionId === 'activities' && (() => {
        const filteredUpdates = scriptUpdates.filter((item) => {
          if (filterGame !== 'all' && item.game.toLowerCase() !== filterGame.toLowerCase()) return false;
          if (filterStatus !== 'all' && item.status !== filterStatus) return false;
          if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            const matchTitle = item.title.toLowerCase().includes(q);
            const matchScript = item.scriptName.toLowerCase().includes(q);
            const matchGame = item.game.toLowerCase().includes(q);
            const matchDesc = item.description?.toLowerCase().includes(q);
            if (!matchTitle && !matchScript && !matchGame && !matchDesc) return false;
          }
          return true;
        });

        // Available games for filter pills
        const availableGames = Array.from(new Set(scriptUpdates.map(u => u.game).filter(Boolean)));

        return (
          <div className="space-y-6">
            
            {/* Top Bar for Script Updates with Filter & Search */}
            <div className="flex flex-col gap-4 p-4 sm:p-5 rounded-2xl bg-[#0f0f14] border border-white/10 shadow-lg">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="size-9 rounded-xl bg-[#ff1e27]/15 border border-[#ff1e27]/30 flex items-center justify-center text-[#ff1e27]">
                    <Terminal className="size-4.5" />
                  </div>
                  <div>
                    <h3 className="font-heading text-base sm:text-lg font-bold text-white flex items-center gap-2">
                      <span>ประวัติแพตช์และบันทึกอัปเดตสคริปต์</span>
                      <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[#ff1e27]/15 border border-[#ff1e27]/30 text-white font-bold">
                        {filteredUpdates.length} / {scriptUpdates.length}
                      </span>
                    </h3>
                    <p className="text-xs text-white/50 mt-0.5">
                      ตรวจสอบความปลอดภัยของสคริปต์ ข้อมูลเวอร์ชัน และรายละเอียดแพตช์ล่าสุดก่อนนำไปใช้งาน
                    </p>
                  </div>
                </div>

                {/* Admin Add Update Button */}
                {isOwner && (
                  <button
                    type="button"
                    onClick={handleOpenAddUpdate}
                    className="btn-primary h-9 px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-[#ff1e27]/20 cursor-pointer shrink-0"
                  >
                    <Plus className="size-4" />
                    <span>+ เขียนอัปเดตใหม่</span>
                  </button>
                )}
              </div>

              {/* Filters & Search Row */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-white/10">
                {/* Game filter pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                  <button
                    type="button"
                    onClick={() => setFilterGame('all')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                      filterGame === 'all'
                        ? 'bg-[#ff1e27] text-white shadow-md shadow-[#ff1e27]/25'
                        : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10'
                    }`}
                  >
                    ทั้งหมด
                  </button>
                  {availableGames.map((gm) => (
                    <button
                      key={gm}
                      type="button"
                      onClick={() => setFilterGame(gm)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                        filterGame.toLowerCase() === gm.toLowerCase()
                          ? 'bg-[#ff1e27] text-white shadow-md shadow-[#ff1e27]/25'
                          : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10'
                      }`}
                    >
                      {gm}
                    </button>
                  ))}
                  
                  {/* Status filter: Undetected only */}
                  <button
                    type="button"
                    onClick={() => setFilterStatus(filterStatus === 'undetected' ? 'all' : 'undetected')}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                      filterStatus === 'undetected'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/10'
                    }`}
                  >
                    <span className="size-1.5 rounded-full bg-emerald-400" />
                    <span>Undetected</span>
                  </button>
                </div>

                {/* Search input */}
                <div className="relative min-w-[200px] sm:max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-white/40" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ค้นหาอัปเดต / สคริปต์..."
                    className="w-full bg-[#15151e] border border-white/15 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white focus:border-[#ff1e27] focus:outline-none placeholder:text-white/40"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white text-xs cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Updates List - Cyber Red Lab Card Theme */}
            {filteredUpdates.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/15 bg-[#0a0a0e] p-8 sm:p-12 text-center space-y-4 shadow-xl">
                <div className="size-14 rounded-2xl bg-[#ff1e27]/10 border border-[#ff1e27]/25 flex items-center justify-center text-[#ff1e27] mx-auto">
                  <Terminal className="size-7" />
                </div>
                <div>
                  <h4 className="font-heading text-lg font-bold text-white">
                    {searchQuery || filterGame !== 'all' || filterStatus !== 'all' 
                      ? 'ไม่พบข้อมูลอัปเดตสคริปต์ที่ตรงกับเงื่อนไข' 
                      : 'ยังไม่มีบันทึกอัปเดตสคริปต์ในระบบ'}
                  </h4>
                  <p className="text-xs text-white/50 mt-1 max-w-sm mx-auto">
                    {searchQuery || filterGame !== 'all' || filterStatus !== 'all'
                      ? 'ลองล้างคำค้นหาหรือเปลี่ยนตัวกรองเพื่อดูรายการทั้งหมด'
                      : 'คุณสามารถเขียนแจ้งเตือนการอัปเดต หรือกดโหลดข้อมูลตัวอย่างเริ่มต้นได้ทันที'}
                  </p>
                </div>

                {(searchQuery || filterGame !== 'all' || filterStatus !== 'all') ? (
                  <button
                    onClick={() => { setSearchQuery(''); setFilterGame('all'); setFilterStatus('all'); }}
                    className="btn-secondary h-9 px-4 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    ล้างตัวกรองทั้งหมด
                  </button>
                ) : (
                  isOwner && onSaveScriptUpdate && (
                    <div className="flex items-center justify-center gap-3 pt-1">
                      <button
                        onClick={handleOpenAddUpdate}
                        className="btn-primary px-5 py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-lg"
                      >
                        <Plus className="size-4" />
                        <span>เขียนอัปเดตสคริปต์แรก</span>
                      </button>
                      <button
                        onClick={async () => {
                          for (const u of DEFAULT_SCRIPT_UPDATES) {
                            await onSaveScriptUpdate(u);
                          }
                        }}
                        className="px-4 py-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-semibold text-white/90 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <RefreshCw className="size-3.5 text-[#ff1e27]" />
                        <span>โหลดตัวอย่างอัปเดต</span>
                      </button>
                    </div>
                  )
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredUpdates.map((item) => {
                  const statusStyle = STATUS_CONFIG[item.status] || STATUS_CONFIG.undetected;
                  const displayDesc = item.description || 'ให้รวดเร็วยิ่งขึ้น ปรับปรุงความเสถียรในการรันสคริปต์ และเพิ่มการเข้ารหัสข้อมูล SSL ชั้นสูง เพื่อความปลอดภัยสูงสุดของบัญชีผู้ใช้งาน';

                  return (
                    <div 
                      key={item.id} 
                      className="group relative rounded-2xl border border-white/10 bg-gradient-to-b from-[#121217] via-[#0d0d12] to-[#09090c] hover:border-[#ff1e27]/50 hover:shadow-[0_0_25px_rgba(255,30,39,0.15)] transition-all duration-300 p-5 sm:p-6 flex flex-col justify-between space-y-4 overflow-hidden"
                    >
                      {/* Top Ambient Red Glow Accent Line */}
                      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#ff1e27]/60 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />

                      <div className="space-y-3.5">
                        {/* Top Row: Meta Badges & Direct Admin Actions */}
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-[#ff1e27] px-2.5 py-0.5 rounded-md bg-[#ff1e27]/15 border border-[#ff1e27]/30">
                              {item.game} {item.version}
                            </span>
                            <span className="text-xs text-white/40 flex items-center gap-1 font-mono">
                              <Clock className="size-3 text-white/30" />
                              <span>{item.releaseDate || 'ล่าสุด'}</span>
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Safety Status Pill with animated dot */}
                            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                              <span className={`size-1.5 rounded-full ${statusStyle.text.replace('text-', 'bg-')} ${item.status === 'undetected' ? 'animate-pulse' : ''}`} />
                              <span>{statusStyle.label}</span>
                            </span>

                            {/* DIRECT EDIT & DELETE FOR ADMIN */}
                            {isOwner && (
                              <div className="flex items-center gap-1 ml-1 pl-2 border-l border-white/10">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditUpdate(item)}
                                  className="px-2.5 py-1 rounded-lg bg-[#ff1e27]/15 text-[#ff1e27] hover:bg-[#ff1e27] hover:text-white transition-colors text-xs font-semibold flex items-center gap-1 cursor-pointer"
                                  title="แก้ไขอัปเดตนี้"
                                >
                                  <Edit3 className="size-3" />
                                  <span>แก้ไข</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteUpdateConfirm(item.id, item.title)}
                                  className="p-1 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                                  title="ลบอัปเดตนี้"
                                >
                                  <Trash2 className="size-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Title & Script Name */}
                        <div>
                          <span className="text-[11px] text-[#ff1e27] font-semibold block uppercase tracking-wider font-mono">
                            {item.scriptName}
                          </span>
                          <h4 className="text-base sm:text-lg font-bold text-white group-hover:text-white transition-colors leading-snug font-heading mt-0.5">
                            {item.title}
                          </h4>
                        </div>

                        {/* Description Box (CSS Styled - matches provided format) */}
                        <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 text-xs sm:text-sm text-white/90 leading-relaxed font-normal">
                          {displayDesc}
                        </div>

                        {/* Tags */}
                        {item.tags && item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {item.tags.map((tag, tIdx) => (
                              <span key={tIdx} className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-white/5 text-white/60 border border-white/10 flex items-center gap-1">
                                <Tag className="size-2.5 text-[#ff1e27]" />
                                <span>#{tag}</span>
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Changelog Items */}
                        {item.changelog && item.changelog.length > 0 && (
                          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 block mb-1">
                              รายละเอียดการเปลี่ยนแปลง (Changelog):
                            </span>
                            {item.changelog.map((line, idx) => (
                              <div key={idx} className="text-xs text-white/80 flex items-start gap-2">
                                <span className="text-[#ff1e27] font-bold">•</span>
                                <span className="leading-relaxed">{line}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Action Buttons: Copy Script & Download Link */}
                      <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {item.scriptCode && (
                            <button
                              type="button"
                              onClick={() => handleCopyScript(item.id, item.scriptCode!)}
                              className="px-3 py-1.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-semibold text-white/90 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer font-mono"
                            >
                              {copiedScriptId === item.id ? (
                                <>
                                  <Check className="size-3.5 text-emerald-400" />
                                  <span className="text-emerald-400 font-bold">คัดลอกสคริปต์แล้ว!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="size-3.5 text-[#ff1e27]" />
                                  <span>คัดลอกโค้ดสคริปต์</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>

                        {item.downloadUrl && (
                          <a
                            href={item.downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-primary h-8 px-4 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#ff1e27]/20"
                          >
                            <Download className="size-3.5" />
                            <span>ดาวน์โหลดเวอร์ชัน {item.version}</span>
                          </a>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>
        );
      })()}

      {/* SECTION 4: CONTACT STORE */}
      {sectionId === 'contact' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact Details Card */}
          <div className="rounded-2xl border border-white/10 bg-[#0f0f0f] p-6 sm:p-8 space-y-6 shadow-xl">
            <div>
              <h2 className="text-lg font-bold text-white font-heading">
                ศูนย์บริการและติดต่อร้านค้า
              </h2>
              <p className="text-xs sm:text-sm text-white/50 mt-1">
                มีข้อสงสัยหรือต้องการสอบถามรายละเอียดเพิ่มเติมเกี่ยวกับ Scripts และ Keys? ทีมงานพร้อมดูแลคุณ
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3.5 p-3.5 rounded-xl border border-white/5 bg-white/[0.02]">
                <div className="size-10 rounded-lg bg-[#ff1e27]/10 border border-[#ff1e27]/20 flex items-center justify-center text-[#ff1e27]">
                  <MessageSquare className="size-5" />
                </div>
                <div>
                  <span className="text-xs text-white/40 block">Discord Community & Support</span>
                  <span className="text-sm font-semibold text-white">discord.gg/xecutelab</span>
                </div>
              </div>

              <div className="flex items-center gap-3.5 p-3.5 rounded-xl border border-white/5 bg-white/[0.02]">
                <div className="size-10 rounded-lg bg-[#ff1e27]/10 border border-[#ff1e27]/20 flex items-center justify-center text-[#ff1e27]">
                  <Mail className="size-5" />
                </div>
                <div>
                  <span className="text-xs text-white/40 block">Email ติดต่อฝ่ายเทคนิค</span>
                  <span className="text-sm font-semibold text-white">support@xecutelab.store</span>
                </div>
              </div>

              <div className="flex items-center gap-3.5 p-3.5 rounded-xl border border-white/5 bg-white/[0.02]">
                <div className="size-10 rounded-lg bg-[#ff1e27]/10 border border-[#ff1e27]/20 flex items-center justify-center text-[#ff1e27]">
                  <ShieldCheck className="size-5" />
                </div>
                <div>
                  <span className="text-xs text-white/40 block">เวลาทำการและการซัพพอร์ต</span>
                  <span className="text-sm font-semibold text-white">บริการตลอด 24 ชั่วโมง (อัตโนมัติ)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Message Form */}
          <div className="rounded-2xl border border-white/10 bg-[#0f0f0f] p-6 sm:p-8 shadow-xl">
            <h2 className="text-lg font-bold text-white font-heading mb-1">
              ส่งข้อความหาทีมงาน
            </h2>
            <p className="text-xs sm:text-sm text-white/50 mb-5">
              กรอกข้อมูลเพื่อส่งเรื่องสอบถามหรือแจ้งปัญหา ทีมงานจะติดต่อกลับโดยเร็วที่สุด
            </p>

            {contactSent ? (
              <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
                <CheckCircle2 className="size-8 text-emerald-400 mx-auto" />
                <h4 className="font-heading text-base font-bold text-white">ส่งข้อความเรียบร้อยแล้ว</h4>
                <p className="text-xs text-white/60">ขอบคุณสำหรับการติดต่อ ทีมงานได้รับข้อความเรียบร้อยแล้ว</p>
                <button
                  type="button"
                  onClick={() => setContactSent(false)}
                  className="btn-secondary mt-3 px-4 py-1.5 rounded-lg text-xs"
                >
                  ส่งข้อความใหม่
                </button>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1">หัวข้อเรื่อง</label>
                  <input
                    type="text"
                    required
                    value={contactSubject}
                    onChange={(e) => setContactSubject(e.target.value)}
                    placeholder="เช่น สอบถามวิธีการใช้งานสคริปต์, แจ้งปัญหาคีย์"
                    className="w-full bg-[#15151b] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#ff1e27] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/80 mb-1">ข้อความรายละเอียด</label>
                  <textarea
                    rows={4}
                    required
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="ระบุข้อความของคุณที่นี่..."
                    className="w-full bg-[#15151b] border border-white/15 rounded-xl p-3 text-xs text-white focus:border-[#ff1e27] focus:outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary w-full h-10 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#ff1e27]/25"
                >
                  <Send className="size-3.5" />
                  <span>ส่งข้อความ</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Script Update Modal */}
      {onSaveScriptUpdate && (
        <ScriptUpdateModal
          isOpen={updateModalOpen}
          editingUpdate={editingUpdate}
          onClose={() => setUpdateModalOpen(false)}
          onSave={onSaveScriptUpdate}
        />
      )}

      {/* Category Modal */}
      {onSaveCategory && (
        <CategoryModal
          isOpen={catModalOpen}
          editingCategory={editingCat}
          onClose={() => setCatModalOpen(false)}
          onSave={onSaveCategory}
        />
      )}

    </div>
  );
}
