import React, { useEffect } from 'react';
import { ArrowLeft, Lock } from 'lucide-react';
import { PRIVACY_PAGE_CONTENT } from '../data/legal.ts';

interface PrivacyPageProps {
  onBack: () => void;
  onNavigateTerms: () => void;
}

export const PrivacyPage: React.FC<PrivacyPageProps> = ({ onBack, onNavigateTerms }) => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="relative min-h-screen w-full bg-black text-white selection:bg-[#ff1e27] selection:text-white pb-24">
      
      {/* Background Ambience with Red Glow */}
      <div 
        className="pointer-events-none fixed inset-0 z-0 opacity-25"
        style={{
          background: `
            radial-gradient(ellipse 70% 35% at 50% -10%, rgba(255, 30, 39, 0.22), transparent 75%)
          `
        }}
      />
      <div className="pointer-events-none fixed inset-0 z-0 hd-grid-bg opacity-15" />

      {/* Main article container */}
      <main className="relative z-10 mx-auto max-w-3xl px-6 md:px-8 pt-10 sm:pt-14">
        
        {/* Navigation Breadcrumb / Back Button */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-white/80 hover:text-white transition-all cursor-pointer"
          >
            <ArrowLeft className="size-3.5" />
            <span>กลับสู่หน้าร้านค้า / สมัครสมาชิก</span>
          </button>

          <button
            onClick={onNavigateTerms}
            className="text-xs text-[#ff1e27] hover:underline font-medium cursor-pointer"
          >
            ดูข้อกำหนดการให้บริการ →
          </button>
        </div>

        {/* Page Header */}
        <header className="border-b border-white/10 pb-8">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-[#ff1e27] animate-pulse" />
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-[#ff1e27]">
              Xecute Lab Store
            </p>
          </div>
          
          <h1 className="font-heading mt-3 text-3xl font-semibold leading-tight text-white md:text-4xl">
            นโยบายความเป็นส่วนตัวและคุ้มครองข้อมูล
          </h1>
          
          <p className="mt-4 text-base leading-relaxed text-white/70 md:text-lg">
            เราเก็บข้อมูลเท่าที่จำเป็นต่อการสั่งซื้อ ส่งมอบคีย์/สคริปต์ และการยืนยันสิทธิ์การใช้งาน — ข้อมูลของคุณจะถูกเก็บรักษาอย่างปลอดภัย ไม่มีการส่งต่อหรือขายต่อบุคคลภายนอก
          </p>
          
          <div className="mt-4 flex items-center gap-3 text-xs text-white/45">
            <span>อัปเดตล่าสุด: 16 มิถุนายน 2569</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-[#ff1e27]">
              <Lock className="size-3" /> คุ้มครองข้อมูลตามมาตรฐาน PDPA & HWID Security
            </span>
          </div>
        </header>

        {/* Legal Document Sections */}
        <div className="legal-document mt-10 space-y-10 text-white/80">
          {PRIVACY_PAGE_CONTENT.map((section, idx) => (
            <section key={idx} className="space-y-4">
              <h2 className="font-heading text-xl font-semibold text-white md:text-2xl flex items-baseline gap-2">
                <span className="text-[#ff1e27] font-mono text-sm opacity-80">§</span>
                <span>{section.h2}</span>
              </h2>

              <div className="space-y-3 text-[15px] leading-relaxed text-white/75 md:text-base">
                {section.paragraphs.map((p, pIdx) => (
                  <p key={pIdx}>{p}</p>
                ))}

                {section.lis && section.lis.length > 0 && (
                  <ul className="list-disc pl-6 space-y-2 mt-2 text-white/70">
                    {section.lis.map((item, lIdx) => (
                      <li key={lIdx} className="marker:text-[#ff1e27]">
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          ))}
        </div>

        {/* Footer callout inside article */}
        <div className="mt-16 p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-white">ต้องการสอบถามเรื่องการจัดเก็บคีย์หรือข้อมูลส่วนบุคคล?</h3>
            <p className="text-xs text-white/55 mt-0.5">คุณสามารถติดต่อเจ้าหน้าที่ฝ่ายเทคนิคเพื่อขอตรวจสอบหรือลบข้อมูลได้ตลอดเวลา</p>
          </div>
          <button
            onClick={onBack}
            className="btn-primary shrink-0 px-4 py-2 rounded-lg text-xs font-medium"
          >
            ย้อนกลับไปหน้าสมัครสมาชิก
          </button>
        </div>

      </main>

    </div>
  );
};
