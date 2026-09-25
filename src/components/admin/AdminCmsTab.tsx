import React, { useState, useEffect } from 'react';
import { Megaphone, AlertCircle, Globe, Check, Image as ImageIcon, Sparkles, RefreshCw } from 'lucide-react';
import { SiteSettings, DEFAULT_SITE_SETTINGS } from '../../lib/store.ts';

interface AdminCmsTabProps {
  settings: SiteSettings;
  onSaveSettings: (settings: Partial<SiteSettings>) => Promise<void>;
}

export const AdminCmsTab: React.FC<AdminCmsTabProps> = ({
  settings,
  onSaveSettings
}) => {
  const [marqueeText, setMarqueeText] = useState(settings.marqueeText || DEFAULT_SITE_SETTINGS.marqueeText);
  const [storeStatus, setStoreStatus] = useState<'open' | 'maintenance' | 'closed'>(settings.storeStatus || 'open');
  const [maintenanceNotice, setMaintenanceNotice] = useState(settings.maintenanceNotice || DEFAULT_SITE_SETTINGS.maintenanceNotice);
  const [bannerImageUrl, setBannerImageUrl] = useState(settings.bannerImageUrl || DEFAULT_SITE_SETTINGS.bannerImageUrl);
  const [heroTitle, setHeroTitle] = useState(settings.heroTitle || DEFAULT_SITE_SETTINGS.heroTitle);
  const [heroSubtitle, setHeroSubtitle] = useState(settings.heroSubtitle || DEFAULT_SITE_SETTINGS.heroSubtitle);
  const [announcementBadge, setAnnouncementBadge] = useState(settings.announcementBadge || DEFAULT_SITE_SETTINGS.announcementBadge);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setMarqueeText(settings.marqueeText || DEFAULT_SITE_SETTINGS.marqueeText);
    setStoreStatus(settings.storeStatus || 'open');
    setMaintenanceNotice(settings.maintenanceNotice || DEFAULT_SITE_SETTINGS.maintenanceNotice);
    setBannerImageUrl(settings.bannerImageUrl || DEFAULT_SITE_SETTINGS.bannerImageUrl);
    setHeroTitle(settings.heroTitle || DEFAULT_SITE_SETTINGS.heroTitle);
    setHeroSubtitle(settings.heroSubtitle || DEFAULT_SITE_SETTINGS.heroSubtitle);
    setAnnouncementBadge(settings.announcementBadge || DEFAULT_SITE_SETTINGS.announcementBadge);
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);
    try {
      await onSaveSettings({
        marqueeText: marqueeText.trim(),
        storeStatus,
        maintenanceNotice: maintenanceNotice.trim(),
        bannerImageUrl: bannerImageUrl.trim(),
        heroTitle: heroTitle.trim(),
        heroSubtitle: heroSubtitle.trim(),
        announcementBadge: announcementBadge.trim()
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      alert('Error saving site settings: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#0f0f13] border border-white/10 p-4 rounded-2xl">
        <div>
          <h3 className="font-heading text-lg font-bold text-white flex items-center gap-2">
            <Megaphone className="size-5 text-[#ff1e27]" />
            <span>จัดการข้อความ & สถานะเว็บไซต์ (CMS & Announcements)</span>
          </h3>
          <p className="text-xs text-white/50 mt-0.5">
            ควบคุมข้อความประกาศตัววิ่ง, แบนเนอร์, ข้อความหัวเว็บ และโหมดปิดปรับปรุงระบบ
          </p>
        </div>

        {saveSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold animate-fade-in">
            <Check className="size-4" />
            <span>อัปเดตข้อมูลหน้าร้านเรียบร้อยแล้ว!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Live Ticker Preview */}
        <div className="rounded-2xl border border-white/10 bg-[#0d0d12] p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-2">
              <Globe className="size-3.5 text-[#ff1e27]" />
              <span>ตัวอย่างข้อความเลื่อนประกาศ (Live Preview)</span>
            </span>
            <span className="text-[10px] text-white/40 font-mono">ซิงค์ทันทีกับแถบประกาศหน้าร้าน</span>
          </div>

          <div className="relative flex items-center overflow-hidden rounded-xl border border-white/10 bg-[#070709] py-2.5 px-3">
            <div className="z-10 flex shrink-0 items-center gap-1 rounded-lg bg-[#ff1e27] px-2.5 py-0.5 text-[11px] font-bold text-white shadow mr-3">
              <Megaphone className="size-3" />
              <span>{announcementBadge || 'ประกาศ'}</span>
            </div>
            <div className="overflow-hidden whitespace-nowrap text-xs text-white/80">
              {marqueeText || 'ข้อความประกาศตัวอย่าง...'}
            </div>
          </div>
        </div>

        {/* Global Store Status */}
        <div className="rounded-2xl border border-white/10 bg-[#0d0d12] p-4 sm:p-5 space-y-4">
          <h4 className="font-heading text-sm font-bold text-white flex items-center gap-2">
            <AlertCircle className="size-4 text-[#ff1e27]" />
            <span>สถานะระบบร้านค้า (Store Operational Status)</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'open', label: 'เปิดให้บริการปกติ (Online)', desc: 'ลูกค้าสามารถสั่งซื้อและทำรายการได้ตลอด 24 ชม.' },
              { id: 'maintenance', label: 'ปิดปรับปรุงชั่วคราว (Maintenance)', desc: 'แสดงป้ายแจ้งเตือนการปรับปรุงระบบบนหน้าร้าน' },
              { id: 'closed', label: 'ปิดรับคำสั่งซื้อ (Closed)', desc: 'ระงับการสั่งซื้อชั่วคราว' }
            ].map((s) => {
              const isSelected = storeStatus === s.id;
              return (
                <div
                  key={s.id}
                  onClick={() => setStoreStatus(s.id as any)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#ff1e27]/15 border-[#ff1e27] text-white'
                      : 'bg-[#15151b] border-white/5 text-white/60 hover:border-white/20'
                  }`}
                >
                  <span className="font-bold block text-xs mb-1">{s.label}</span>
                  <span className="text-[11px] text-white/50">{s.desc}</span>
                </div>
              );
            })}
          </div>

          {storeStatus !== 'open' && (
            <div className="pt-2">
              <label className="block text-xs font-semibold text-white/80 mb-1">
                ข้อความแจ้งเตือนโหมดปิดปรับปรุง
              </label>
              <input
                type="text"
                value={maintenanceNotice}
                onChange={(e) => setMaintenanceNotice(e.target.value)}
                placeholder="ขณะนี้ระบบกำลังปิดปรับปรุงชั่วคราวเพื่ออัปเกรดความปลอดภัย..."
                className="w-full bg-[#15151b] border border-amber-500/30 rounded-xl px-3 py-2 text-xs text-amber-200 focus:border-amber-400 focus:outline-none"
              />
            </div>
          )}
        </div>

        {/* Announcement Text Controls */}
        <div className="rounded-2xl border border-white/10 bg-[#0d0d12] p-4 sm:p-5 space-y-4">
          <h4 className="font-heading text-sm font-bold text-white">
            ข้อความและป้ายประกาศ (Announcement Ticker)
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="sm:col-span-1">
              <label className="block text-xs font-semibold text-white/80 mb-1">
                ข้อความใน Badge
              </label>
              <input
                type="text"
                value={announcementBadge}
                onChange={(e) => setAnnouncementBadge(e.target.value)}
                placeholder="เช่น ประกาศ, HOT DEAL"
                className="w-full bg-[#15151b] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:border-[#ff1e27] focus:outline-none"
              />
            </div>
            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-white/80 mb-1">
                ข้อความเลื่อน (Marquee Announcement Text)
              </label>
              <textarea
                rows={3}
                value={marqueeText}
                onChange={(e) => setMarqueeText(e.target.value)}
                placeholder="พิมพ์ข้อความที่ต้องการให้วิ่งบนหน้าเว็บ..."
                className="w-full bg-[#15151b] border border-white/15 rounded-xl p-3 text-xs text-white focus:border-[#ff1e27] focus:outline-none resize-none"
              />
            </div>
          </div>
        </div>

        {/* Hero Section & Banner Image */}
        <div className="rounded-2xl border border-white/10 bg-[#0d0d12] p-4 sm:p-5 space-y-4">
          <h4 className="font-heading text-sm font-bold text-white">
            ข้อความส่วนหัวเว็บและแบนเนอร์หลัก (Hero Section & Banner)
          </h4>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1">
                หัวข้อหลักหน้าเว็บ (Hero Title)
              </label>
              <input
                type="text"
                value={heroTitle}
                onChange={(e) => setHeroTitle(e.target.value)}
                className="w-full bg-[#15151b] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:border-[#ff1e27] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1">
                คำอธิบายย่อย (Hero Subtitle)
              </label>
              <textarea
                rows={2}
                value={heroSubtitle}
                onChange={(e) => setHeroSubtitle(e.target.value)}
                className="w-full bg-[#15151b] border border-white/15 rounded-xl p-3 text-xs text-white focus:border-[#ff1e27] focus:outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/80 mb-1">
                รูปภาพแบนเนอร์หลัก (Hero Banner URL)
              </label>
              <input
                type="url"
                value={bannerImageUrl}
                onChange={(e) => setBannerImageUrl(e.target.value)}
                className="w-full bg-[#15151b] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:border-[#ff1e27] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary h-11 px-8 rounded-xl text-sm font-bold flex items-center gap-2 shadow-xl cursor-pointer"
          >
            {saving ? (
              <span>กำลังบันทึกลง Firestore...</span>
            ) : (
              <>
                <Check className="size-4" />
                <span>บันทึกการเปลี่ยนแปลงทั้งหมด</span>
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
};
