import React, { useEffect, useState } from 'react';
import { Check } from 'lucide-react';

interface BotVerificationProps {
  onVerified: () => void;
  isQuick?: boolean;
}

export const BotVerification: React.FC<BotVerificationProps> = ({ onVerified, isQuick = false }) => {
  const [stage, setStage] = useState<'analyzing' | 'confirming' | 'done'>('analyzing');

  useEffect(() => {
    // If user already verified during current active session, verify almost instantaneously (300ms)
    const t1Delay = isQuick ? 150 : 850;
    const t2Delay = isQuick ? 400 : 1750;

    const t1 = setTimeout(() => {
      setStage('confirming');
    }, t1Delay);

    const t2 = setTimeout(() => {
      setStage('done');
      onVerified();
    }, t2Delay);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [onVerified, isQuick]);

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-black px-4 select-none">
      <div className="flex flex-col items-center text-center max-w-md">
        
        {/* Blossom Petals Logo in Red Brand Identity */}
        <div className="relative flex items-center justify-center size-16 mb-2">
          {/* Subtle Red glow background */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#dc141c]/30 via-[#ff1e27]/25 to-[#ff6b6b]/20 blur-xl animate-pulse" />
          
          <svg className="size-14 animate-spin [animation-duration:7s]" viewBox="0 0 100 100" fill="none">
            {/* Top petal - Crimson Red */}
            <path
              d="M50 14 C40 14 36 24 40 34 C44 44 56 44 60 34 C64 24 60 14 50 14 Z"
              fill="#ff1e27"
              opacity="0.95"
            />
            {/* Right petal - Vivid Vermilion */}
            <path
              d="M86 50 C86 40 76 36 66 40 C56 44 56 56 66 60 C76 64 86 60 86 50 Z"
              fill="#dc141c"
              opacity="0.9"
            />
            {/* Bottom petal - Deep Carmine */}
            <path
              d="M50 86 C60 86 64 76 60 66 C56 56 44 56 40 66 C36 76 40 86 50 86 Z"
              fill="#b90e15"
              opacity="0.95"
            />
            {/* Left petal - Coral Red Highlight */}
            <path
              d="M14 50 C14 60 24 64 34 60 C44 56 44 44 34 40 C24 36 14 40 14 50 Z"
              fill="#ff4b53"
              opacity="0.9"
            />
            {/* Inner center ring */}
            <circle cx="50" cy="50" r="13" fill="#0c0c0c" stroke="#ff1e27" strokeWidth="2.5" />
          </svg>
        </div>

        {/* Heading matching screenshot */}
        <h1 className="mt-6 text-[28px] font-semibold tracking-tight text-white font-heading">
          {isQuick ? 'ยืนยันเซสชันความปลอดภัย...' : 'Verifying your request...'}
        </h1>

        {/* Subtitle matching screenshot */}
        <p className="mt-2 text-[15px] text-white/85 font-sans">
          {isQuick 
            ? 'พบเซสชันการยืนยันแล้ว กำลังเชื่อมต่อเข้าสู่ระบบ...' 
            : "Please hold on while we confirm you're not a robot."
          }
        </p>

        {/* Cloudflare/Turnstile Style Verification Box in Red Accent */}
        <div className="mt-8 min-h-[65px] flex items-center justify-center">
          <div className="flex items-center gap-3.5 px-4 py-3 rounded-xl bg-[#121212] border border-white/10 shadow-lg min-w-[280px]">
            {stage === 'analyzing' && (
              <div className="size-5 rounded border-2 border-white/20 border-t-[#ff1e27] animate-spin" />
            )}
            {stage === 'confirming' && (
              <div className="size-5 rounded border-2 border-[#ff1e27] border-t-transparent animate-spin" />
            )}
            {stage === 'done' && (
              <div className="size-5 rounded bg-[#ff1e27] flex items-center justify-center text-white font-bold text-xs shadow-md shadow-[#ff1e27]/40">
                <Check className="size-3.5 stroke-[3] text-white" />
              </div>
            )}
            
            <div className="flex flex-col text-left">
              <span className="text-xs font-medium text-white/90">
                {stage === 'done' 
                  ? 'ยืนยันตัวตนสำเร็จ (Session Active)' 
                  : (isQuick ? 'ตรวจสอบสิทธิ์ฉับไว...' : 'กำลังตรวจสอบความปลอดภัย...')
                }
              </span>
              <span className="text-[10px] text-white/40 font-mono">
                Xecute Lab Security Shield
              </span>
            </div>

            <div className="ml-auto text-[10px] text-[#ff1e27]/70 font-mono">
              v2.4
            </div>
          </div>
        </div>

      </div>
    </main>
  );
};
