import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, CheckCircle2, User, Clock, Loader2, X } from 'lucide-react';
import { SupportChatItem, listenSupportChats, updateChatStatus } from '../../lib/store.ts';

interface AdminChatTabProps {
  onShowToast: (msg: string) => void;
}

export const AdminChatTab: React.FC<AdminChatTabProps> = ({ onShowToast }) => {
  const [chats, setChats] = useState<SupportChatItem[]>([]);
  const [selectedChat, setSelectedChat] = useState<SupportChatItem | null>(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    const unsub = listenSupportChats(setChats);
    return () => unsub();
  }, []);

  const handleResolve = async (id: string) => {
    await updateChatStatus(id, 'resolved');
    onShowToast('ปิดงานการสนทนานี้แล้ว');
    setSelectedChat(null);
  };

  return (
    <div className="space-y-6 text-left animate-fade-in">
      <div className="bg-[#09090b] border border-white/10 p-5 rounded-2xl">
        <h3 className="font-heading text-xl font-bold text-white flex items-center gap-2">
          <MessageCircle className="size-5 text-[#ff1e27]" />
          <span>จัดการแชทและบริการลูกค้า (Live Support & Chat)</span>
        </h3>
        <p className="text-xs text-white/50 mt-1">
          ระบบจัดการข้อความสนทนา ตอบกลับคำถามและแก้ไขปัญหาให้ลูกค้าแบบเรียลไทม์
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#09090b] p-5 shadow-xl space-y-3">
        <h4 className="text-sm font-bold text-white">ห้องสนทนา ({chats.length})</h4>

        {chats.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <MessageCircle className="size-8 text-white/20 mx-auto" />
            <p className="text-xs text-white/40">ขณะนี้ไม่มีข้อความแชทที่รอดำเนินการ</p>
          </div>
        ) : (
          chats.map(c => (
            <div key={c.id} className="p-4 rounded-xl border border-white/10 bg-white/[0.02] flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white">{c.userName || c.userEmail}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    c.status === 'open' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-white/50'
                  }`}>
                    {c.status}
                  </span>
                </div>
                <p className="text-xs text-white/70">ข้อความล่าสุด: "{c.lastMessage}"</p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedChat(c)}
                className="btn-primary px-3 py-1.5 rounded-lg text-white text-xs font-bold"
              >
                เปิดแชท
              </button>
            </div>
          ))
        )}
      </div>

      {selectedChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="max-w-md w-full rounded-2xl bg-[#0e0e14] border border-white/15 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h4 className="font-bold text-white text-sm">สนทนากับ: {selectedChat.userName || selectedChat.userEmail}</h4>
              <button onClick={() => setSelectedChat(null)} className="text-white/40 hover:text-white cursor-pointer">
                <X className="size-4" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white/80 space-y-1">
              <span className="text-[10px] text-white/40 block">ข้อความจากลูกค้า:</span>
              <p>{selectedChat.lastMessage}</p>
            </div>

            <div className="space-y-2">
              <textarea
                rows={3}
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder="พิมพ์ข้อความตอบกลับ..."
                className="w-full p-2.5 rounded-xl bg-black/60 border border-white/15 text-xs text-white focus:outline-none focus:border-[#ff1e27]"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => handleResolve(selectedChat.id)}
                className="px-3 py-2 rounded-xl bg-emerald-600/20 text-emerald-300 text-xs font-semibold cursor-pointer"
              >
                ทำเครื่องหมายเสร็จสิ้น
              </button>
              <button
                type="button"
                onClick={() => {
                  onShowToast('ส่งข้อความตอบกลับเรียบร้อย');
                  setSelectedChat(null);
                }}
                className="btn-primary px-4 py-2 rounded-xl text-white text-xs font-bold"
              >
                ส่งข้อความ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
