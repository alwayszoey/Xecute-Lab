import { 
  db, 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  getDocs, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp,
  query,
  orderBy,
  where,
  limit
} from './firebase.ts';
import firebaseConfig from '../../firebase-applet-config.json';

export type PurchaseType = 'standard' | 'key' | 'button' | 'custom';

export interface ProductItem {
  id: string;
  name: string;
  categoryId: string;
  categoryName?: string;
  price: number;
  originalPrice?: number;
  wholesalePrice?: number; // ราคาขายส่ง
  stock: number;
  imageUrl: string;
  images?: string[]; // Multiple images for gallery zoom
  badge?: string; // e.g. "HOT", "VIP", "POPULAR", "NEW", "SRC"
  tags: string[];
  description: string;
  customContent?: string; // 1. Custom text / details on page (เขียนอะไรก็ได้)
  customNoticeBox?: string; // Highlight notice or warning banner
  purchaseType?: PurchaseType; // 1. standard, 2. key, 3. button, 4. custom
  buttonText?: string; // Custom button label
  buttonLink?: string; // Custom external link or Discord
  keyFormat?: string; // License key pattern or sample key
  customFieldLabel?: string; // e.g. "กรอกชื่อในเกม Roblox หรือ Discord ID"
  customFieldPlaceholder?: string;
  customNoteLabel?: string; // Additional custom note prompt
  customSuccessMessage?: string; // Message after purchase
  downloadUrl?: string; // ลิงก์ดาวน์โหลด หรือข้อความ/สคริปต์ไม่จำกัด
  downloadContent?: string; // รองรับข้อความ/สคริปต์ดาวน์โหลดไม่จำกัด
  videoUrl?: string; // ลิงก์วิดีโอตัวอย่าง YouTube
  discountPercent?: number; // ส่วนลด (%)
  effect?: 'none' | 'aurora' | 'gold' | 'rainbow_aura'; // เอฟเฟกต์การ์ด
  allowPoints?: boolean; // ระบบแต้ม: อนุญาตให้ซื้อด้วยแต้ม
  pointPrice?: number; // จำนวนแต้มที่ต้องใช้
  promoBuyCount?: number; // โปรโมชั่นซื้อแถม: ซื้อจำนวน (ชิ้น)
  promoFreeCount?: number; // โปรโมชั่นซื้อแถม: แถมจำนวน (ชิ้น)
  showSalesCount?: boolean; // สวิตช์แสดงยอดขาย
  isUnderMaintenance?: boolean; // สวิตช์กำลังปรับปรุง
  isOrderProduct?: boolean; // สวิตช์สินค้าแบบออเดอร์
  requiresInput?: boolean; // สวิตช์จำเป็นต้องกรอกข้อมูล
  relatedProductIds?: string[]; // สินค้าที่เกี่ยวข้อง (สูงสุด 8 รายการ)
  isRecommended: boolean;
  isFeatured?: boolean;
  status: 'active' | 'out_of_stock' | 'hidden';
  salesCount: number;
  createdAt?: any;
  updatedAt?: any;
}

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  description: string;
  productCount: number;
  orderIndex: number;
  status: 'active' | 'hidden';
  isEnabled?: boolean;
  badge?: string;
  parentCategory?: string;
  effect?: string;
  createdAt?: any;
}

export interface SiteSettings {
  marqueeText: string;
  storeStatus: 'open' | 'maintenance' | 'closed';
  maintenanceNotice: string;
  bannerImageUrl: string;
  heroTitle: string;
  heroSubtitle: string;
  announcementBadge: string;
  primaryColor?: string; // e.g. '#ff1e27'
  themeMode?: 'dark' | 'light';
  websiteBgImage?: string;
  websiteBgOpacity?: number; // e.g. 14
  particleEffect?: string; // e.g. 'oneko.js' | 'none' | 'particles'
  updatedAt?: any;
}

export interface GiveawayItem {
  id: string;
  title: string;
  description: string;
  itemType: 'script' | 'key' | 'code' | 'balance';
  rewardValue: string;
  remainingCount: number;
  totalCount: number;
  status: 'active' | 'ended';
  createdAt?: any;
}

export interface PromoCodeItem {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed_amount';
  discountValue: number;
  usageLimit: number;
  usedCount: number;
  minSpend?: number;
  status: 'active' | 'expired';
  expiresAt?: string;
  createdAt?: any;
}

export interface ClaimItem {
  id: string;
  userId: string;
  userEmail: string;
  orderId?: string;
  productName: string;
  reason: string;
  proofUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNote?: string;
  createdAt?: any;
}

export interface ReviewItem {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  productId: string;
  productName: string;
  rating: number; // 1-5
  comment: string;
  status: 'approved' | 'hidden' | 'pending';
  createdAt?: any;
}

export interface SupportChatItem {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  lastMessage: string;
  unreadCount: number;
  status: 'open' | 'resolved' | 'waiting';
  updatedAt?: any;
}

export interface MiniGameHistoryItem {
  id: string;
  userId: string;
  userEmail: string;
  gameType: string;
  rewardName: string;
  rewardType: 'item' | 'key' | 'points' | 'nothing';
  createdAt?: any;
}

export interface TrashItem {
  id: string;
  originalCollection: 'categories' | 'products' | 'orders';
  itemData: any;
  deletedAt: any;
}

export interface UserAccountItem {
  uid: string;
  email: string;
  displayName: string;
  username: string;
  photoURL?: string;
  role: 'owner' | 'admin' | 'vip' | 'moderator' | 'user';
  balance: number;
  status: 'active' | 'banned' | 'suspended';
  rankBadge?: string;
  createdAt?: any;
  lastLoginAt?: any;
}

export interface OrderItem {
  id: string;
  userId: string;
  userEmail: string;
  userName?: string;
  productId: string;
  productName: string;
  amount: number;
  status: 'completed' | 'pending' | 'refunded' | 'cancelled';
  keyIssued: string;
  items?: any[];
  totalAmount?: number;
  paymentMethod?: string;
  licenseKey?: string;
  deliveredKeys?: string[];
  downloadUrl?: string;
  downloadContent?: string;
  customFields?: Record<string, any>;
  createdAt?: any;
}

// Default Fallback Settings
export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  marqueeText: 'ยินดีต้อนรับสู่ Xecute Lab — ร้านค้าจำหน่าย Scripts, License Keys และ Source Codes (SRC) คุณภาพสูง | อัปเดตแพตช์ระบบและ HWID ล่าสุดประจำสัปดาห์เรียบร้อยแล้ว | สมาชิกใหม่สามารถสมัครและรับสิทธิ์ใช้งานได้ทันที',
  storeStatus: 'open',
  maintenanceNotice: 'ขณะนี้ระบบกำลังปิดปรับปรุงชั่วคราวเพื่ออัปเกรดความปลอดภัย กรุณากลับมาใหม่อีกครั้งในไม่ช้า',
  bannerImageUrl: 'https://img.rdcw.co.th/images/d7a407f0f3f0ba65d82749471d078ec59efcf335451e1f7b9011640252f97d43.jpeg',
  heroTitle: 'ยินดีต้อนรับเข้าสู่ Xecute Lab',
  heroSubtitle: 'ร้านค้าและศูนย์รวมจำหน่าย Scripts, License Keys และ Source Codes (SRC) คุณภาพสูง ตอบโจทย์ทุกการพัฒนาและการใช้งานเฉพาะทาง ด้วยระบบจัดการที่เสถียร รวดเร็ว และปลอดภัยสูงสุด',
  announcementBadge: 'ประกาศ',
  primaryColor: '#ff1e27',
  themeMode: 'dark',
  particleEffect: 'oneko.js'
};

/* =========================================================================
   REAL-TIME LISTENERS
   ========================================================================= */

export function listenSiteSettings(callback: (settings: SiteSettings) => void) {
  const docRef = doc(db, 'site_settings', 'general');
  return onSnapshot(docRef, (snap) => {
    if (snap.exists()) {
      callback(snap.data() as SiteSettings);
    } else {
      // First time initialization
      callback(DEFAULT_SITE_SETTINGS);
    }
  }, (err) => {
    console.warn("Site settings listener:", err);
    callback(DEFAULT_SITE_SETTINGS);
  });
}

export const DEFAULT_CATEGORY: CategoryItem = {
  id: 'category-1',
  name: 'Category 1 / หมวดหมู่ที่ 1 (Roblox Scripts & Keys)',
  slug: 'category-1',
  imageUrl: 'https://img.rdcw.co.th/images/3c8f784a0a8cbe99c7e6e9f6dc9a1cc0d8474a530a8dc891e45cd03eed2ce832.jpeg',
  description: 'ศูนย์รวมสคริปต์ VIP, Bypass และ License Keys สำหรับการพัฒนาเกมระดับสูง',
  productCount: 0,
  orderIndex: 1,
  status: 'active'
};

export const DEFAULT_SCRIPT_UPDATES: Omit<ScriptUpdateItem, 'id'>[] = [
  {
    scriptName: 'Blox Fruits VIP Hub',
    game: 'Roblox',
    version: 'v4.2.1',
    title: 'อัปเดตระบบตรวจสอบ HWID และเพิ่มระบบ Auto Farm v2',
    description: 'ให้รวดเร็วยิ่งขึ้น ปรับปรุงความเสถียรในการรันสคริปต์ และเพิ่มการเข้ารหัสข้อมูล SSL ชั้นสูง เพื่อความปลอดภัยสูงสุดของบัญชีผู้ใช้งาน',
    tags: ['Roblox', 'Auto Farm', 'SSL Encryption', 'HWID Bypass'],
    status: 'undetected',
    changelog: [
      'อัปเดตระบบตรวจสอบ HWID ให้รวดเร็วยิ่งขึ้น ป้องกันการดักจับ',
      'ปรับปรุงความเสถียรในการรันสคริปต์ ไม่หลุดระหว่างฟาร์ม',
      'เพิ่มฟังก์ชัน Auto Mirage Island & Race V4 อัตโนมัติ',
      'รองรับการทำงานร่วมกับ Executor ทุกเวอร์ชัน'
    ],
    downloadUrl: 'https://xecutelab.store/download/blox-fruits',
    scriptCode: 'loadstring(game:HttpGet("https://raw.githubusercontent.com/XecuteLab/Hub/main/loader.lua"))()',
    releaseDate: '2026-09-25'
  },
  {
    scriptName: 'FiveM Bypass & Clean Engine',
    game: 'FiveM',
    version: 'v2.8.0',
    title: 'Core Security Protocol Patch & Memory Shield',
    description: 'ปรับปรุงความปลอดภัยโครงสร้างระบบ License Authentication และเพิ่ม Memory Masking ป้องกันการตรวจจับจากแอดมินเซิร์ฟเวอร์',
    tags: ['FiveM', 'Bypass', 'Memory Shield'],
    status: 'undetected',
    changelog: [
      'ปรับปรุงความปลอดภัยโครงสร้างระบบ License Authentication',
      'อัปเดต Memory Masking ป้องกันการตรวจจับจากแอดมินเซิร์ฟเวอร์',
      'แก้ปัญหา FPS Drop ขณะเปิดใช้งาน UI เมนู'
    ],
    downloadUrl: 'https://xecutelab.store/download/fivem',
    releaseDate: '2026-09-20'
  },
  {
    scriptName: 'Universal FPS Booster & Bypass',
    game: 'Multi-Game',
    version: 'v1.5.0',
    title: 'New Architecture & Multi-Core Optimization',
    description: 'เปิดตัวโครงสร้าง SRC ชุดใหม่ นำไปปรับแต่งต่อได้ง่าย และเพิ่มประสิทธิภาพการประมวลผล CPU & GPU ให้ลื่นไหลยิ่งขึ้น',
    tags: ['FPS Boost', 'Optimization', 'Universal'],
    status: 'undetected',
    changelog: [
      'เปิดตัวโครงสร้าง SRC ชุดใหม่ นำไปปรับแต่งต่อได้ง่าย',
      'เพิ่มประสิทธิภาพการประมวลผล CPU & GPU ให้ลื่นไหลยิ่งขึ้น'
    ],
    downloadUrl: 'https://xecutelab.store/download/booster',
    releaseDate: '2026-09-15'
  }
];

export async function ensureDefaultScriptUpdates(): Promise<void> {
  try {
    const colRef = collection(db, 'script_updates');
    const snap = await getDocs(colRef);
    if (snap.empty) {
      for (const update of DEFAULT_SCRIPT_UPDATES) {
        await addDoc(colRef, {
          ...update,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
    }
  } catch (err) {
    console.warn("ensureDefaultScriptUpdates notice:", err);
  }
}

export async function ensureDefaultCategory(): Promise<void> {
  try {
    const colRef = collection(db, 'categories');
    const snap = await getDocs(colRef);
    if (snap.empty) {
      const catRef = doc(db, 'categories', 'category-1');
      await setDoc(catRef, {
        ...DEFAULT_CATEGORY,
        createdAt: serverTimestamp()
      });
    }
  } catch (err) {
    console.warn("ensureDefaultCategory notice:", err);
  }
}

export interface ScriptUpdateItem {
  id: string;
  scriptName: string;
  version: string;
  title: string;
  description?: string;
  tags?: string[];
  game: string;
  status: 'undetected' | 'updating' | 'testing' | 'patched';
  changelog: string[];
  downloadUrl?: string;
  scriptCode?: string;
  releaseDate?: string;
  createdAt?: any;
  updatedAt?: any;
}

export function listenScriptUpdates(callback: (updates: ScriptUpdateItem[]) => void) {
  const colRef = collection(db, 'script_updates');
  return onSnapshot(colRef, (snap) => {
    const list: ScriptUpdateItem[] = [];
    snap.forEach((d) => {
      list.push({ id: d.id, ...d.data() } as ScriptUpdateItem);
    });
    // Sort by createdAt descending if available
    list.sort((a, b) => {
      const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
      const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
      return timeB - timeA;
    });
    callback(list);
  }, (err) => {
    console.warn("Script updates listener:", err);
    callback([]);
  });
}

export async function saveScriptUpdate(update: Partial<ScriptUpdateItem>, id?: string) {
  if (id) {
    const docRef = doc(db, 'script_updates', id);
    await setDoc(docRef, {
      ...update,
      updatedAt: serverTimestamp()
    }, { merge: true });
    return id;
  } else {
    const colRef = collection(db, 'script_updates');
    const docRef = await addDoc(colRef, {
      ...update,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  }
}

export async function deleteScriptUpdate(id: string) {
  const docRef = doc(db, 'script_updates', id);
  await deleteDoc(docRef);
}

export function listenCategories(callback: (categories: CategoryItem[]) => void) {
  const colRef = collection(db, 'categories');
  return onSnapshot(colRef, (snap) => {
    const list: CategoryItem[] = [];
    snap.forEach((d) => {
      list.push({ id: d.id, ...d.data() } as CategoryItem);
    });
    list.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
    callback(list);
  }, (err) => {
    console.warn("Categories listener:", err);
    callback([]);
  });
}

export function listenProducts(callback: (products: ProductItem[]) => void) {
  const colRef = collection(db, 'products');
  return onSnapshot(colRef, (snap) => {
    const list: ProductItem[] = [];
    snap.forEach((d) => {
      list.push({ id: d.id, ...d.data() } as ProductItem);
    });
    callback(list);
  }, (err) => {
    console.warn("Products listener:", err);
    callback([]);
  });
}

/* =========================================================================
   SITE SETTINGS MUTATIONS
   ========================================================================= */

export async function saveSiteSettings(settings: Partial<SiteSettings>) {
  const docRef = doc(db, 'site_settings', 'general');
  await setDoc(docRef, {
    ...settings,
    updatedAt: serverTimestamp()
  }, { merge: true });
}

/* =========================================================================
   CATEGORY MUTATIONS
   ========================================================================= */

export async function saveCategory(category: Partial<CategoryItem>, id?: string) {
  if (id) {
    const docRef = doc(db, 'categories', id);
    await setDoc(docRef, {
      ...category,
      updatedAt: serverTimestamp()
    }, { merge: true });
    return id;
  } else {
    const colRef = collection(db, 'categories');
    const docRef = await addDoc(colRef, {
      ...category,
      productCount: 0,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  }
}

export async function deleteCategory(id: string) {
  const docRef = doc(db, 'categories', id);
  await deleteDoc(docRef);
}

/* =========================================================================
   PRODUCT MUTATIONS
   ========================================================================= */

export async function saveProduct(product: Partial<ProductItem>, id?: string) {
  // Strip out any undefined values so Firestore does not throw Unsupported field value: undefined
  const cleanProduct: Record<string, any> = {};
  for (const [key, value] of Object.entries(product)) {
    if (value !== undefined) {
      cleanProduct[key] = value;
    }
  }

  if (id) {
    const docRef = doc(db, 'products', id);
    await setDoc(docRef, {
      ...cleanProduct,
      updatedAt: serverTimestamp()
    }, { merge: true });
    return id;
  } else {
    const colRef = collection(db, 'products');
    const docRef = await addDoc(colRef, {
      ...cleanProduct,
      salesCount: cleanProduct.salesCount ?? 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  }
}

export async function deleteProduct(id: string) {
  const docRef = doc(db, 'products', id);
  await deleteDoc(docRef);
}

export async function duplicateProduct(id: string) {
  const docRef = doc(db, 'products', id);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return null;
  const data = snap.data() as ProductItem;
  const colRef = collection(db, 'products');
  const newDoc = await addDoc(colRef, {
    ...data,
    name: `${data.name} (สำเนา)`,
    salesCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return newDoc.id;
}

export async function clearAllProducts() {
  const colRef = collection(db, 'products');
  const snap = await getDocs(colRef);
  const promises: Promise<void>[] = [];
  snap.forEach((d) => {
    promises.push(deleteDoc(doc(db, 'products', d.id)));
  });
  await Promise.all(promises);
}

/* =========================================================================
   USER & ROLE MUTATIONS
   ========================================================================= */

export async function fetchAllUsers(): Promise<UserAccountItem[]> {
  try {
    const colRef = collection(db, 'users');
    const snap = await getDocs(colRef);
    const list: UserAccountItem[] = [];
    snap.forEach((d) => {
      list.push({ uid: d.id, ...d.data() } as UserAccountItem);
    });
    return list;
  } catch (err) {
    console.warn("Fetch users error:", err);
    return [];
  }
}

export async function updateUserAccount(
  uid: string, 
  data: Partial<UserAccountItem>
) {
  const docRef = doc(db, 'users', uid);
  await setDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp()
  }, { merge: true });
}

/* =========================================================================
   ORDERS & TRANSACTIONS
   ========================================================================= */

export async function fetchAllOrders(): Promise<OrderItem[]> {
  try {
    const colRef = collection(db, 'orders');
    const snap = await getDocs(colRef);
    const list: OrderItem[] = [];
    snap.forEach((d) => {
      list.push({ id: d.id, ...d.data() } as OrderItem);
    });
    return list;
  } catch (err) {
    console.warn("Fetch orders error:", err);
    return [];
  }
}

export async function createOrder(order: Omit<OrderItem, 'id'>) {
  const colRef = collection(db, 'orders');
  const docRef = await addDoc(colRef, {
    ...order,
    createdAt: serverTimestamp()
  });
  return docRef.id;
}

export async function updateOrderStatus(orderId: string, status: OrderItem['status']) {
  const docRef = doc(db, 'orders', orderId);
  await updateDoc(docRef, { status });
}

/* =========================================================================
   QUICK SEEDER: Populate Real Initial Catalog (For 1-Click Setup)
   ========================================================================= */

export interface LicenseKeyItem {
  id: string;
  productId: string;
  productName: string;
  keyCode: string;
  isUsed: boolean;
  usedByEmail?: string;
  usedAt?: any;
  createdAt?: any;
}

export interface AuditLogItem {
  id: string;
  adminEmail: string;
  action: string;
  details: string;
  category: 'product' | 'category' | 'user' | 'cms' | 'order' | 'key' | 'system';
  createdAt?: any;
}

export interface MasterTagItem {
  id: string;
  name: string;
  color?: string;
  productCount?: number;
  createdAt?: any;
}

/* =========================================================================
   LICENSE KEY VAULT & STOCK OPERATIONS
   ========================================================================= */

export function listenLicenseKeys(
  productId: string,
  callback: (keys: LicenseKeyItem[]) => void
) {
  const colRef = collection(db, 'license_keys');
  const q = query(colRef, where('productId', '==', productId));
  return onSnapshot(q, (snapshot) => {
    const list: LicenseKeyItem[] = [];
    snapshot.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() } as LicenseKeyItem);
    });
    // Sort client-side by createdAt desc
    list.sort((a, b) => {
      const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt || 0);
      const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt || 0);
      return timeB - timeA;
    });
    callback(list);
  }, (err) => {
    console.warn("listenLicenseKeys error:", err);
  });
}

export async function fetchLicenseKeys(productId?: string): Promise<LicenseKeyItem[]> {
  try {
    const colRef = collection(db, 'license_keys');
    const q = productId 
      ? query(colRef, where('productId', '==', productId))
      : colRef;
    const snap = await getDocs(q);
    const list: LicenseKeyItem[] = [];
    snap.forEach(d => list.push({ id: d.id, ...d.data() } as LicenseKeyItem));
    return list;
  } catch (err) {
    console.warn("fetchLicenseKeys error:", err);
    return [];
  }
}

export async function addSingleLicenseKey(
  productId: string,
  productName: string,
  keyCode: string
): Promise<string> {
  const colRef = collection(db, 'license_keys');
  const docRef = await addDoc(colRef, {
    productId,
    productName,
    keyCode: keyCode.trim(),
    isUsed: false,
    createdAt: serverTimestamp()
  });
  await syncProductStockFromKeys(productId);
  return docRef.id;
}

export async function addLicenseKeysBulk(
  productId: string,
  productName: string,
  keys: string[]
): Promise<number> {
  const colRef = collection(db, 'license_keys');
  let count = 0;
  for (const k of keys) {
    const trimmed = k.trim();
    if (trimmed) {
      await addDoc(colRef, {
        productId,
        productName,
        keyCode: trimmed,
        isUsed: false,
        createdAt: serverTimestamp()
      });
      count++;
    }
  }
  await syncProductStockFromKeys(productId);
  return count;
}

export async function updateLicenseKey(keyId: string, data: Partial<LicenseKeyItem>) {
  const docRef = doc(db, 'license_keys', keyId);
  await updateDoc(docRef, data);
  if (data.productId) {
    await syncProductStockFromKeys(data.productId);
  }
}

export async function deleteLicenseKey(keyId: string, productId?: string) {
  const docRef = doc(db, 'license_keys', keyId);
  await deleteDoc(docRef);
  if (productId) {
    await syncProductStockFromKeys(productId);
  }
}

export async function clearSoldLicenseKeys(productId: string): Promise<number> {
  const colRef = collection(db, 'license_keys');
  const q = query(colRef, where('productId', '==', productId), where('isUsed', '==', true));
  const snap = await getDocs(q);
  const promises: Promise<void>[] = [];
  snap.forEach(d => promises.push(deleteDoc(doc(db, 'license_keys', d.id))));
  await Promise.all(promises);
  await syncProductStockFromKeys(productId);
  return snap.size;
}

export async function clearAllProductLicenseKeys(productId: string): Promise<number> {
  const colRef = collection(db, 'license_keys');
  const q = query(colRef, where('productId', '==', productId));
  const snap = await getDocs(q);
  const promises: Promise<void>[] = [];
  snap.forEach(d => promises.push(deleteDoc(doc(db, 'license_keys', d.id))));
  await Promise.all(promises);
  await syncProductStockFromKeys(productId);
  return snap.size;
}

export async function syncProductStockFromKeys(productId: string): Promise<number> {
  try {
    const colRef = collection(db, 'license_keys');
    const q = query(colRef, where('productId', '==', productId), where('isUsed', '==', false));
    const snap = await getDocs(q);
    const availableCount = snap.size;
    
    // Update product stock in products collection
    const prodRef = doc(db, 'products', productId);
    const prodSnap = await getDoc(prodRef);
    if (prodSnap.exists()) {
      await updateDoc(prodRef, {
        stock: availableCount,
        status: availableCount > 0 ? 'active' : 'out_of_stock',
        updatedAt: serverTimestamp()
      });
    }
    return availableCount;
  } catch (err) {
    console.warn("syncProductStockFromKeys error:", err);
    return 0;
  }
}

export async function syncAllProductsStock(): Promise<{ updated: number }> {
  try {
    const prodCol = collection(db, 'products');
    const prodSnap = await getDocs(prodCol);
    let updated = 0;
    for (const p of prodSnap.docs) {
      await syncProductStockFromKeys(p.id);
      updated++;
    }
    return { updated };
  } catch (err) {
    console.warn("syncAllProductsStock error:", err);
    return { updated: 0 };
  }
}

export async function claimAvailableKeysForOrder(
  productId: string,
  quantity: number,
  buyerEmail: string
): Promise<string[]> {
  try {
    const colRef = collection(db, 'license_keys');
    const q = query(colRef, where('productId', '==', productId), where('isUsed', '==', false), limit(quantity));
    const snap = await getDocs(q);
    const claimedKeys: string[] = [];

    for (const d of snap.docs) {
      const data = d.data() as LicenseKeyItem;
      claimedKeys.push(data.keyCode);
      await updateDoc(doc(db, 'license_keys', d.id), {
        isUsed: true,
        usedByEmail: buyerEmail,
        usedAt: serverTimestamp()
      });
    }

    await syncProductStockFromKeys(productId);
    return claimedKeys;
  } catch (err) {
    console.warn("claimAvailableKeysForOrder error:", err);
    return [];
  }
}

/* =========================================================================
   AUDIT LOGS OPERATIONS
   ========================================================================= */

export async function logAdminActivity(
  adminEmail: string,
  action: string,
  details: string,
  category: AuditLogItem['category']
) {
  try {
    const colRef = collection(db, 'audit_logs');
    await addDoc(colRef, {
      adminEmail,
      action,
      details,
      category,
      createdAt: serverTimestamp()
    });
  } catch (err) {
    console.warn("Audit log write error:", err);
  }
}

export async function fetchAuditLogs(): Promise<AuditLogItem[]> {
  try {
    const colRef = collection(db, 'audit_logs');
    const q = query(colRef, orderBy('createdAt', 'desc'), limit(50));
    const snap = await getDocs(q);
    const list: AuditLogItem[] = [];
    snap.forEach(d => list.push({ id: d.id, ...d.data() } as AuditLogItem));
    return list;
  } catch (err) {
    // Fallback if index is building or unordered query
    try {
      const snap = await getDocs(collection(db, 'audit_logs'));
      const list: AuditLogItem[] = [];
      snap.forEach(d => list.push({ id: d.id, ...d.data() } as AuditLogItem));
      return list;
    } catch {
      return [];
    }
  }
}

/* =========================================================================
   MASTER TAGS OPERATIONS
   ========================================================================= */

export const DEFAULT_MASTER_TAGS: MasterTagItem[] = [
  { id: 'tag-roblox', name: 'Roblox', color: '#ff1e27' },
  { id: 'tag-src', name: 'Open SRC', color: '#3b82f6' },
  { id: 'tag-autofarm', name: 'Auto Farm', color: '#10b981' },
  { id: 'tag-undetected', name: 'Undetected', color: '#f59e0b' },
  { id: 'tag-hwid', name: 'HWID Bypass', color: '#8b5cf6' },
  { id: 'tag-fivem', name: 'FiveM Lua', color: '#ec4899' },
  { id: 'tag-discord', name: 'Discord Bot', color: '#6366f1' },
  { id: 'tag-vip', name: 'VIP Only', color: '#e11d48' }
];

export async function fetchMasterTags(): Promise<MasterTagItem[]> {
  try {
    const colRef = collection(db, 'tags');
    const snap = await getDocs(colRef);
    if (snap.empty) {
      return DEFAULT_MASTER_TAGS;
    }
    const list: MasterTagItem[] = [];
    snap.forEach(d => list.push({ id: d.id, ...d.data() } as MasterTagItem));
    return list;
  } catch (err) {
    return DEFAULT_MASTER_TAGS;
  }
}

export async function saveMasterTag(tag: { name: string; color?: string }, id?: string) {
  if (id) {
    const docRef = doc(db, 'tags', id);
    await setDoc(docRef, { ...tag, updatedAt: serverTimestamp() }, { merge: true });
    return id;
  } else {
    const colRef = collection(db, 'tags');
    const docRef = await addDoc(colRef, { ...tag, createdAt: serverTimestamp() });
    return docRef.id;
  }
}

export async function deleteMasterTag(id: string) {
  const docRef = doc(db, 'tags', id);
  await deleteDoc(docRef);
}

/* =========================================================================
   DATABASE INSPECTION & BENCHMARK
   ========================================================================= */

export async function testDatabaseBenchmark(): Promise<{
  ok: boolean;
  latencyMs: number;
  timestamp: string;
  error?: string;
}> {
  const start = performance.now();
  try {
    const testDocRef = doc(db, 'test', 'ping_' + Date.now());
    await setDoc(testDocRef, { ping: true, time: serverTimestamp() });
    const snap = await getDoc(testDocRef);
    await deleteDoc(testDocRef);
    const latencyMs = Math.round(performance.now() - start);
    return {
      ok: snap.exists(),
      latencyMs,
      timestamp: new Date().toISOString()
    };
  } catch (err: any) {
    return {
      ok: false,
      latencyMs: Math.round(performance.now() - start),
      timestamp: new Date().toISOString(),
      error: err?.message || String(err)
    };
  }
}

export async function exportCompleteDatabase() {
  const collectionsToExport = ['products', 'categories', 'site_settings', 'users', 'orders', 'license_keys', 'audit_logs', 'tags', 'script_updates'];
  const dump: Record<string, any[]> = {};

  for (const c of collectionsToExport) {
    try {
      const snap = await getDocs(collection(db, c));
      dump[c] = [];
      snap.forEach(d => dump[c].push({ _id: d.id, ...d.data() }));
    } catch {
      dump[c] = [];
    }
  }

  return {
    exportedAt: new Date().toISOString(),
    projectId: firebaseConfig.projectId,
    databaseId: firebaseConfig.firestoreDatabaseId,
    collections: dump
  };
}

export async function seedInitialStoreData() {
  // 1. Initialize Site Settings
  await saveSiteSettings(DEFAULT_SITE_SETTINGS);

  // 2. Initialize Standard Category 1
  const catRef = await addDoc(collection(db, 'categories'), {
    name: 'Category 1 / หมวดหมู่ที่ 1 (Roblox Scripts & Keys)',
    slug: 'category-1',
    imageUrl: 'https://img.rdcw.co.th/images/3c8f784a0a8cbe99c7e6e9f6dc9a1cc0d8474a530a8dc891e45cd03eed2ce832.jpeg',
    description: 'ศูนย์รวมสคริปต์ VIP, Bypass และ License Keys สำหรับการพัฒนาเกมระดับสูง',
    productCount: 3,
    orderIndex: 1,
    status: 'active',
    createdAt: serverTimestamp()
  });

  // 3. Initialize High Quality Products covering all 4 purchase modes
  const sampleProducts: Partial<ProductItem>[] = [
    {
      name: 'Blox Fruit VIP Script [SRC Full Open Code]',
      categoryId: catRef.id,
      categoryName: 'Category 1 / หมวดหมู่ที่ 1 (Roblox Scripts & Keys)',
      price: 490,
      originalPrice: 890,
      stock: 50,
      imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
      badge: 'HOT SALE',
      tags: ['Roblox', 'Open SRC', 'Auto Farm', 'Undetected'],
      description: 'สุดยอดสคริปต์ Blox Fruit พร้อม Source Code เต็ม ฟังก์ชัน Auto Raid, Auto Quest, Fast Attack เสถียร 100%',
      customContent: 'คุณสมบัติเด่นของ Blox Fruit VIP Hub:\n- ฟังก์ชัน Auto Farm Level สูงสุด พร้อม Fast Attack v3\n- ระบบ Auto Mirage Island & Race V4 อัตโนมัติ\n- Bypass การตรวจจับ 100% ไม่เสี่ยงโดนแบน\n\nวิธีการใช้งาน:\n1. กดสั่งซื้อเพื่อรับลิงก์ดาวน์โหลดสคริปต์\n2. โหลดไฟล์และนำโค้ดไปรันใน Executor ที่คุณต้องการ',
      customNoticeBox: 'อัปเดตแพตช์ระบบความปลอดภัยและ HWID ล่าสุดประจำสัปดาห์เรียบร้อยแล้ว',
      purchaseType: 'standard',
      buttonText: 'ซื้อสินค้า',
      downloadUrl: 'https://xecute-lab.com/downloads/blox-fruit-v4-src.zip',
      isRecommended: true,
      isFeatured: true,
      status: 'active',
      salesCount: 142
    },
    {
      name: 'Xecute HWID Bypass & Anti-Cheat Spoofer (30 Days Key)',
      categoryId: catRef.id,
      categoryName: 'Category 1 / หมวดหมู่ที่ 1 (Roblox Scripts & Keys)',
      price: 290,
      originalPrice: 450,
      stock: 120,
      imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
      badge: 'VIP KEY',
      tags: ['HWID Spoofer', '30 Days', 'Kernel Level', 'One-Click'],
      description: 'ระบบบายพาสการตรวจจับระดับ Kernel HWID รองรับทั้ง Vanguard, EasyAntiCheat และ BattlEye ใช้งานง่ายในคลิกเดียว',
      customContent: 'ระบบจัดส่ง License Key ทันที:\n- เมื่อกดสั่งซื้อ ระบบจะสุ่มหรือออก License Key ให้คุณทันที\n- สามารถกดปุ่ม "คัดลอก" เพื่อนำไปเปิดใช้งานในตัวโปรแกรมได้เลย\n- มีระยะเวลาการใช้งาน 30 วันนับจากครั้งแรกที่กรอกคีย์',
      purchaseType: 'key',
      buttonText: 'สั่งซื้อและรับ License Key ทันที',
      keyFormat: 'XECUTE-VIP-HWID-2026',
      downloadUrl: 'https://xecute-lab.com/keys/hwid-spoofer-v3.exe',
      isRecommended: true,
      isFeatured: true,
      status: 'active',
      salesCount: 89
    },
    {
      name: 'FiveM Lua Anti-Cheat Obfuscator & Protector Pro',
      categoryId: catRef.id,
      categoryName: 'Category 1 / หมวดหมู่ที่ 1 (Roblox Scripts & Keys)',
      price: 990,
      originalPrice: 1590,
      stock: 25,
      imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
      badge: 'BEST SELLER',
      tags: ['FiveM', 'Obfuscator', 'Lua Protection', 'Anti-Dump'],
      description: 'ระบบเข้ารหัสและป้องกันการแอบขโมยโค้ดสคริปต์ FiveM ป้องกันการ Dump โค้ดผ่าน NUI และ Memory 100%',
      customContent: 'การสั่งซื้อรูปแบบปุ่มพิเศษ (ติดต่อเปิด Ticket ผ่าน Discord):\n- สคริปต์นี้เป็นการติดตั้งเฉพาะเครื่องเซิร์ฟเวอร์\n- เมื่อกดปุ่มสั่งซื้อ จะนำท่านเข้าสู่ Discord ทางการเพื่อเปิด Ticket รับสิทธิ์',
      purchaseType: 'button',
      buttonText: 'ติดต่อซื้อผ่าน Discord ทางการ',
      buttonLink: 'https://discord.gg/xecutelab',
      isRecommended: true,
      isFeatured: false,
      status: 'active',
      salesCount: 65
    },
    {
      name: 'Custom Roblox Script & Game Exploit Commission',
      categoryId: catRef.id,
      categoryName: 'Category 1 / หมวดหมู่ที่ 1 (Roblox Scripts & Keys)',
      price: 1200,
      originalPrice: 1800,
      stock: 15,
      imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
      badge: 'CUSTOM SERVICE',
      tags: ['Custom Work', 'Roblox Script', 'Private Build'],
      description: 'บริการสั่งทำสคริปต์เกม Roblox ส่วนตัวตามสั่ง สามารถเลือกเกมและฟังก์ชันที่ต้องการได้',
      customContent: 'รูปแบบ Custom สั่งทำเฉพาะบุคคล:\n- กรอก Roblox Username และ Discord Tag ของคุณในฟอร์มด้านล่าง\n- ทีมงานพัฒนาจะสร้าง Private Build เฉพาะคุณและส่งมอบให้ทาง Discord โดยเร็วที่สุด',
      purchaseType: 'custom',
      buttonText: 'ยืนยันและส่งคำสั่งซื้อแบบ Custom',
      customFieldLabel: 'กรอกชื่อในเกม Roblox หรือ Discord ID:',
      customFieldPlaceholder: 'เช่น RobloxPlayer_99 / Discord: xecute#0001',
      customNoteLabel: 'ระบุชื่อเกมและฟังก์ชันที่ต้องการให้พัฒนา:',
      customSuccessMessage: 'บันทึกคำสั่งซื้อเรียบร้อยแล้ว! ทีมงานกำลังเตรียมสร้าง Private Build ให้คุณ',
      isRecommended: true,
      isFeatured: false,
      status: 'active',
      salesCount: 38
    }
  ];

  for (const prod of sampleProducts) {
    await saveProduct(prod as any);
  }
}

/* =========================================================================
   GIVEAWAY OPERATIONS
   ========================================================================= */

export function listenGiveaways(callback: (items: GiveawayItem[]) => void) {
  const colRef = collection(db, 'giveaways');
  return onSnapshot(colRef, (snap) => {
    const list: GiveawayItem[] = [];
    snap.forEach(d => list.push({ id: d.id, ...d.data() } as GiveawayItem));
    callback(list);
  }, () => callback([]));
}

export async function saveGiveaway(item: Partial<GiveawayItem>, id?: string) {
  if (id) {
    await setDoc(doc(db, 'giveaways', id), { ...item, updatedAt: serverTimestamp() }, { merge: true });
    return id;
  } else {
    const res = await addDoc(collection(db, 'giveaways'), {
      ...item,
      remainingCount: item.totalCount || 10,
      totalCount: item.totalCount || 10,
      status: 'active',
      createdAt: serverTimestamp()
    });
    return res.id;
  }
}

export async function deleteGiveaway(id: string) {
  await deleteDoc(doc(db, 'giveaways', id));
}

/* =========================================================================
   PROMO CODE OPERATIONS
   ========================================================================= */

export function listenPromoCodes(callback: (items: PromoCodeItem[]) => void) {
  const colRef = collection(db, 'promo_codes');
  return onSnapshot(colRef, (snap) => {
    const list: PromoCodeItem[] = [];
    snap.forEach(d => list.push({ id: d.id, ...d.data() } as PromoCodeItem));
    callback(list);
  }, () => callback([]));
}

export async function savePromoCode(code: Partial<PromoCodeItem>, id?: string) {
  if (id) {
    await setDoc(doc(db, 'promo_codes', id), { ...code, updatedAt: serverTimestamp() }, { merge: true });
    return id;
  } else {
    const res = await addDoc(collection(db, 'promo_codes'), {
      ...code,
      usedCount: 0,
      status: 'active',
      createdAt: serverTimestamp()
    });
    return res.id;
  }
}

export async function deletePromoCode(id: string) {
  await deleteDoc(doc(db, 'promo_codes', id));
}

/* =========================================================================
   CLAIMS OPERATIONS
   ========================================================================= */

export function listenClaims(callback: (items: ClaimItem[]) => void) {
  const colRef = collection(db, 'claims');
  return onSnapshot(colRef, (snap) => {
    const list: ClaimItem[] = [];
    snap.forEach(d => list.push({ id: d.id, ...d.data() } as ClaimItem));
    callback(list);
  }, () => callback([]));
}

export async function updateClaimStatus(claimId: string, status: ClaimItem['status'], note?: string) {
  await updateDoc(doc(db, 'claims', claimId), {
    status,
    adminNote: note || '',
    updatedAt: serverTimestamp()
  });
}

/* =========================================================================
   REVIEWS OPERATIONS
   ========================================================================= */

export function listenReviews(callback: (items: ReviewItem[]) => void) {
  const colRef = collection(db, 'reviews');
  return onSnapshot(colRef, (snap) => {
    const list: ReviewItem[] = [];
    snap.forEach(d => list.push({ id: d.id, ...d.data() } as ReviewItem));
    callback(list);
  }, () => callback([]));
}

export async function updateReviewStatus(reviewId: string, status: ReviewItem['status']) {
  await updateDoc(doc(db, 'reviews', reviewId), { status });
}

export async function deleteReview(reviewId: string) {
  await deleteDoc(doc(db, 'reviews', reviewId));
}

/* =========================================================================
   SUPPORT CHATS OPERATIONS
   ========================================================================= */

export function listenSupportChats(callback: (items: SupportChatItem[]) => void) {
  const colRef = collection(db, 'support_chats');
  return onSnapshot(colRef, (snap) => {
    const list: SupportChatItem[] = [];
    snap.forEach(d => list.push({ id: d.id, ...d.data() } as SupportChatItem));
    callback(list);
  }, () => callback([]));
}

export async function updateChatStatus(chatId: string, status: SupportChatItem['status']) {
  await updateDoc(doc(db, 'support_chats', chatId), { status });
}

/* =========================================================================
   MINI GAMES OPERATIONS
   ========================================================================= */

export function listenMiniGameHistory(callback: (items: MiniGameHistoryItem[]) => void) {
  const colRef = collection(db, 'minigames_history');
  return onSnapshot(colRef, (snap) => {
    const list: MiniGameHistoryItem[] = [];
    snap.forEach(d => list.push({ id: d.id, ...d.data() } as MiniGameHistoryItem));
    callback(list);
  }, () => callback([]));
}

/* =========================================================================
   TRASH / RECYCLE BIN OPERATIONS
   ========================================================================= */

export function listenTrash(callback: (items: TrashItem[]) => void) {
  const colRef = collection(db, 'trash');
  return onSnapshot(colRef, (snap) => {
    const list: TrashItem[] = [];
    snap.forEach(d => list.push({ id: d.id, ...d.data() } as TrashItem));
    callback(list);
  }, () => callback([]));
}

export async function moveToTrash(collectionName: 'categories' | 'products' | 'orders', itemData: any) {
  await addDoc(collection(db, 'trash'), {
    originalCollection: collectionName,
    itemData,
    deletedAt: serverTimestamp()
  });
}

export async function emptyTrash() {
  const snap = await getDocs(collection(db, 'trash'));
  for (const d of snap.docs) {
    await deleteDoc(doc(db, 'trash', d.id));
  }
}
