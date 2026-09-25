import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  KeyRound, 
  Check, 
  X, 
  Loader2,
  AlertCircle
} from 'lucide-react';
import { 
  auth, 
  db, 
  googleAuthProvider, 
  signInWithPopup, 
  doc, 
  getDoc, 
  setDoc, 
  serverTimestamp,
  handleFirestoreError,
  OperationType 
} from '../lib/firebase.ts';

interface SignupFormProps {
  onSuccess: () => void;
  onGoToLogin: () => void;
  onOpenTerms: () => void;
  onOpenPrivacy: () => void;
}

export const SignupForm: React.FC<SignupFormProps> = ({
  onSuccess,
  onGoToLogin,
  onOpenTerms,
  onOpenPrivacy
}) => {
  const [username, setUsername] = useState('');
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'unavailable'>('idle');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Normalize username
  const handleUsernameChange = (val: string) => {
    const clean = val.toLowerCase().replace(/[^a-z0-9_-]/g, '');
    setUsername(clean);
  };

  // Debounced check for username availability
  useEffect(() => {
    if (!username) {
      setUsernameStatus('idle');
      return;
    }
    if (username.length < 3) {
      setUsernameStatus('unavailable');
      return;
    }

    setUsernameStatus('checking');
    const timer = setTimeout(() => {
      // Validate format and length (alphanumeric, at least 3 characters)
      if (username.length >= 3 && /^[a-z0-9_-]+$/.test(username)) {
        setUsernameStatus('available');
      } else {
        setUsernameStatus('unavailable');
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [username]);

  // Handle Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!acceptedTerms) {
      setErrorMessage('กรุณายอมรับข้อกำหนดการให้บริการและนโยบายความเป็นส่วนตัว');
      return;
    }

    if (username.length < 3) {
      setErrorMessage('ชื่อผู้ใช้ต้องมีความยาวอย่างน้อย 3 ตัวอักษร');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร');
      return;
    }

    setLoading(true);
    try {
      const res = await signInWithPopup(auth, googleAuthProvider);
      const user = res.user;

      const userDocRef = doc(db, 'users', user.uid);
      const newProfile = {
        uid: user.uid,
        username: username || user.uid.slice(0, 8),
        email: email || user.email || '',
        displayName: username,
        role: 'user',
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp()
      };

      try {
        await setDoc(userDocRef, newProfile, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
      }

      onSuccess();
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setErrorMessage(err.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Google OAuth
  const handleGoogleAuth = async () => {
    setErrorMessage(null);
    if (!acceptedTerms) {
      setErrorMessage('กรุณายอมรับข้อกำหนดและนโยบายความเป็นส่วนตัวก่อนดำเนินการต่อ');
      return;
    }

    setLoading(true);
    try {
      const res = await signInWithPopup(auth, googleAuthProvider);
      const user = res.user;

      const userDocRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userDocRef);
      if (!docSnap.exists()) {
        const newProfile = {
          uid: user.uid,
          username: username || user.email?.split('@')[0] || user.uid.slice(0, 8),
          email: user.email || '',
          displayName: user.displayName || username || 'Store Customer',
          role: 'user',
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp()
        };
        await setDoc(userDocRef, newProfile);
      }
      onSuccess();
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setErrorMessage(err.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Container Card with red glow border */}
      <div 
        className="join-us-border-light rounded-2xl p-[1px] transition-all"
        style={{ '--join-us-border-light-color': '#ff1e27' } as React.CSSProperties}
      >
        <div className="relative rounded-2xl bg-[#0c0c0c]/95 p-6 sm:p-9 backdrop-blur-xl border border-white/10 flex flex-col shadow-2xl">
          
          {/* Card Title & Description */}
          <div className="text-center flex flex-col items-center gap-1 mb-6">
            <div className="size-11 rounded-xl bg-gradient-to-br from-[#dc141c] to-[#ff1e27] flex items-center justify-center shadow-lg shadow-[#ff1e27]/25 mb-1.5">
              <span className="font-heading font-black text-white text-lg">X</span>
            </div>
            <h1 className="font-heading text-2xl font-bold tracking-tight text-white">
              สมัครสมาชิก
            </h1>
            <p className="text-xs sm:text-sm text-white/60">
              สร้างบัญชีเพื่อเข้าถึงสคริปต์ คีย์ และซอร์สโค้ดของ Xecute Lab
            </p>
          </div>

          {/* Clean White Sign in with Google Button (Exact structure from user prompt) */}
          <div className="space-y-2.5">
            <button
              type="button"
              disabled={loading}
              onClick={handleGoogleAuth}
              className="relative inline-flex w-full items-center justify-center gap-2 px-4 h-10 rounded-lg bg-white text-base font-medium text-neutral-800 shadow-[0px_2px_0px_0px_rgba(255,255,255,0.55)_inset] duration-300 hover:opacity-80 disabled:pointer-events-none disabled:opacity-50 cursor-pointer"
            >
              <svg className="size-5" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span>Sign Up with Google</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-5">
            <div className="border-t border-white/10 w-full" />
            <span className="bg-[#0c0c0c] px-3 text-[11px] text-white/40 whitespace-nowrap">
              หรือสมัครด้วย
            </span>
            <div className="border-t border-white/10 w-full" />
          </div>

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Field 1: ชื่อผู้ใช้ (Username) */}
            <div>
              <label htmlFor="signup-username" className="block text-xs font-medium text-white/80 mb-1.5">
                ชื่อผู้ใช้
              </label>
              <div className="relative">
                <User className="size-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="signup-username"
                  type="text"
                  value={username}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  placeholder="username"
                  autoComplete="username"
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/15 text-sm text-white focus:outline-none focus:border-[#ff1e27] transition-colors"
                />
              </div>

              {/* Status Indicator */}
              {username && (
                <div className={`mt-1.5 flex items-center gap-1.5 text-xs ${
                  usernameStatus === 'available' ? 'text-[#ff1e27]' : usernameStatus === 'checking' ? 'text-white/45' : 'text-red-400'
                }`}>
                  {usernameStatus === 'available' && <Check className="size-3.5" />}
                  {usernameStatus === 'unavailable' && <X className="size-3.5" />}
                  {usernameStatus === 'checking' && <Loader2 className="size-3.5 animate-spin" />}
                  <span>
                    {usernameStatus === 'available' && 'ชื่อผู้ใช้นี้สามารถใช้งานได้'}
                    {usernameStatus === 'unavailable' && 'ชื่อผู้ใช้นี้ถูกใช้งานแล้ว หรือสั้นเกินไป'}
                    {usernameStatus === 'checking' && 'กำลังตรวจสอบชื่อผู้ใช้...'}
                  </span>
                </div>
              )}
            </div>

            {/* Field 2: ที่อยู่อีเมล */}
            <div>
              <label htmlFor="signup-email" className="block text-xs font-medium text-white/80 mb-1.5">
                ที่อยู่อีเมล
              </label>
              <div className="relative">
                <Mail className="size-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  autoComplete="email"
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/15 text-sm text-white focus:outline-none focus:border-[#ff1e27] transition-colors"
                />
              </div>
            </div>

            {/* Field 3: รหัสผ่าน */}
            <div>
              <label htmlFor="signup-password" className="block text-xs font-medium text-white/80 mb-1.5">
                รหัสผ่าน
              </label>
              <div className="relative">
                <KeyRound className="size-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="signup-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="อย่างน้อย 8 ตัวอักษร"
                  autoComplete="new-password"
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/15 text-sm text-white focus:outline-none focus:border-[#ff1e27] transition-colors"
                />
              </div>
            </div>

            {/* Field 4: Checkbox Terms & Privacy formatted in Red Theme */}
            <div className="pt-1">
              <label className="flex items-start gap-2.5 text-xs text-white/80 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-0.5 size-4 rounded border-white/20 bg-white/10 text-[#ff1e27] focus:ring-0 cursor-pointer accent-[#ff1e27]"
                />
                <span className="[&_a]:text-[#ff1e27] [&_a]:duration-300 [&_a:hover]:underline">
                  ฉันยอมรับ{' '}
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); onOpenTerms(); }}
                    className="text-[#ff1e27] hover:underline inline cursor-pointer font-medium"
                  >
                    ข้อกำหนดการให้บริการ
                  </button>{' '}
                  และ{' '}
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); onOpenPrivacy(); }}
                    className="text-[#ff1e27] hover:underline inline cursor-pointer font-medium"
                  >
                    นโยบายความเป็นส่วนตัว
                  </button>
                </span>
              </label>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
                <AlertCircle className="size-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Primary Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full h-10 rounded-lg text-sm sm:text-base font-medium mt-2 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>กำลังสมัครสมาชิก…</span>
                </>
              ) : (
                <span>สมัครสมาชิก</span>
              )}
            </button>

          </form>

          {/* Footer Link */}
          <div className="text-center pt-4 mt-4 border-t border-white/10">
            <p className="text-xs text-white/60">
              มีบัญชีอยู่แล้ว?{' '}
              <button
                type="button"
                onClick={onGoToLogin}
                className="text-[#ff1e27] hover:underline font-medium cursor-pointer ml-1"
              >
                เข้าสู่ระบบ
              </button>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};
