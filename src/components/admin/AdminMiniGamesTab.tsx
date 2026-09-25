import React, { useState, useEffect } from 'react';
import { Gamepad2, History, Sparkles, Trophy, Gift, Dices } from 'lucide-react';
import { MiniGameHistoryItem, listenMiniGameHistory } from '../../lib/store.ts';

interface AdminMiniGamesTabProps {
  mode: 'settings' | 'history';
  onShowToast: (msg: string) => void;
}

export const AdminMiniGamesTab: React.FC<AdminMiniGamesTabProps> = ({ mode, onShowToast }) => {
  const [history, setHistory] = useState<MiniGameHistoryItem[]>([]);
  const [spinCost, setSpinCost] = useState('20');
  const [jackpotPrize, setJackpotPrize] = useState('Blox Fruit VIP Source Code');
  const [isEnabled, setIsEnabled] = useState(true);

  useEffect(() => {
    const unsub = listenMiniGameHistory(setHistory);
    return () => unsub();
  }, []);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onShowToast('บันทึกการตั้งค่ามินิเกมเรียบร้อยแล้ว');
  };

  return (
    <div className="space-y-6 text-left animate-fade-in">
      <div className="bg-[#09090b] border border-white/10 p-5 rounded-2xl">
        <h3 className="font-heading text-xl font-bold text-white flex items-center gap-2">
          {mode === 'settings' ? (
            <>
              <Gamepad2 className="size-5 text-[#ff1e27]" />
              <span>จัดการมินิเกมและระบบสุ่ม (Mini-Games & Gacha Setup)</span>
            </>
          ) : (
            <>
              <History className="size-5 text-[#ff1e27]" />
              <span>ประวัติการเล่นมินิเกม (Mini-Game Play Logs)</span>
            </>
          )}
        </h3>
        <p className="text-xs text-white/50 mt-1">
          {mode === 'settings' 
            ? 'ตั้งค่าราคาการสุ่ม อัตราการออกรางวัล และของรางวัลแจ็กพอตในวงล้อหรือกล่องสุ่ม'
            : 'ตรวจสอบบันทึกการหมุนวงล้อ การเปิดกล่องสุ่ม และผู้ที่ได้รับรางวัล'}
        </p>
      </div>

      {mode === 'settings' ? (
        <form onSubmit={handleSaveSettings} className="bg-[#09090b] border border-white/10 p-5 sm:p-7 rounded-2xl shadow-xl space-y-5">
          <div className="flex items-center justify-between py-1">
            <span className="text-xs sm:text-sm font-semibold text-white/90">เปิดใช้งานมินิเกมหน้าร้าน</span>
            <button
              type="button"
              role="switch"
              aria-checked={isEnabled}
              onClick={() => setIsEnabled(!isEnabled)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                isEnabled ? 'bg-[#ff1e27]' : 'bg-white/20'
              }`}
            >
              <span
                className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  isEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/80">ราคาต่อการสุ่ม 1 ครั้ง (บาท)</label>
              <input
                type="number"
                value={spinCost}
                onChange={e => setSpinCost(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-xs text-white focus:outline-none focus:border-[#ff1e27]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-white/80">รางวัลใหญ่ (Jackpot)</label>
              <input
                type="text"
                value={jackpotPrize}
                onChange={e => setJackpotPrize(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-xs text-white focus:outline-none focus:border-[#ff1e27]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full h-11 rounded-xl btn-primary text-white text-xs sm:text-sm font-bold shadow-lg shadow-[#ff1e27]/30 transition-all cursor-pointer"
          >
            บันทึกการตั้งค่ามินิเกม
          </button>
        </form>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-[#09090b] p-5 shadow-xl space-y-3">
          <h4 className="text-sm font-bold text-white">บันทึกการเล่นล่าสุด ({history.length} รายการ)</h4>

          {history.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <Dices className="size-8 text-white/20 mx-auto" />
              <p className="text-xs text-white/40">ยังไม่มีประวัติการเล่นมินิเกม</p>
            </div>
          ) : (
            history.map(h => (
              <div key={h.id} className="p-3.5 rounded-xl border border-white/10 bg-white/[0.02] flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-white block">{h.userEmail}</span>
                  <span className="text-[11px] text-white/50">เกม: {h.gameType}</span>
                </div>
                <div className="text-right">
                  <span className="text-emerald-400 font-bold block">{h.rewardName}</span>
                  <span className="text-[10px] text-white/40">{h.rewardType}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
