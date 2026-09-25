import React, { useState, useEffect } from 'react';
import { 
  auth, 
  db, 
  googleAuthProvider, 
  signInWithPopup, 
  fbSignOut, 
  onAuthStateChanged,
  type FirebaseUser,
  doc, 
  getDoc, 
  setDoc, 
  serverTimestamp
} from './lib/firebase.ts';
import { 
  LogOut, 
  Mail, 
  Lock, 
  ArrowLeft,
  CheckCircle2, 
  Loader2, 
  AlertCircle,
  Megaphone,
  ChevronRight,
  Search,
  ArrowUp,
  Settings,
  ShieldCheck,
  Edit3,
  Trash2,
  Plus,
  Package,
  Crown
} from 'lucide-react';
import { BotVerification } from './components/BotVerification.tsx';
import { SignupForm } from './components/SignupForm.tsx';
import { SearchModal } from './components/SearchModal.tsx';
import { TermsPage } from './pages/TermsPage.tsx';
import { PrivacyPage } from './pages/PrivacyPage.tsx';
import { CategoryPage } from './pages/CategoryPage.tsx';
import { RecommendedProductsPage } from './pages/RecommendedProductsPage.tsx';
import { NavSectionPage } from './pages/NavSectionPage.tsx';
import { AccountSettingsPage } from './pages/AccountSettingsPage.tsx';
import { AdminDashboardPage } from './pages/AdminDashboardPage.tsx';
import { ProtectedRoute, isUserOwner, OWNER_EMAIL } from './components/ProtectedRoute.tsx';
import { 
  ProductItem, 
  CategoryItem, 
  SiteSettings, 
  UserAccountItem,
  DEFAULT_SITE_SETTINGS,
  listenProducts, 
  listenCategories, 
  listenSiteSettings,
  ScriptUpdateItem,
  listenScriptUpdates,
  ensureDefaultCategory,
  ensureDefaultScriptUpdates,
  DEFAULT_CATEGORY,
  DEFAULT_SCRIPT_UPDATES,
  saveProduct,
  deleteProduct,
  saveCategory,
  deleteCategory,
  saveScriptUpdate,
  deleteScriptUpdate
} from './lib/store.ts';
import { ProductCard } from './components/ProductCard.tsx';
import { ProductDetailPage } from './pages/ProductDetailPage.tsx';
import { PurchasePage } from './pages/PurchasePage.tsx';
import { AdminProductModal } from './components/admin/AdminProductModal.tsx';
import { CategoryModal } from './components/admin/CategoryModal.tsx';
import { ScriptUpdateModal } from './components/admin/ScriptUpdateModal.tsx';

type PageView = 
  | 'home' 
  | 'login' 
  | 'signup' 
  | 'terms' 
  | 'privacy' 
  | 'category-1' 
  | 'recommended-products'
  | 'product-detail'
  | 'purchase'
  | 'packages'
  | 'rankings'
  | 'activities'
  | 'contact'
  | 'account-settings'
  | 'admin-dashboard';

export default function App() {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [currentView, setCurrentView] = useState<PageView>('home');
  const [activeNav, setActiveNav] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Real-time Firestore State for Storefront
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [scriptUpdates, setScriptUpdates] = useState<ScriptUpdateItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryItem | null>(null);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [userProfile, setUserProfile] = useState<UserAccountItem | null>(null);

  // STRICT ZERO-TRUST ADMIN GUARD:
  // ONLY the single admin email configured in .env (Cpjustink@gmail.com) has permissions
  // to view or access the Admin Dashboard and backend management controls.
  // General users (ผู้ใช้งานทั่วไป) will NEVER see the Dashboard button anywhere in the application.
  const isOwner = Boolean(currentUser && isUserOwner(currentUser));
  
  // Search modal state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Global Admin Modals State (for editing from anywhere on storefront)
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);

  const [scriptUpdateModalOpen, setScriptUpdateModalOpen] = useState(false);
  const [editingScriptUpdate, setEditingScriptUpdate] = useState<ScriptUpdateItem | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [purchaseQuantity, setPurchaseQuantity] = useState<number>(1);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Bot verification states with session memory (ไม่ต้องยืนยันถี่ ยืนยันแปปเดียวหากยังใช้งานอยู่)
  const [isVerifyingBot, setIsVerifyingBot] = useState(false);
  const [isQuickVerification, setIsQuickVerification] = useState(false);
  const [targetViewAfterVerify, setTargetViewAfterVerify] = useState<PageView>('signup');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Scroll to top smoothly whenever view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView]);

  // Track window scroll for Back-to-Top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 250);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard shortcut Ctrl+K / Cmd+K to open Search Modal instantly
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Real-time synchronization of Storefront Products, Categories, CMS Settings, and Script Updates
  useEffect(() => {
    ensureDefaultCategory();
    ensureDefaultScriptUpdates();
    const unsubSettings = listenSiteSettings(setSiteSettings);
    const unsubCategories = listenCategories(setCategories);
    const unsubProducts = listenProducts(setProducts);
    const unsubUpdates = listenScriptUpdates(setScriptUpdates);

    return () => {
      unsubSettings();
      unsubCategories();
      unsubProducts();
      unsubUpdates();
    };
  }, []);

  // Ensure default category and script updates are seeded as soon as owner is authenticated
  useEffect(() => {
    if (isOwner) {
      ensureDefaultCategory();
      ensureDefaultScriptUpdates();
    }
  }, [isOwner]);

  // Admin CRUD Handlers (Available across entire storefront)
  const handleSaveProduct = async (prod: Partial<ProductItem>, id?: string) => {
    await saveProduct(prod, id);
    showToast(id ? 'บันทึกการแก้ไขสินค้าเรียบร้อย' : 'เพิ่มสินค้าใหม่ลงหน้าร้านเรียบร้อย');
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (confirm(`คุณต้องการลบสินค้า "${name}" ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้`)) {
      await deleteProduct(id);
      showToast(`ลบสินค้า "${name}" เรียบร้อยแล้ว`);
      if (selectedProduct?.id === id) {
        setSelectedProduct(null);
      }
    }
  };

  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: ProductItem) => {
    setEditingProduct(prod);
    setProductModalOpen(true);
  };

  const handleSelectProduct = (prod: ProductItem) => {
    setSelectedProduct(prod);
    const cat = categories.find(c => c.id === prod.categoryId) || null;
    if (cat) {
      setSelectedCategory(cat);
    }
    setCurrentView('product-detail');
    const catSlug = cat?.slug || cat?.id || prod.categoryId || 'category-1';
    const targetUrl = `/home/${catSlug}/${prod.id}`;
    try {
      if (window.location.pathname !== targetUrl) {
        window.history.pushState({ view: 'product-detail', productId: prod.id, categoryId: catSlug }, '', targetUrl);
      }
    } catch {
      // Ignore if pushState is restricted in iframe
    }
    document.title = `${prod.name} | Xecute Lab`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateHome = () => {
    setCurrentView('home');
    setActiveNav('home');
    setSelectedProduct(null);
    try {
      if (window.location.pathname !== '/') {
        window.history.pushState({ view: 'home' }, '', '/');
      }
    } catch {
      // Ignore if pushState is restricted in iframe
    }
    document.title = 'Xecute Lab - High Performance Execution & Digital Innovation';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenPurchase = (prod: ProductItem, qty: number = 1) => {
    setSelectedProduct(prod);
    setPurchaseQuantity(qty);
    setCurrentView('purchase');
    try {
      const url = `/purchase?id=${prod.id}&qty=${qty}`;
      if (window.location.pathname !== '/purchase') {
        window.history.pushState({ view: 'purchase', productId: prod.id, quantity: qty }, '', url);
      }
    } catch {
      // Ignore if pushState is restricted in iframe
    }
    document.title = `ยืนยันการซื้อ: ${prod.name} | Xecute Lab`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Deep-linking URL handler for initial page load and browser back/forward buttons
  const initialUrlCheckedRef = React.useRef(false);
  useEffect(() => {
    // Only check once on mount / initial load when products are populated
    if (!initialUrlCheckedRef.current && products.length > 0) {
      initialUrlCheckedRef.current = true;
      const path = window.location.pathname;
      const parts = path.split('/').filter(Boolean);

      // 0. purchase page (/purchase?id=...)
      if (parts[0] === 'purchase' || path === '/purchase') {
        const params = new URLSearchParams(window.location.search);
        const prodId = params.get('id') || params.get('productId');
        const qtyParam = parseInt(params.get('qty') || '1', 10);
        if (prodId) {
          const prod = products.find(p => p.id === prodId);
          if (prod) setSelectedProduct(prod);
        } else if (products.length > 0) {
          setSelectedProduct(products[0]);
        }
        setPurchaseQuantity(isNaN(qtyParam) ? 1 : qtyParam);
        setCurrentView('purchase');
        document.title = 'ยืนยันการซื้อ | Xecute Lab';
        return;
      }

      // 1. home / (category) / (productId)
      if (parts[0] === 'home' && parts.length >= 3) {
        const prodId = parts[2];
        const prod = products.find(p => p.id === prodId);
        if (prod) {
          setSelectedProduct(prod);
          const cat = categories.find(c => c.id === prod.categoryId || c.slug === parts[1]);
          if (cat) setSelectedCategory(cat);
          setCurrentView('product-detail');
          document.title = `${prod.name} | Xecute Lab`;
        }
      } else if (parts[0] === 'products' && parts.length >= 2) {
        const prodId = parts[1];
        const prod = products.find(p => p.id === prodId);
        if (prod) {
          setSelectedProduct(prod);
          const cat = categories.find(c => c.id === prod.categoryId);
          if (cat) setSelectedCategory(cat);
          setCurrentView('product-detail');
          document.title = `${prod.name} | Xecute Lab`;
        }
      } else if (parts[0] === 'categories') {
        if (parts.length >= 2) {
          const cat = categories.find(c => c.id === parts[1] || c.slug === parts[1]);
          if (cat) setSelectedCategory(cat);
          setCurrentView('category-1');
        } else {
          setCurrentView('packages');
          setActiveNav('packages');
        }
      }
    }

    // Handle browser Back / Forward buttons only
    const handlePopState = () => {
      const path = window.location.pathname;
      const parts = path.split('/').filter(Boolean);

      if (parts[0] === 'purchase' || path === '/purchase') {
        const params = new URLSearchParams(window.location.search);
        const prodId = params.get('id') || params.get('productId');
        const qtyParam = parseInt(params.get('qty') || '1', 10);
        if (prodId) {
          const prod = products.find(p => p.id === prodId);
          if (prod) setSelectedProduct(prod);
        }
        setPurchaseQuantity(isNaN(qtyParam) ? 1 : qtyParam);
        setCurrentView('purchase');
        document.title = 'ยืนยันการซื้อ | Xecute Lab';
        return;
      }

      if (parts[0] === 'home' && parts.length >= 3) {
        const prodId = parts[2];
        const prod = products.find(p => p.id === prodId);
        if (prod) {
          setSelectedProduct(prod);
          const cat = categories.find(c => c.id === prod.categoryId || c.slug === parts[1]);
          if (cat) setSelectedCategory(cat);
          setCurrentView('product-detail');
          document.title = `${prod.name} | Xecute Lab`;
          return;
        }
      }

      if (parts[0] === 'categories') {
        if (parts.length >= 2) {
          const cat = categories.find(c => c.id === parts[1] || c.slug === parts[1]);
          if (cat) setSelectedCategory(cat);
          setCurrentView('category-1');
        } else {
          setCurrentView('packages');
          setActiveNav('packages');
        }
        return;
      }

      if (path === '/' || parts.length === 0) {
        setCurrentView('home');
        setActiveNav('home');
        setSelectedProduct(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [products, categories]);

  const handleSaveCategory = async (cat: Partial<CategoryItem>, id?: string) => {
    await saveCategory(cat, id);
    showToast(id ? 'บันทึกการแก้ไขหมวดหมู่เรียบร้อย' : 'สร้างหมวดหมู่ใหม่เรียบร้อย');
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (confirm(`คุณต้องการลบหมวดหมู่ "${name}" ใช่หรือไม่?`)) {
      await deleteCategory(id);
      showToast(`ลบหมวดหมู่ "${name}" เรียบร้อยแล้ว`);
      if (selectedCategory?.id === id) {
        setSelectedCategory(null);
      }
    }
  };

  const handleOpenAddCategory = () => {
    setEditingCategory(null);
    setCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setCategoryModalOpen(true);
  };

  const handleSaveScriptUpdate = async (update: Partial<ScriptUpdateItem>, id?: string) => {
    await saveScriptUpdate(update, id);
    showToast(id ? 'บันทึกการแก้ไขอัปเดตสคริปต์เรียบร้อย' : 'เพิ่มบันทึกอัปเดตสคริปต์ใหม่เรียบร้อย');
  };

  const handleDeleteScriptUpdate = async (id: string, title: string) => {
    if (confirm(`คุณต้องการลบอัปเดตสคริปต์ "${title}" ใช่หรือไม่?`)) {
      await deleteScriptUpdate(id);
      showToast(`ลบบันทึกอัปเดตเรียบร้อยแล้ว`);
    }
  };

  const handleOpenAddScriptUpdate = () => {
    setEditingScriptUpdate(null);
    setScriptUpdateModalOpen(true);
  };

  const handleOpenEditScriptUpdate = (update: ScriptUpdateItem) => {
    setEditingScriptUpdate(update);
    setScriptUpdateModalOpen(true);
  };

  // Monitor Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        try {
          const docSnap = await getDoc(userDocRef);
          const defaultUsername = user.email ? user.email.split('@')[0] : 'user_' + user.uid.substring(0, 6);
          if (!docSnap.exists()) {
            const initialRole = isUserOwner(user) ? 'owner' : 'user';
            const initialData = {
              uid: user.uid,
              email: user.email || '',
              displayName: user.displayName || 'Xecute Member',
              username: defaultUsername,
              photoURL: user.photoURL || '',
              role: initialRole,
              balance: 0,
              status: 'active',
              createdAt: serverTimestamp(),
              lastLoginAt: serverTimestamp()
            };
            await setDoc(userDocRef, initialData);
            setUserProfile(initialData as any);
          } else {
            const profileData = docSnap.data() as UserAccountItem;
            setUserProfile(profileData);
            await setDoc(userDocRef, {
              lastLoginAt: serverTimestamp()
            }, { merge: true });
          }
        } catch (err: any) {
          console.warn("Firestore user sync status:", err?.message || err);
        }
      } else {
        setUserProfile(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Strict URL & View Guard: If a general user attempts to navigate to admin-dashboard, automatically redirect to home
  useEffect(() => {
    if (currentView === 'admin-dashboard' && !isOwner) {
      setCurrentView('home');
      setActiveNav('home');
    }
  }, [currentView, isOwner]);

  // Trigger Navigation to Signup with Bot Verification Gate
  const handleGoToSignupWithVerification = () => {
    // Check if user already verified during current browser session
    const lastVerified = sessionStorage.getItem('xl_bot_verified_time');
    const isRecentlyVerified = lastVerified && (Date.now() - parseInt(lastVerified, 10) < 30 * 60 * 1000); // 30 minutes active window

    setIsQuickVerification(!!isRecentlyVerified);
    setIsVerifyingBot(true);
    setTargetViewAfterVerify('signup');
    setMobileMenuOpen(false);
  };

  const handleGoToLogin = () => {
    setCurrentView('login');
    setLoginError(null);
    setMobileMenuOpen(false);
  };

  // Called once Bot Verification finishes confirming
  const handleBotVerificationComplete = () => {
    // Save verification timestamp to sessionStorage (persists while user is on the site)
    sessionStorage.setItem('xl_bot_verified_time', Date.now().toString());
    setIsVerifyingBot(false);
    setCurrentView(targetViewAfterVerify);
  };

  // Handle Login with Google
  const handleGoogleLogin = async () => {
    setLoginLoading(true);
    setLoginError(null);
    try {
      const res = await signInWithPopup(auth, googleAuthProvider);
      const user = res.user;
      const userDocRef = doc(db, 'users', user.uid);
      const defaultUsername = user.email ? user.email.split('@')[0] : 'user_' + user.uid.substring(0, 6);
      await setDoc(userDocRef, {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || 'Xecute Member',
        username: defaultUsername,
        photoURL: user.photoURL || '',
        role: 'user',
        lastLoginAt: serverTimestamp()
      }, { merge: true });
      setCurrentView('home');
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setLoginError(err.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
      }
    } finally {
      setLoginLoading(false);
    }
  };

  // Handle Sign Out
  const handleSignOut = async () => {
    try {
      await fbSignOut(auth);
      setCurrentView('home');
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  // If Bot Verification is currently running, render only the verification screen
  if (isVerifyingBot) {
    return (
      <BotVerification 
        onVerified={handleBotVerificationComplete} 
        isQuick={isQuickVerification}
      />
    );
  }

  const navItems = [
    { id: 'home', label: 'หน้าแรก', onClick: () => { setCurrentView('home'); setActiveNav('home'); } },
    { id: 'packages', label: 'แพ็คเกจ / สินค้า', onClick: () => { setCurrentView('packages'); setActiveNav('packages'); } },
    { id: 'rankings', label: 'อันดับยอดนิยม', onClick: () => { setCurrentView('rankings'); setActiveNav('rankings'); } },
    { id: 'activities', label: 'อัปเดต', onClick: () => { setCurrentView('activities'); setActiveNav('activities'); } },
    { id: 'contact', label: 'ติดต่อร้านค้า', onClick: () => { setCurrentView('contact'); setActiveNav('contact'); } },
    ...(currentUser ? [{ id: 'account-settings', label: 'ตั้งค่าผู้ใช้งาน', onClick: () => { setCurrentView('account-settings'); setActiveNav('account-settings'); } }] : [])
  ];

  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-[#ff1e27] selection:text-white flex flex-col justify-between">
      
      {/* Background Ambience: Red Glow & Subtle Grid with Pulse Animation */}
      <div 
        className="pointer-events-none fixed inset-0 z-0 opacity-25 animate-glow-pulse"
        style={{
          background: `
            radial-gradient(ellipse 70% 35% at 50% -10%, rgba(255, 30, 39, 0.28), transparent 75%)
          `
        }}
      />
      <div className="pointer-events-none fixed inset-0 z-0 hd-grid-bg opacity-20" />

      {/* =========================================================================
          TOP NAVIGATION BAR
          ========================================================================= */}
      <header className="sticky top-0 z-50 w-full border-b border-neutral-800/80 bg-black/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between gap-4 py-2">
            
            {/* Logo / Brand */}
            <button 
              className="flex min-w-0 flex-1 items-center text-lg font-semibold text-white group cursor-pointer text-left" 
              onClick={() => { setCurrentView('home'); setActiveNav('home'); }}
            >
              <div className="mr-2.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#dc141c] to-[#ff1e27] shadow-lg shadow-[#ff1e27]/25 transition-transform duration-200 group-hover:scale-105">
                <span className="font-heading font-black text-white text-base tracking-tight">X</span>
              </div>
              <span className="font-heading truncate text-lg sm:text-xl font-bold tracking-tight">
                Xecute Lab<span className="text-[#ff1e27]">.</span>
              </span>
            </button>

            {/* Desktop Navigation Links with Animated Glow Indicator */}
            <ul className="relative hidden items-center justify-center gap-1 sm:gap-2 lg:flex lg:flex-1">
              {navItems.map((item) => {
                const isActive = (currentView === item.id) || (currentView === 'home' && activeNav === item.id && item.id === 'home');
                return (
                  <li key={item.id} className="relative">
                    <button
                      className={`relative px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                        isActive 
                          ? 'text-white font-semibold' 
                          : 'text-white/70 hover:text-white hover:bg-white/[0.04]'
                      }`}
                      onClick={item.onClick}
                    >
                      {item.label}

                      {/* Animated Active Red Glow Underline */}
                      {isActive && (
                        <span className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full bg-gradient-to-r from-transparent via-[#ff1e27] to-transparent shadow-[0_0_8px_#ff1e27]" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>

              {/* Desktop Action Buttons & Search */}
            <div className="hidden flex-1 items-center justify-end gap-2.5 lg:flex">
              {/* Product Search Button */}
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-xs text-white/70 hover:text-white transition-all cursor-pointer interactive-tap group"
                title="ค้นหาสินค้า (Ctrl+K)"
              >
                <Search className="size-3.5 text-[#ff1e27] group-hover:scale-110 transition-transform" />
                <span>ค้นหาสินค้า</span>
                <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white/10 border border-white/15 text-[10px] text-white/40 font-mono">
                  ⌘K
                </kbd>
              </button>

              {currentUser ? (
                <div className="flex items-center gap-2">
                  {/* ปุ่มตั้งค่าผู้ใช้งานตรงเมนูบาร์ */}
                  <button
                    onClick={() => {
                      setCurrentView('account-settings');
                      setActiveNav('account-settings');
                    }}
                    className={`btn-secondary h-8 px-3 rounded-lg text-xs flex items-center gap-1.5 interactive-tap ${
                      currentView === 'account-settings' ? 'border-[#ff1e27] text-[#ff1e27]' : ''
                    }`}
                  >
                    <Settings className="size-3.5 text-[#ff1e27]" />
                    <span>ตั้งค่าผู้ใช้งาน</span>
                  </button>

                  {/* ผู้ใช้งาน พร้อม text ธรรมดาด้านล่างสำหรับเจ้าของ */}
                  <div className="flex flex-col items-center">
                    <div 
                      onClick={() => {
                        setCurrentView('account-settings');
                        setActiveNav('account-settings');
                      }}
                      className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-xs hover:border-white/20 cursor-pointer transition-colors"
                      title="คลิกเพื่อตั้งค่าผู้ใช้งาน"
                    >
                      {currentUser.photoURL ? (
                        <img src={currentUser.photoURL} alt="Avatar" className="size-4 rounded-full object-cover border border-[#ff1e27]/40" />
                      ) : (
                        <div className="size-2 rounded-full bg-[#ff1e27] animate-pulse" />
                      )}
                      <span className="text-white/80 font-medium truncate max-w-[110px]">
                        {currentUser.displayName || currentUser.email}
                      </span>
                    </div>

                    {/* text ธรรมดาด้านล่างผู้ใช้งาน (เห็นแค่เจ้าของ) */}
                    {isOwner && (
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentView('admin-dashboard');
                          setActiveNav('admin-dashboard');
                        }}
                        className="text-[11px] text-white/50 hover:text-white transition-colors cursor-pointer mt-0.5 leading-none"
                      >
                        ระบบจัดการ
                      </button>
                    )}
                  </div>

                  <button
                    onClick={handleSignOut}
                    className="btn-secondary h-8 px-2.5 rounded-lg text-xs text-white/70 hover:text-white"
                    title="ออกจากระบบ"
                  >
                    <LogOut className="size-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    className={`btn-secondary h-8 px-3.5 rounded-lg text-xs sm:text-sm ${
                      currentView === 'login' ? 'border-[#ff1e27] text-[#ff1e27]' : ''
                    }`}
                    onClick={handleGoToLogin}
                  >
                    เข้าสู่ระบบ
                  </button>
                  <button
                    className="btn-primary h-8 px-3.5 rounded-lg text-xs sm:text-sm"
                    onClick={handleGoToSignupWithVerification}
                  >
                    สมัครสมาชิก
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Actions: Search & Hamburger */}
            <div className="flex items-center gap-2 lg:hidden">
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="size-9 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center text-white/80 hover:text-white hover:border-[#ff1e27]/40 cursor-pointer interactive-tap"
                aria-label="ค้นหาสินค้า"
                title="ค้นหาสินค้า"
              >
                <Search className="size-4 text-[#ff1e27]" />
              </button>

              {/* Mobile Hamburger Button */}
              <button
                type="button"
                className="group relative size-9 rounded-lg p-1.5 hover:bg-white/10 cursor-pointer transition-colors"
                aria-expanded={mobileMenuOpen}
                aria-label={mobileMenuOpen ? 'ปิดเมนู' : 'เปิดเมนู'}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <div className="relative flex h-full w-full flex-col items-center justify-center gap-[5px]">
                  <span
                    className={`h-[2px] w-5 origin-center bg-white transition-all duration-300 ${
                      mobileMenuOpen ? 'translate-y-[3.5px] rotate-45' : ''
                    }`}
                  />
                  <span
                    className={`h-[2px] w-5 origin-center bg-white transition-all duration-300 ${
                      mobileMenuOpen ? '-translate-y-[3.5px] -rotate-45' : ''
                    }`}
                  />
                </div>
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Dropdown Menu with slide down animation */}
        {mobileMenuOpen && (
          <div className="border-b border-neutral-800 bg-[#0a0a0a]/98 backdrop-blur-xl px-6 py-5 lg:hidden animate-fade-in shadow-2xl">
            {/* Quick Search in Mobile Menu */}
            <button
              onClick={() => {
                setIsSearchOpen(true);
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between text-left text-xs font-medium px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white mb-3 interactive-tap"
            >
              <div className="flex items-center gap-2.5">
                <Search className="size-4 text-[#ff1e27]" />
                <span>ค้นหาสินค้าหรือสคริปต์...</span>
              </div>
              <span className="text-[10px] text-white/40 font-mono">ค้นหา</span>
            </button>

            <ul className="flex flex-col gap-2">
              {navItems.map((item) => {
                const isActive = (currentView === item.id) || (currentView === 'home' && activeNav === item.id && item.id === 'home');
                return (
                  <li key={item.id}>
                    <button
                      className={`w-full flex items-center justify-between text-left text-sm font-medium px-3.5 py-2.5 rounded-xl transition-all duration-150 cursor-pointer ${
                        isActive
                          ? 'bg-[#ff1e27]/10 text-white font-semibold border border-[#ff1e27]/30'
                          : 'text-white/80 hover:text-white hover:bg-white/5'
                      }`}
                      onClick={() => {
                        item.onClick();
                        setMobileMenuOpen(false);
                      }}
                    >
                      <span>{item.label}</span>
                      {isActive && <div className="size-1.5 rounded-full bg-[#ff1e27] shadow-[0_0_6px_#ff1e27]" />}
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="mt-6 flex flex-col gap-2.5 pt-5 border-t border-neutral-800">
              {currentUser ? (
                <>
                  <div className="text-xs text-white/70 py-1 flex items-center gap-2">
                    {currentUser.photoURL ? (
                      <img src={currentUser.photoURL} alt="Avatar" className="size-5 rounded-full object-cover border border-[#ff1e27]" />
                    ) : (
                      <div className="size-2 rounded-full bg-[#ff1e27]" />
                    )}
                    <span>เข้าสู่ระบบ: <span className="text-white font-medium">{currentUser.displayName || currentUser.email}</span></span>
                  </div>

                  {/* text ธรรมดาด้านล่างผู้ใช้งาน (เห็นแค่เจ้าของ) */}
                  {isOwner && (
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentView('admin-dashboard');
                        setActiveNav('admin-dashboard');
                        setMobileMenuOpen(false);
                      }}
                      className="text-xs text-white/50 hover:text-white transition-colors cursor-pointer text-left -mt-0.5 mb-1"
                    >
                      ระบบจัดการ
                    </button>
                  )}

                  <button
                    className={`btn-primary h-10 rounded-lg px-4 text-sm w-full flex items-center justify-center gap-2 ${
                      currentView === 'account-settings' ? 'ring-2 ring-white/30' : ''
                    }`}
                    onClick={() => {
                      setCurrentView('account-settings');
                      setActiveNav('account-settings');
                      setMobileMenuOpen(false);
                    }}
                  >
                    <Settings className="size-4" />
                    <span>ตั้งค่าผู้ใช้งาน</span>
                  </button>
                  <button
                    className="btn-secondary h-10 rounded-lg px-4 text-sm w-full flex items-center justify-center gap-2"
                    onClick={() => { handleSignOut(); setMobileMenuOpen(false); }}
                  >
                    <LogOut className="size-4 mr-1" />
                    <span>ออกจากระบบ</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="btn-secondary h-10 rounded-lg px-4 text-sm w-full"
                    onClick={handleGoToLogin}
                  >
                    เข้าสู่ระบบ
                  </button>
                  <button
                    className="btn-primary h-10 rounded-lg px-4 text-sm w-full"
                    onClick={handleGoToSignupWithVerification}
                  >
                    สมัครสมาชิก
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* =========================================================================
          MAIN ROUTING VIEW
          ========================================================================= */}
      <main className="relative z-10 flex-1 flex flex-col justify-center my-auto">
        
        {/* VIEW 1: HOME */}
        {currentView === 'home' && (
          <div className="w-full flex flex-col">
            {/* Hero / Header Section matching screenshot layout (Left-aligned, proportional size) */}
            <section className="px-6 sm:px-10 md:px-16 pt-16 sm:pt-24 pb-14 max-w-4xl w-full text-left">
              
              {/* Title in one line: "ยินดีต้อนรับเข้าสู่ Xecute Lab" with standout red gradient store name */}
              <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
                ยินดีต้อนรับเข้าสู่{' '}
                <span className="red-gradient-anim font-black tracking-normal inline-block ml-1">
                  Xecute Lab
                </span>
              </h1>

              {/* Sub-description matching the screenshot typography (lighter, thin, clean paragraph) */}
              <p className="mt-5 text-sm sm:text-base font-light text-white/65 leading-relaxed sm:leading-loose max-w-2xl">
                ร้านค้าและศูนย์รวมจำหน่าย Scripts, License Keys และ Source Codes (SRC) คุณภาพสูง
                ตอบโจทย์ทุกการพัฒนาและการใช้งานเฉพาะทาง ด้วยระบบจัดการที่เสถียร รวดเร็ว และปลอดภัยสูงสุด
              </p>

              {/* Action Buttons: Visible only when NOT logged in (if logged in, completely hidden as requested) */}
              {!currentUser && (
                <div className="mt-8 flex items-center gap-3 sm:gap-4">
                  {/* ปุ่มเข้าสู่ระบบ */}
                  <button
                    onClick={handleGoToLogin}
                    className="btn-secondary h-10 px-5 rounded-lg text-sm sm:text-base interactive-tap"
                  >
                    เข้าสู่ระบบ
                  </button>

                  {/* ปุ่มสมัครสมาชิก */}
                  <button
                    onClick={handleGoToSignupWithVerification}
                    className="btn-primary h-10 px-5 rounded-lg text-sm sm:text-base interactive-tap"
                  >
                    สมัครสมาชิก
                  </button>
                </div>
              )}

            </section>

            {/* ส่วนเนื้อหาด้านล่าง: ป้ายประกาศข้อความเลื่อน และ แบนเนอร์ พร้อมปุ่ม 4 ปุ่ม */}
            <section className="w-full border-t border-white/10 pt-5 pb-16 px-4 sm:px-6 md:px-8">
              
              {/* Store Maintenance Notice Banner (if active) */}
              {siteSettings.storeStatus !== 'open' && (
                <div className="max-w-6xl mx-auto mb-3.5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs sm:text-sm flex items-center justify-between gap-3 shadow-lg animate-fade-in">
                  <div className="flex items-center gap-2.5">
                    <AlertCircle className="size-5 text-amber-400 shrink-0 animate-pulse" />
                    <div>
                      <span className="font-bold block">โหมดแจ้งเตือนจากระบบหลังบ้าน:</span>
                      <span className="text-white/80">{siteSettings.maintenanceNotice || 'ขณะนี้ระบบกำลังปิดปรับปรุงชั่วคราว'}</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 font-mono text-xs font-bold shrink-0 uppercase">
                    {siteSettings.storeStatus}
                  </span>
                </div>
              )}

              {/* ป้ายประกาศที่เป็นข้อความเลื่อน (Announcement Marquee Ticker) */}
              <div className="max-w-6xl mx-auto mb-3">
                <div className="relative flex items-center overflow-hidden rounded-xl border border-white/10 bg-[#0f0f0f] py-2.5 px-3 shadow-lg">
                  {/* Badge ประกาศ */}
                  <div className="z-10 flex shrink-0 items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#ff1e27] to-[#dc141c] px-3 py-1 text-xs font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_2px_8px_rgba(255,30,39,0.4)] mr-3">
                    <Megaphone className="size-3.5" />
                    <span>{siteSettings.announcementBadge || 'ประกาศ'}</span>
                  </div>

                  {/* ข้อความเลื่อน (Marquee Ticker) */}
                  <div className="relative w-full overflow-hidden select-none">
                    <div className="animate-marquee whitespace-nowrap text-xs sm:text-sm text-white/85">
                      <span className="mx-6 inline-flex items-center gap-2">
                        {siteSettings.marqueeText || DEFAULT_SITE_SETTINGS.marqueeText}
                      </span>
                      <span className="mx-6 inline-flex items-center gap-1.5 text-[#ff1e27] font-semibold">
                        <ShieldCheck className="size-3.5 inline shrink-0" />
                        <span>อัปเดตแพตช์ระบบและ HWID ล่าสุดประจำสัปดาห์เรียบร้อยแล้ว</span>
                      </span>
                      {/* Repeat for seamless loop */}
                      <span className="mx-6 inline-flex items-center gap-2">
                        {siteSettings.marqueeText || DEFAULT_SITE_SETTINGS.marqueeText}
                      </span>
                      <span className="mx-6 inline-flex items-center gap-1.5 text-[#ff1e27] font-semibold">
                        <ShieldCheck className="size-3.5 inline shrink-0" />
                        <span>อัปเดตแพตช์ระบบและ HWID ล่าสุดประจำสัปดาห์เรียบร้อยแล้ว</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ด้านล่างป้ายจะเป็นรูปแบนเนอร์ตัวนี้ (ชิดขึ้นอีกนิด pt-2) */}
              <div className="max-w-6xl mx-auto">
                <div className="container pt-1 sm:pt-2 mx-auto px-0">
                  <div className="relative" role="region" aria-roledescription="carousel">
                    <div className="overflow-hidden rounded-xl border border-white/10 shadow-2xl">
                      <div className="overflow-hidden">
                        <div className="flex -ml-4" style={{ transform: 'translate3d(0px, 0px, 0px)' }}>
                          <div role="group" aria-roledescription="slide" className="min-w-0 shrink-0 grow-0 basis-full pl-0">
                            <a className="block basis-1/2" href="https://toriv2.rdcw.xyz" target="_blank" rel="noopener noreferrer">
                              <img 
                                src={siteSettings.bannerImageUrl || "https://img.rdcw.co.th/images/d7a407f0f3f0ba65d82749471d078ec59efcf335451e1f7b9011640252f97d43.jpeg"} 
                                alt="Welcome Banner" 
                                loading="lazy" 
                                decoding="async" 
                                width="1500" 
                                height="400" 
                                className="aspect-[15/4] max-h-80 w-full object-cover rounded-xl"
                              />
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button 
                      className="items-center justify-center text-sm font-medium whitespace-nowrap ring-offset-background transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground absolute size-8 rounded-full top-1/2 -left-12 -translate-y-1/2 hidden xl:flex" 
                      disabled
                      aria-label="Previous slide"
                    >
                      <span style={{ opacity: 1, transform: 'none' }}>
                        <div className="fi">
                          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="size-4">
                            <path d="M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z" />
                          </svg>
                          <span className="sr-only">Previous slide</span>
                        </div>
                      </span>
                    </button>

                    <button 
                      className="items-center justify-center text-sm font-medium whitespace-nowrap ring-offset-background transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground absolute size-8 rounded-full top-1/2 -right-12 -translate-y-1/2 hidden xl:flex" 
                      disabled
                      aria-label="Next slide"
                    >
                      <span style={{ opacity: 1, transform: 'none' }}>
                        <div className="fi">
                          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 256 256" className="size-4">
                            <path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z" />
                          </svg>
                          <span className="sr-only">Next slide</span>
                        </div>
                      </span>
                    </button>
                  </div>
                </div>

                {/* ต่อมาด้านล่างแบนเนอร์จะเป็นปุ่มสี่ปุ่ม: บรรทัดละ 2 ปุ่มเสมอ (grid-cols-2) แม้บนจอมือถือตามภาพตัวอย่าง (ใช้ text สีแดงตามที่ระบุ) */}
                <div className="mt-3.5 sm:mt-5 grid grid-cols-2 gap-2.5 sm:gap-4">
                  {[
                    { num: '1', title: 'ปุ่มตัวอย่าง', sub: 'Button', action: () => setCurrentView('category-1') },
                    { num: '2', title: 'ปุ่มตัวอย่าง', sub: 'Button', action: () => setCurrentView('packages') },
                    { num: '3', title: 'ปุ่มตัวอย่าง', sub: 'Button', action: () => setCurrentView('rankings') },
                    { num: '4', title: 'ปุ่มตัวอย่าง', sub: 'Button', action: () => setIsSearchOpen(true) }
                  ].map((btn) => (
                    <button
                      key={btn.num}
                      type="button"
                      onClick={btn.action}
                      className="group relative overflow-hidden rounded-xl sm:rounded-2xl border border-white/10 bg-[#0e0e0e] hover:bg-[#141414] p-3 sm:p-5 text-left interactive-card cursor-pointer shadow-lg flex flex-col justify-between min-h-[92px] sm:min-h-[120px]"
                    >
                      {/* Top icon placeholder (กล่องไอคอนสี่เหลี่ยมตามรูปตัวอย่าง) */}
                      <div className="flex items-center gap-2 mb-2 sm:mb-3">
                        <div className="size-7 sm:size-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-sm sm:text-base shadow-inner group-hover:border-white/25 transition-colors">
                          {btn.num === '1' && <Package className="size-4 text-[#ff1e27]" />}
                          {btn.num === '2' && <ShieldCheck className="size-4 text-white/80" />}
                          {btn.num === '3' && <Crown className="size-4 text-amber-400" />}
                          {btn.num === '4' && <Search className="size-4 text-cyan-400" />}
                        </div>
                      </div>

                      {/* Content: Button Label & Thai Title (สีแดงสด #ff3b42 ตามที่ขอ ไม่เอาสีฟ้า) */}
                      <div className="relative z-10">
                        <span className="block text-[11px] sm:text-sm font-medium text-white/50 tracking-wide leading-tight">
                          {btn.sub}
                        </span>
                        <span className="mt-0.5 block text-sm sm:text-lg md:text-xl font-bold text-[#ff3b42] group-hover:text-[#ff5c62] group-hover:brightness-110 transition-all font-heading truncate">
                          {btn.title}
                        </span>
                      </div>

                      {/* Big Hollow Number in Background (ขวาล่าง เลข 1, 2, 3, 4 แบบ Stroke จางๆ ตามรูป) */}
                      <div 
                        className="pointer-events-none absolute right-1.5 sm:right-4 -bottom-1.5 sm:-bottom-3 select-none font-sans text-5xl sm:text-8xl md:text-9xl font-extralight text-transparent opacity-30 group-hover:opacity-45 transition-opacity"
                        style={{
                          WebkitTextStroke: '1.2px rgba(255, 255, 255, 0.45)',
                        }}
                      >
                        {btn.num}
                      </div>
                    </button>
                  ))}
                </div>

                {/* ส่วนหมวดหมู่แนะนำสำหรับคุณ (Dynamic Categories from Firestore) */}
                <div className="mt-8 sm:mt-12 space-y-4">
                  {/* Category Section Header */}
                  <div className="flex items-center justify-between">
                    <h2 className="text-base sm:text-lg md:text-xl font-bold text-white font-heading">
                      หมวดหมู่แนะนำสำหรับคุณ
                    </h2>
                    <button
                      type="button"
                      onClick={() => {
                        if (categories.length > 0) {
                          setSelectedCategory(categories[0]);
                        }
                        setCurrentView('category-1');
                      }}
                      className="inline-flex items-center gap-1 text-xs sm:text-sm font-medium text-white/60 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 transition-all cursor-pointer interactive-tap"
                    >
                      <span>ดูเพิ่มเติม</span>
                      <ChevronRight className="size-3.5" />
                    </button>
                  </div>

                  {/* Dynamic Category Cards from Firestore */}
                  {categories.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-white/10 bg-[#0a0a0a]/50 p-8 text-center space-y-3">
                      <p className="text-xs sm:text-sm text-white/40 font-medium">
                        ขณะนี้ยังไม่มีหมวดหมู่สินค้าในระบบ
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {categories.map((cat) => {
                        const count = products.filter(p => p.categoryId === cat.id).length;
                        return (
                          <div 
                            key={cat.id}
                            className="overflow-hidden rounded-2xl border border-white/10 bg-[#0f0f0f] hover:border-[#ff1e27]/40 p-4 sm:p-5 shadow-xl interactive-card flex flex-col justify-between transition-all"
                          >
                            <div>
                              {/* Category Banner Image */}
                              <div 
                                onClick={() => {
                                  setSelectedCategory(cat);
                                  setCurrentView('category-1');
                                }}
                                className="group relative overflow-hidden rounded-xl border border-white/10 cursor-pointer bg-neutral-900"
                              >
                                <img
                                  src={cat.imageUrl || "https://img.rdcw.co.th/images/3c8f784a0a8cbe99c7e6e9f6dc9a1cc0d8474a530a8dc891e45cd03eed2ce832.jpeg"}
                                  alt={cat.name}
                                  loading="lazy"
                                  className="aspect-[3/1] sm:aspect-[4/1] w-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              </div>

                              {/* Category Info */}
                              <div className="mt-4 space-y-1">
                                <h3 
                                  onClick={() => {
                                    setSelectedCategory(cat);
                                    setCurrentView('category-1');
                                  }}
                                  className="text-base sm:text-lg font-bold text-white hover:text-[#ff3b42] cursor-pointer transition-colors line-clamp-1"
                                >
                                  {cat.name}
                                </h3>
                                <p className="text-xs text-white/40 line-clamp-2">
                                  {cat.description || (count > 0 ? `มีสินค้าทั้งหมด ${count} รายการ` : 'ขณะนี้ยังไม่มีสินค้า')}
                                </p>
                              </div>
                            </div>

                            {/* Action Button: สินค้าทั้งหมด */}
                            <div className="mt-4">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedCategory(cat);
                                  setCurrentView('category-1');
                                }}
                                className="btn-primary w-full py-2.5 sm:py-3 rounded-xl text-white text-xs sm:text-sm font-semibold transition-all shadow-md flex items-center justify-center cursor-pointer"
                              >
                                สินค้าทั้งหมด ({count})
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* ด้านล่างหมวดหมู่: สินค้าแนะนำสำหรับคุณ (Recommended Products Live from Firestore) */}
                <div className="mt-8 sm:mt-12 space-y-4">
                  {/* Recommended Products Header */}
                  <div className="flex items-center justify-between">
                    <h2 className="text-base sm:text-lg md:text-xl font-bold text-white font-heading">
                      สินค้าแนะนำสำหรับคุณ
                    </h2>
                    <button
                      type="button"
                      onClick={() => setCurrentView('recommended-products')}
                      className="inline-flex items-center gap-1 text-xs sm:text-sm font-medium text-white/60 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
                    >
                      <span>ดูเพิ่มเติม</span>
                      <ChevronRight className="size-3.5" />
                    </button>
                  </div>

                  {/* Real Product Cards or Empty State */}
                  {products.filter(p => p.isRecommended || p.status === 'active').length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-white/10 bg-[#0a0a0a]/50 py-12 px-6 flex flex-col items-center justify-center text-center space-y-3">
                      <p className="text-xs sm:text-sm font-medium text-white/40">
                        ขณะนี้ยังไม่มีสินค้า
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 pt-2">
                      {products.filter(p => p.isRecommended || p.status === 'active').slice(0, 8).map((p) => (
                        <ProductCard
                          key={p.id}
                          product={p}
                          isOwner={false}
                          onSelect={handleSelectProduct}
                          onPurchase={handleOpenPurchase}
                        />
                      ))}
                    </div>
                  )}
                </div>

              </div>

            </section>

          </div>
        )}

        {/* VIEW 2: SIGNUP FORM */}
        {currentView === 'signup' && (
          <div className="p-4 sm:p-6">
            <SignupForm
              onSuccess={() => setCurrentView('home')}
              onGoToLogin={handleGoToLogin}
              onOpenTerms={() => setCurrentView('terms')}
              onOpenPrivacy={() => setCurrentView('privacy')}
            />
          </div>
        )}

        {/* VIEW 3: DEDICATED TERMS PAGE (/terms) */}
        {currentView === 'terms' && (
          <TermsPage
            onBack={() => setCurrentView('signup')}
            onNavigatePrivacy={() => setCurrentView('privacy')}
          />
        )}

        {/* VIEW 4: DEDICATED PRIVACY PAGE (/privacy) */}
        {currentView === 'privacy' && (
          <PrivacyPage
            onBack={() => setCurrentView('signup')}
            onNavigateTerms={() => setCurrentView('terms')}
          />
        )}

        {/* VIEW: CATEGORY PAGE (e.g. home/category1) */}
        {currentView === 'category-1' && (
          <CategoryPage
            categoryId={selectedCategory?.id || (categories[0]?.id || 'category-1')}
            categoryName={selectedCategory?.name || (categories[0]?.name || 'Category 1 / หมวดหมู่ที่ 1 (Roblox Scripts & Keys)')}
            categoryDescription={selectedCategory?.description || categories[0]?.description}
            categoryImage={selectedCategory?.imageUrl || categories[0]?.imageUrl}
            products={products}
            isOwner={false}
            onNavigateHome={() => setCurrentView('home')}
            onSelectProduct={handleSelectProduct}
            onPurchase={handleOpenPurchase}
          />
        )}

        {/* VIEW: RECOMMENDED PRODUCTS PAGE */}
        {currentView === 'recommended-products' && (
          <RecommendedProductsPage
            products={products}
            isOwner={false}
            onNavigateHome={() => setCurrentView('home')}
            onSelectProduct={handleSelectProduct}
            onPurchase={handleOpenPurchase}
          />
        )}

        {/* VIEW: DEDICATED PRODUCT DETAIL PAGE (home/[category]/[product-id]) */}
        {currentView === 'product-detail' && selectedProduct && (
          <ProductDetailPage
            product={selectedProduct}
            category={selectedCategory || categories.find(c => c.id === selectedProduct.categoryId)}
            allProducts={products}
            onSelectProduct={(p) => {
              setSelectedProduct(p);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            currentUser={currentUser}
            isOwner={false}
            onNavigateHome={handleNavigateHome}
            onOpenPurchase={handleOpenPurchase}
            onNavigateBack={() => {
              if (window.history.length > 1) {
                window.history.back();
              } else if (selectedCategory) {
                setCurrentView('category-1');
              } else {
                handleNavigateHome();
              }
            }}
            onNavigateCategories={() => {
              setCurrentView('packages');
              setActiveNav('packages');
              if (window.location.pathname !== '/categories') {
                window.history.pushState({ view: 'categories' }, '', '/categories');
              }
            }}
            onNavigateCategory={(catId) => {
              const cat = categories.find(c => c.id === catId || c.slug === catId);
              if (cat) setSelectedCategory(cat);
              setCurrentView('category-1');
              const targetUrl = `/categories/${catId}`;
              if (window.location.pathname !== targetUrl) {
                window.history.pushState({ view: 'category', categoryId: catId }, '', targetUrl);
              }
            }}
            onShowToast={showToast}
            onRequireLogin={() => setCurrentView('login')}
          />
        )}

        {/* VIEW: DEDICATED PURCHASE PAGE (/purchase) */}
        {currentView === 'purchase' && (
          <PurchasePage
            initialProduct={selectedProduct}
            allProducts={products}
            currentUser={currentUser}
            initialQuantity={purchaseQuantity}
            onNavigateHome={handleNavigateHome}
            onNavigateAccount={() => {
              setCurrentView('account-settings');
              setActiveNav('account-settings');
            }}
            onShowToast={showToast}
          />
        )}

        {/* VIEW: PACKAGES / PRODUCTS SECTION */}
        {currentView === 'packages' && (
          <NavSectionPage
            sectionId="packages"
            categories={categories}
            products={products}
            scriptUpdates={scriptUpdates}
            isOwner={false}
            onNavigateHome={() => setCurrentView('home')}
            onOpenCategory={() => setCurrentView('category-1')}
            onSelectCategory={(cat) => {
              setSelectedCategory(cat);
              setCurrentView('category-1');
            }}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {/* VIEW: RANKINGS SECTION */}
        {currentView === 'rankings' && (
          <NavSectionPage
            sectionId="rankings"
            categories={categories}
            products={products}
            scriptUpdates={scriptUpdates}
            isOwner={false}
            onNavigateHome={() => setCurrentView('home')}
            onOpenCategory={() => setCurrentView('category-1')}
            onSelectCategory={(cat) => {
              setSelectedCategory(cat);
              setCurrentView('category-1');
            }}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {/* VIEW: ACTIVITIES & SCRIPT UPDATES SECTION (อัปเดตสคริปต์) */}
        {currentView === 'activities' && (
          <NavSectionPage
            sectionId="activities"
            categories={categories}
            products={products}
            scriptUpdates={scriptUpdates}
            isOwner={false}
            onNavigateHome={() => setCurrentView('home')}
            onSelectCategory={(cat) => {
              setSelectedCategory(cat);
              setCurrentView('category-1');
            }}
            onSelectProduct={handleSelectProduct}
          />
        )}

        {/* VIEW: CONTACT STORE SECTION */}
        {currentView === 'contact' && (
          <NavSectionPage
            sectionId="contact"
            categories={categories}
            products={products}
            scriptUpdates={scriptUpdates}
            isOwner={false}
            onNavigateHome={() => setCurrentView('home')}
          />
        )}

        {/* VIEW: ACCOUNT SETTINGS */}
        {currentView === 'account-settings' && (
          currentUser ? (
            <AccountSettingsPage
              currentUser={currentUser}
              onNavigateHome={() => {
                setCurrentView('home');
                setActiveNav('home');
              }}
              onSignOut={handleSignOut}
            />
          ) : (
            <div className="container mx-auto px-4 py-16 text-center space-y-4">
              <h2 className="text-xl font-bold text-white font-heading">กรุณาเข้าสู่ระบบ</h2>
              <p className="text-sm text-white/50">คุณจำเป็นต้องเข้าสู่ระบบก่อนเพื่อจัดการตั้งค่าผู้ใช้งาน</p>
              <button onClick={handleGoToLogin} className="btn-primary h-10 px-6 rounded-lg text-sm">
                เข้าสู่ระบบทันที
              </button>
            </div>
          )
        )}

        {/* VIEW: ADMIN DASHBOARD (PROTECTED ROUTE FOR REAL OWNER ONLY) */}
        {currentView === 'admin-dashboard' && (
          <ProtectedRoute
            currentUser={currentUser}
            onNavigateHome={() => {
              setCurrentView('home');
              setActiveNav('home');
            }}
            onNavigateLogin={handleGoToLogin}
          >
            <AdminDashboardPage
              currentUser={currentUser}
              onNavigateHome={() => {
                setCurrentView('home');
                setActiveNav('home');
              }}
            />
          </ProtectedRoute>
        )}

        {/* VIEW 5: LOGIN FORM (With Clean White Sign in with Google Button) */}
        {currentView === 'login' && (
          <div className="p-4 sm:p-6 w-full max-w-md mx-auto">
            <div 
              className="join-us-border-light rounded-2xl p-[1px] transition-all"
              style={{ '--join-us-border-light-color': '#ff1e27' } as React.CSSProperties}
            >
              <div className="relative rounded-2xl bg-[#0c0c0c]/95 p-6 sm:p-9 backdrop-blur-xl border border-white/10 flex flex-col gap-5 shadow-2xl">
                
                {/* Back to Home Button */}
                <button
                  onClick={() => setCurrentView('home')}
                  className="self-start inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-colors cursor-pointer"
                >
                  <ArrowLeft className="size-3.5" />
                  <span>กลับสู่หน้าแรก</span>
                </button>

                {/* Header */}
                <div className="text-center flex flex-col items-center gap-1">
                  <div className="size-11 rounded-xl bg-gradient-to-br from-[#dc141c] to-[#ff1e27] flex items-center justify-center shadow-lg shadow-[#ff1e27]/25 mb-1.5">
                    <span className="font-heading font-black text-white text-lg">X</span>
                  </div>
                  <h2 className="font-heading text-2xl font-bold tracking-tight text-white">
                    เข้าสู่ระบบ
                  </h2>
                  <p className="text-xs text-white/55">
                    เข้าสู่ระบบ Xecute Lab เพื่อจัดการสคริปต์และคีย์ของคุณ
                  </p>
                </div>

                {/* Error Banner */}
                {loginError && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                    <AlertCircle className="size-4 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                {/* Clean White Sign in with Google Button (Exact structure from user prompt) */}
                <button
                  type="button"
                  disabled={loginLoading}
                  onClick={handleGoogleLogin}
                  className="relative inline-flex w-full items-center justify-center gap-2 px-4 h-10 rounded-lg bg-white text-base font-medium text-neutral-800 shadow-[0px_2px_0px_0px_rgba(255,255,255,0.55)_inset] duration-300 hover:opacity-80 disabled:pointer-events-none disabled:opacity-50 cursor-pointer"
                >
                  <svg className="size-5" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  <span>Sign in with Google</span>
                </button>

                <div className="relative flex items-center justify-center my-1">
                  <div className="border-t border-white/10 w-full" />
                  <span className="bg-[#0c0c0c] px-3 text-[11px] text-white/40">
                    หรือกรอกข้อมูล
                  </span>
                  <div className="border-t border-white/10 w-full" />
                </div>

                {/* Email Form */}
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleGoogleLogin();
                  }}
                  className="space-y-3.5"
                >
                  <div className="space-y-1.5 text-left">
                    <label className="text-xs text-white/70 font-medium">ที่อยู่อีเมล</label>
                    <div className="relative">
                      <Mail className="size-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input 
                        type="email" 
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="example@email.com"
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/15 text-sm text-white focus:outline-none focus:border-[#ff1e27] transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label className="text-xs text-white/70 font-medium">รหัสผ่าน</label>
                    <div className="relative">
                      <Lock className="size-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input 
                        type="password" 
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/15 text-sm text-white focus:outline-none focus:border-[#ff1e27] transition-colors"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="btn-primary w-full h-10 rounded-lg text-sm sm:text-base font-medium mt-1 flex items-center justify-center gap-2"
                  >
                    {loginLoading ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <span>เข้าสู่ระบบ</span>
                    )}
                  </button>
                </form>

                {/* Link to Signup */}
                <div className="text-center pt-3 border-t border-white/10">
                  <p className="text-xs text-white/60">
                    ยังไม่มีบัญชี?{' '}
                    <button
                      type="button"
                      onClick={handleGoToSignupWithVerification}
                      className="text-[#ff1e27] hover:underline font-medium cursor-pointer ml-1"
                    >
                      คลิ๊กที่นี่เพื่อสมัครสมาชิก
                    </button>
                  </p>
                </div>

              </div>
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-neutral-800/80 py-5 px-6 text-center text-xs text-white/40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <span className="font-heading font-bold text-white text-sm">Xecute Lab</span>
            <span className="text-white/20 mx-2">·</span>
            <span>Scripts, Keys & Source Code Store</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-white/40">
            <button
              onClick={() => setCurrentView('terms')}
              className={`hover:text-white transition-colors cursor-pointer ${currentView === 'terms' ? 'text-[#ff1e27]' : ''}`}
            >
              ข้อกำหนดการให้บริการ
            </button>
            <button
              onClick={() => setCurrentView('privacy')}
              className={`hover:text-white transition-colors cursor-pointer ${currentView === 'privacy' ? 'text-[#ff1e27]' : ''}`}
            >
              นโยบายความเป็นส่วนตัว
            </button>
            <span>© 2026 Xecute Lab.</span>
          </div>
        </div>
      </footer>

      {/* Floating Back to Top Button */}
      {showScrollTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-40 size-11 rounded-xl bg-gradient-to-b from-[#ff3b42] to-[#b90e15] text-white shadow-xl shadow-[#ff1e27]/30 flex items-center justify-center border border-white/25 hover:brightness-110 active:scale-95 transition-all duration-200 cursor-pointer animate-float"
          aria-label="เลื่อนขึ้นด้านบน"
          title="เลื่อนขึ้นด้านบน"
        >
          <ArrowUp className="size-5" />
        </button>
      )}

      {/* Admin Product Create/Edit Modal */}
      <AdminProductModal
        isOpen={productModalOpen}
        editingProduct={editingProduct}
        categories={categories}
        onClose={() => setProductModalOpen(false)}
        onSave={async (data, id) => {
          await handleSaveProduct(data, id);
          setProductModalOpen(false);
        }}
      />

      {/* Admin Category Create/Edit Modal */}
      <CategoryModal
        isOpen={categoryModalOpen}
        editingCategory={editingCategory}
        onClose={() => setCategoryModalOpen(false)}
        onSave={async (data, id) => {
          await handleSaveCategory(data, id);
          setCategoryModalOpen(false);
        }}
      />

      {/* Admin Script Update Create/Edit Modal */}
      <ScriptUpdateModal
        isOpen={scriptUpdateModalOpen}
        editingUpdate={editingScriptUpdate}
        onClose={() => setScriptUpdateModalOpen(false)}
        onSave={async (data, id) => {
          await handleSaveScriptUpdate(data, id);
          setScriptUpdateModalOpen(false);
        }}
      />

      {/* Instant Product & Category Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        products={products}
        categories={categories}
        onClose={() => setIsSearchOpen(false)}
        onSelectResult={(view) => {
          setCurrentView(view);
          if (view !== 'home') {
            setActiveNav(view);
          }
        }}
        onSelectProduct={(p) => {
          setSelectedProduct(p);
        }}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setCurrentView('category-1');
        }}
        onPurchase={handleOpenPurchase}
      />

      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-black/95 border border-[#ff1e27]/50 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-2xl shadow-[#ff1e27]/30 animate-fade-in">
          <CheckCircle2 className="size-4 text-[#ff1e27]" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
