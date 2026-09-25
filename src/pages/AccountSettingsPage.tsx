import React, { useState, useEffect, useRef } from 'react';
import { 
  User, 
  Lock, 
  Camera, 
  Link as LinkIcon, 
  Upload, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  ChevronRight, 
  ShieldAlert, 
  Eye, 
  EyeOff, 
  Info,
  KeyRound,
  ArrowLeft
} from 'lucide-react';
import { 
  auth, 
  db, 
  doc, 
  getDoc, 
  setDoc, 
  serverTimestamp, 
  updateProfile, 
  updatePassword, 
  reauthenticateWithCredential, 
  EmailAuthProvider,
  type FirebaseUser 
} from '../lib/firebase.ts';

interface AccountSettingsPageProps {
  currentUser: FirebaseUser;
  onNavigateHome: () => void;
  onSignOut: () => void;
}

export function AccountSettingsPage({ currentUser, onNavigateHome, onSignOut }: AccountSettingsPageProps) {
  // Profile state
  const [nickname, setNickname] = useState('');
  const [username, setUsername] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [photoInputMode, setPhotoInputMode] = useState<'url' | 'upload'>('url');
  const [imageURLInput, setImageURLInput] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [repeatNewPassword, setRepeatNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load user data from Firestore on mount
  useEffect(() => {
    async function loadUserData() {
      if (!currentUser) return;
      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setNickname(data.displayName || currentUser.displayName || '');
          setUsername(data.username || (currentUser.email ? currentUser.email.split('@')[0] : currentUser.uid.substring(0, 8)));
          setPhotoURL(data.photoURL || currentUser.photoURL || '');
          setImageURLInput(data.photoURL || currentUser.photoURL || '');
        } else {
          const defaultUsername = currentUser.email ? currentUser.email.split('@')[0] : 'user_' + currentUser.uid.substring(0, 6);
          setNickname(currentUser.displayName || 'Xecute Member');
          setUsername(defaultUsername);
          setPhotoURL(currentUser.photoURL || '');
          setImageURLInput(currentUser.photoURL || '');
          // Create initial user doc
          await setDoc(userDocRef, {
            uid: currentUser.uid,
            email: currentUser.email || '',
            displayName: currentUser.displayName || 'Xecute Member',
            username: defaultUsername,
            photoURL: currentUser.photoURL || '',
            createdAt: serverTimestamp()
          }, { merge: true });
        }
      } catch (err: any) {
        console.warn("Firestore user profile sync status:", err?.message || err);
      }
    }
    loadUserData();
  }, [currentUser]);

  // Handle Profile Update (Nickname and Photo)
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setProfileSaving(true);
    setProfileSuccess(null);
    setProfileError(null);

    try {
      const finalPhoto = photoInputMode === 'url' ? imageURLInput.trim() : photoURL;
      
      // Update Auth Profile
      await updateProfile(currentUser, {
        displayName: nickname.trim(),
        photoURL: finalPhoto || null
      });

      // Update Firestore user doc
      const userDocRef = doc(db, 'users', currentUser.uid);
      await setDoc(userDocRef, {
        displayName: nickname.trim(),
        photoURL: finalPhoto || '',
        updatedAt: serverTimestamp()
      }, { merge: true });

      setPhotoURL(finalPhoto);
      setProfileSuccess('บันทึกข้อมูลโปรไฟล์เรียบร้อยแล้ว!');
      setTimeout(() => setProfileSuccess(null), 4000);
    } catch (err: any) {
      console.error("Error updating profile:", err);
      setProfileError(err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setProfileSaving(false);
    }
  };

  // Handle Direct Image File Upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setProfileError('กรุณาเลือกไฟล์รูปภาพเท่านั้น (JPG, PNG, GIF, WEBP)');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setProfileError('ขนาดไฟล์รูปภาพต้องไม่เกิน 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPhotoURL(result);
      setProfileError(null);
    };
    reader.readAsDataURL(file);
  };

  // Handle Change Password with User's exact requirements
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSaving(true);
    setPasswordSuccess(null);
    setPasswordError(null);

    // Validation 1: Length >= 8
    if (newPassword.length < 8) {
      setPasswordError('รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 8 ตัวอักษร');
      setPasswordSaving(false);
      return;
    }

    // Validation 2: Must not equal current password
    if (newPassword === currentPassword) {
      setPasswordError('รหัสผ่านใหม่ต้องไม่เหมือนรหัสผ่านปัจจุบัน');
      setPasswordSaving(false);
      return;
    }

    // Validation 3: Must match repeat password
    if (newPassword !== repeatNewPassword) {
      setPasswordError('รหัสผ่านใหม่ทั้งสองช่องไม่ตรงกัน');
      setPasswordSaving(false);
      return;
    }

    try {
      // Re-authenticate using current password
      if (!currentUser.email) {
        throw new Error('ไม่พบข้อมูลอีเมลของบัญชีผู้ใช้');
      }

      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);

      // Update Password
      await updatePassword(currentUser, newPassword);

      setPasswordSuccess('เปลี่ยนรหัสผ่านสำเร็จเรียบร้อยแล้ว');
      setCurrentPassword('');
      setNewPassword('');
      setRepeatNewPassword('');
      setTimeout(() => setPasswordSuccess(null), 5000);
    } catch (err: any) {
      console.error("Password update error:", err);
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setPasswordError('รหัสผ่านปัจจุบันไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง');
      } else if (err.code === 'auth/requires-recent-login') {
        setPasswordError('เซสชันหมดอายุ กรุณาออกจากระบบแล้วเข้าสู่ระบบใหม่อีกครั้ง');
      } else {
        setPasswordError(err.message || 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน');
      }
    } finally {
      setPasswordSaving(false);
    }
  };

  const isGoogleUser = currentUser.providerData.some(p => p.providerId === 'google.com');

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 max-w-4xl space-y-8 animate-fade-in">
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
            ตั้งค่าผู้ใช้งาน
          </span>
        </li>
      </ol>

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-[#141414] via-[#0d0d0d] to-[#170505] p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="size-9 rounded-xl bg-[#ff1e27]/10 border border-[#ff1e27]/25 flex items-center justify-center text-[#ff1e27]">
                <User className="size-5" />
              </div>
              <span className="text-xs font-semibold text-[#ff1e27] tracking-wider uppercase">
                Account Management
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
              ตั้งค่าผู้ใช้งาน
            </h1>
            <p className="text-xs sm:text-sm text-white/60">
              จัดการข้อมูลโปรไฟล์ ชื่อเล่น และการรักษาความปลอดภัยของบัญชีคุณ
            </p>
          </div>

          <button
            onClick={onNavigateHome}
            className="btn-secondary h-9 px-4 rounded-lg text-xs shrink-0 flex items-center gap-1.5 interactive-tap"
          >
            <ArrowLeft className="size-3.5" />
            <span>กลับสู่หน้าแรก</span>
          </button>
        </div>

        <div className="absolute right-0 top-0 -mr-16 -mt-16 size-56 rounded-full bg-[#ff1e27]/10 blur-3xl pointer-events-none" />
      </div>

      <div className="grid grid-cols-1 gap-8">
        
        {/* =========================================================================
            SECTION 1: PROFILE MANAGEMENT (Avatar, Nickname, Readonly Username)
            ========================================================================= */}
        <div className="rounded-2xl border border-white/10 bg-[#0f0f0f] p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#ff1e27]">
                <User className="size-4" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white font-heading">
                  ข้อมูลโปรไฟล์ผู้ใช้งาน
                </h2>
                <span className="text-xs text-white/40">แก้ไขรูปโปรไฟล์และชื่อเล่น</span>
              </div>
            </div>
          </div>

          {profileSuccess && (
            <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-green-500/10 border border-green-500/25 text-green-400 text-xs sm:text-sm animate-fade-in">
              <CheckCircle2 className="size-4 shrink-0" />
              <span>{profileSuccess}</span>
            </div>
          )}

          {profileError && (
            <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs sm:text-sm animate-fade-in">
              <AlertCircle className="size-4 shrink-0" />
              <span>{profileError}</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-6">
            
            {/* Avatar Section: Live preview + URL / Direct Upload */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-4 sm:p-5 rounded-2xl border border-white/5 bg-white/[0.02]">
              {/* Profile Image Preview */}
              <div className="relative group shrink-0">
                <div className="size-24 sm:size-28 rounded-2xl overflow-hidden border-2 border-[#ff1e27]/40 bg-neutral-900 shadow-xl shadow-black/60 flex items-center justify-center">
                  {photoURL ? (
                    <img 
                      src={photoURL} 
                      alt="Profile Avatar" 
                      className="size-full object-cover"
                      onError={() => setPhotoURL('')}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-white/30">
                      <User className="size-10 text-[#ff1e27]" />
                      <span className="text-[10px] text-white/40 mt-1">ไม่มีรูป</span>
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 size-7 rounded-lg bg-[#ff1e27] border border-white/20 flex items-center justify-center text-white shadow-md">
                  <Camera className="size-3.5" />
                </div>
              </div>

              {/* Avatar Controls: URL or Direct Upload */}
              <div className="flex-1 w-full space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label className="text-xs sm:text-sm font-semibold text-white">
                    รูปโปรไฟล์ (Profile Avatar)
                  </label>
                  <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-lg border border-white/10">
                    <button
                      type="button"
                      onClick={() => setPhotoInputMode('url')}
                      className={`text-[11px] font-medium px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                        photoInputMode === 'url'
                          ? 'bg-[#ff1e27] text-white shadow-sm'
                          : 'text-white/60 hover:text-white'
                      }`}
                    >
                      <LinkIcon className="size-3" />
                      <span>URL ลิงก์รูปภาพ</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPhotoInputMode('upload')}
                      className={`text-[11px] font-medium px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                        photoInputMode === 'upload'
                          ? 'bg-[#ff1e27] text-white shadow-sm'
                          : 'text-white/60 hover:text-white'
                      }`}
                    >
                      <Upload className="size-3" />
                      <span>อัพโหลดรูปลงโดยตรง</span>
                    </button>
                  </div>
                </div>

                {photoInputMode === 'url' ? (
                  <div className="space-y-1.5">
                    <div className="relative">
                      <LinkIcon className="size-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input 
                        type="url"
                        value={imageURLInput}
                        onChange={(e) => {
                          setImageURLInput(e.target.value);
                          setPhotoURL(e.target.value);
                        }}
                        placeholder="https://example.com/avatar.jpg"
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/15 text-xs sm:text-sm text-white focus:outline-none focus:border-[#ff1e27] transition-colors"
                      />
                    </div>
                    <span className="text-[11px] text-white/40 block">
                      วางลิงก์รูปภาพที่ต้องการใช้เป็นรูปโปรไฟล์ (ระบบจะแสดงตัวอย่างทันที)
                    </span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <input 
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full border border-dashed border-white/20 hover:border-[#ff1e27]/50 rounded-xl p-3.5 flex items-center justify-center gap-2.5 cursor-pointer bg-white/[0.02] hover:bg-white/[0.04] transition-all group"
                    >
                      <Upload className="size-4 text-[#ff1e27] group-hover:scale-110 transition-transform" />
                      <span className="text-xs text-white/70 group-hover:text-white">
                        คลิกเพื่อเลือกไฟล์รูปภาพจากอุปกรณ์ (PNG, JPG, WEBP สูงสุด 2MB)
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Username Field (READONLY with Warning as Requested) */}
            <div className="space-y-2 text-left">
              <div className="flex items-center justify-between">
                <label className="text-xs sm:text-sm font-semibold text-white/80">
                  ชื่อผู้ใช้งาน (Username)
                </label>
                <span className="text-[11px] text-white/40 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                  ไม่สามารถเปลี่ยนได้
                </span>
              </div>
              
              <div className="relative">
                <input 
                  type="text" 
                  disabled
                  value={username}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs sm:text-sm text-white/45 cursor-not-allowed select-none font-mono"
                />
              </div>

              {/* Warning note as requested by user */}
              <div className="flex items-start gap-2 p-2.5 rounded-xl bg-[#ff1e27]/10 border border-[#ff1e27]/25 text-[#ff6b6b] text-xs leading-relaxed">
                <Info className="size-4 shrink-0 mt-0.5 text-[#ff1e27]" />
                <span>
                  ชื่อผู้ใช้งานไม่สามารถเปลี่ยนได้ด้วยตนเอง หากต้องการเปลี่ยน โปรดติดต่อเจ้าของร้าน
                </span>
              </div>
            </div>

            {/* Nickname / Display Name Field (EDITABLE) */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs sm:text-sm font-semibold text-white/90">
                ชื่อเล่น / ชื่อที่แสดง (Nickname)
              </label>
              <input 
                type="text" 
                required
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="เช่น Ton, Max, Xecuter"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-xs sm:text-sm text-white focus:outline-none focus:border-[#ff1e27] transition-colors"
              />
              <span className="text-[11px] text-white/40 block">
                ชื่อนี้จะปรากฏบนแถบเมนูด้านบนและในระบบร้านค้า
              </span>
            </div>

            {/* Submit Profile Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={profileSaving}
                className="btn-primary h-10 px-6 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2 interactive-tap"
              >
                {profileSaving ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>กำลังบันทึก...</span>
                  </>
                ) : (
                  <span>บันทึกการเปลี่ยนแปลงโปรไฟล์</span>
                )}
              </button>
            </div>

          </form>
        </div>

        {/* =========================================================================
            SECTION 2: CHANGE PASSWORD (Exactly matching user's requested specification)
            ========================================================================= */}
        <div className="rounded-2xl border border-white/10 bg-[#0f0f0f] p-6 sm:p-8 shadow-xl space-y-6">
          <div className="border-b border-white/10 pb-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#ff1e27]">
                <KeyRound className="size-4" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white font-heading">
                  เปลี่ยนรหัสผ่าน
                </h2>
                <span className="text-xs text-white/40 font-mono">Change Password</span>
              </div>
            </div>
          </div>

          {passwordSuccess && (
            <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-green-500/10 border border-green-500/25 text-green-400 text-xs sm:text-sm animate-fade-in">
              <CheckCircle2 className="size-4 shrink-0" />
              <span>{passwordSuccess}</span>
            </div>
          )}

          {passwordError && (
            <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs sm:text-sm animate-fade-in">
              <AlertCircle className="size-4 shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          {isGoogleUser && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white/70">
              <Info className="size-4 text-[#ff1e27] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-white block">บัญชีเชื่อมต่อผ่าน Google</span>
                <span>หากคุณเข้าสู่ระบบด้วย Google คุณสามารถจัดการรหัสผ่านผ่านบัญชี Google หรือตั้งรหัสผ่านใหม่เพื่อเข้าใช้งานผ่านอีเมลได้</span>
              </div>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-5">
            
            {/* Field 1: รหัสผ่านปัจจุบัน / Current Password */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs sm:text-sm font-semibold text-white/90">
                รหัสผ่านปัจจุบัน / Current Password
              </label>
              <div className="relative">
                <input 
                  type={showCurrentPassword ? "text" : "password"}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-white/5 border border-white/15 text-xs sm:text-sm text-white focus:outline-none focus:border-[#ff1e27] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors cursor-pointer"
                >
                  {showCurrentPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {/* Exact helper text from user */}
              <span className="text-[11px] text-white/50 block">
                ใช้รหัสผ่านปัจจุบันเพื่อยืนยันตัวตนว่าคุณเป็นเจ้าของบัญชีนี้
              </span>
            </div>

            {/* Field 2: รหัสผ่านใหม่ / New Password + Rules Box */}
            <div className="space-y-2 text-left">
              <label className="text-xs sm:text-sm font-semibold text-white/90">
                รหัสผ่านใหม่ / New Password
              </label>
              <div className="relative">
                <input 
                  type={showNewPassword ? "text" : "password"}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-white/5 border border-white/15 text-xs sm:text-sm text-white focus:outline-none focus:border-[#ff1e27] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors cursor-pointer"
                >
                  {showNewPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>

              {/* Exact Rules Box as specified by user */}
              <div className="p-3.5 rounded-xl border border-white/10 bg-white/[0.02] text-xs space-y-1.5">
                <span className="font-semibold text-white/80 block">
                  รหัสผ่านใหม่ต้อง
                </span>
                <ul className="space-y-1 text-white/60">
                  <li className={`flex items-center gap-2 ${newPassword.length >= 8 ? 'text-green-400 font-medium' : ''}`}>
                    <span className="size-1.5 rounded-full bg-current" />
                    <span>มีความยาวอย่างน้อย 8 ตัวอักษร</span>
                  </li>
                  <li className={`flex items-center gap-2 ${newPassword && newPassword !== currentPassword ? 'text-green-400 font-medium' : ''}`}>
                    <span className="size-1.5 rounded-full bg-current" />
                    <span>ต้องไม่เหมือนรหัสผ่านปัจจุบัน</span>
                  </li>
                  <li className={`flex items-center gap-2 ${newPassword && repeatNewPassword && newPassword === repeatNewPassword ? 'text-green-400 font-medium' : ''}`}>
                    <span className="size-1.5 rounded-full bg-current" />
                    <span>ต้องกรอกรหัสผ่านใหม่ให้ตรงกันทั้งสองช่อง</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Field 3: รหัสผ่านใหม่อีกครั้ง / Repeat New Password */}
            <div className="space-y-1.5 text-left">
              <label className="text-xs sm:text-sm font-semibold text-white/90">
                รหัสผ่านใหม่อีกครั้ง / Repeat New Password
              </label>
              <div className="relative">
                <input 
                  type={showRepeatPassword ? "text" : "password"}
                  required
                  value={repeatNewPassword}
                  onChange={(e) => setRepeatNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-white/5 border border-white/15 text-xs sm:text-sm text-white focus:outline-none focus:border-[#ff1e27] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors cursor-pointer"
                >
                  {showRepeatPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {/* Exact helper text from user */}
              <span className="text-[11px] text-white/50 block">
                ใส่รหัสผ่านใหม่อีกครั้งเพื่อยืนยันว่าคุณพิมพ์ถูกต้อง
              </span>
            </div>

            {/* Submit Password Button */}
            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                disabled={passwordSaving}
                className="btn-primary h-10 px-6 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2 interactive-tap"
              >
                {passwordSaving ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>กำลังเปลี่ยนรหัสผ่าน...</span>
                  </>
                ) : (
                  <span>เปลี่ยนรหัสผ่าน</span>
                )}
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}
