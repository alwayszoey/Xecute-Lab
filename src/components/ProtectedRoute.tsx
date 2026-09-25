import React from 'react';
import { ShieldAlert, Lock, AlertTriangle, Home } from 'lucide-react';
import { type FirebaseUser } from '../lib/firebase.ts';

// Configured Primary Owner Email strictly loaded from .env (VITE_OWNER_EMAIL or fallback to CPJustink@gmail.com)
export const OWNER_EMAIL = (import.meta.env.VITE_OWNER_EMAIL || 'CPJustink@gmail.com').trim();

interface ProtectedRouteProps {
  currentUser: FirebaseUser | null;
  onNavigateHome: () => void;
  onNavigateLogin: () => void;
  children: React.ReactNode;
}

/**
 * Checks whether the current authenticated user has Owner privileges.
 * STRICT: Only this single email configured in .env has permission.
 */
export function isUserOwner(currentUser: FirebaseUser | null): boolean {
  if (!currentUser || !currentUser.email) return false;
  return currentUser.email.trim().toLowerCase() === OWNER_EMAIL.toLowerCase();
}

/**
 * ProtectedRoute Component:
 * Intercepts unauthorized URL attempts to /admin or Admin Dashboard view.
 * If unauthorized, renders a high-tech cybersecurity 403 Forbidden screen
 * with incident tracking and audit warning.
 */
export function ProtectedRoute({
  currentUser,
  onNavigateHome,
  onNavigateLogin,
  children
}: ProtectedRouteProps) {
  const isOwner = isUserOwner(currentUser);

  // Case 1: Not logged in at all -> 401 Unauthorized Guard
  if (!currentUser) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-2xl bg-[#0b0b0b] border border-[#ff1e27]/30 p-8 text-center shadow-2xl relative overflow-hidden">
          {/* Glowing Cyber Accent */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#ff1e27]/20 rounded-full blur-3xl pointer-events-none" />
          
          <div className="size-16 rounded-2xl bg-[#ff1e27]/10 border border-[#ff1e27]/30 flex items-center justify-center mx-auto mb-5 text-[#ff1e27]">
            <Lock className="size-8" />
          </div>

          <h2 className="font-heading text-2xl font-bold text-white mb-2">
            Authentication Required
          </h2>
          <p className="text-sm text-white/60 mb-6 leading-relaxed">
            คุณจำเป็นต้องเข้าสู่ระบบด้วยบัญชีเจ้าของระบบ (<span className="text-[#ff1e27] font-mono">{OWNER_EMAIL}</span>) ก่อนเข้าถึงส่วนควบคุมหลังบ้านนี้
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={onNavigateLogin}
              className="btn-primary h-11 w-full rounded-xl text-sm font-semibold shadow-lg cursor-pointer"
            >
              เข้าสู่ระบบทันที
            </button>
            <button
              onClick={onNavigateHome}
              className="btn-secondary h-10 w-full rounded-xl text-xs text-white/70 hover:text-white cursor-pointer"
            >
              กลับสู่หน้าแรก
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Case 2: Logged in, but NOT the owner -> 403 Forbidden Guard
  if (!isOwner) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <div className="max-w-lg w-full rounded-2xl bg-[#0d0707] border border-red-600/40 p-8 text-center shadow-2xl relative overflow-hidden">
          {/* Cyber Alarm Ambient Glow */}
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />
          
          <div className="size-18 rounded-2xl bg-red-500/10 border border-red-500/40 flex items-center justify-center mx-auto mb-5 text-[#ff1e27] shadow-[0_0_20px_rgba(255,30,39,0.3)] animate-pulse">
            <ShieldAlert className="size-9" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono mb-3">
            <AlertTriangle className="size-3.5" />
            <span>HTTP 403 FORBIDDEN</span>
          </div>

          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-white mb-2 tracking-tight">
            Access Denied: Owner Privileges Required
          </h1>
          <p className="text-sm text-white/65 mb-6 leading-relaxed">
            บัญชีของคุณ (<span className="text-white font-medium">{currentUser.email}</span>) ไม่มีสิทธิ์เข้าถึง <strong>Admin Dashboard</strong> ระบบบันทึกการพยายามเข้าถึงนี้ไว้ใน Security Audit Log เรียบร้อยแล้ว
          </p>

          {/* Security Diagnostic Box */}
          <div className="text-left bg-black/60 border border-white/10 rounded-xl p-4 mb-6 font-mono text-xs space-y-1.5 text-white/70">
            <div className="flex justify-between">
              <span className="text-white/40">Request User:</span>
              <span className="text-white/80">{currentUser.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40">Expected Owner:</span>
              <span className="text-[#ff1e27] font-semibold">{OWNER_EMAIL}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40">Status:</span>
              <span className="text-yellow-400">UNAUTHORIZED_CUSTOMER</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/40">Enforcement:</span>
              <span className="text-green-400">Zero-Trust Frontend Guard</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={onNavigateHome}
              className="btn-primary h-11 px-6 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer"
            >
              <Home className="size-4" />
              <span>กลับสู่หน้าหลักที่ปลอดภัย</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Access Granted: Real Authenticated Owner is logged in
  return <>{children}</>;
}
