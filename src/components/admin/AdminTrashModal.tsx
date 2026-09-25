import React, { useState, useEffect } from 'react';
import { Trash2, X, RefreshCw, AlertTriangle, Layers, Package, Check } from 'lucide-react';
import { TrashItem, listenTrash, emptyTrash } from '../../lib/store.ts';

interface AdminTrashModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export const AdminTrashModal: React.FC<AdminTrashModalProps> = ({
  isOpen,
  onClose,
  onShowToast
}) => {
  const [trashItems, setTrashItems] = useState<TrashItem[]>([]);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const unsub = listenTrash(setTrashItems);
      return () => unsub();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleEmptyTrash = async () => {
    if (confirm('คุณต้องการลบประวัติรายการในถังขยะทั้งหมดอย่างถาวรหรือไม่?')) {
      setClearing(true);
      try {
        await emptyTrash();
        onShowToast('ล้างถังขยะเรียบร้อยแล้ว');
      } finally {
        setClearing(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="max-w-md w-full rounded-2xl bg-[#09090b] border border-white/10 shadow-2xl overflow-hidden my-auto flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#0d0d12]">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30 flex items-center justify-center">
              <Trash2 className="size-5" />
            </div>
            <div>
              <h3 className="font-heading text-base font-bold text-white">ถังขยะ (Recycle Bin)</h3>
              <span className="text-[11px] text-white/50">{trashItems.length} รายการ</span>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="size-8 rounded-lg text-white/50 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* List Body */}
        <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
          {trashItems.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <Trash2 className="size-8 text-white/20 mx-auto" />
              <p className="text-xs text-white/40">ไม่มีรายการในถังขยะ</p>
            </div>
          ) : (
            trashItems.map((item) => (
              <div 
                key={item.id}
                className="p-3 rounded-xl border border-white/10 bg-white/[0.02] flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-white block">
                    {item.itemData?.name || item.itemData?.title || 'รายการที่ลบ'}
                  </span>
                  <span className="text-[10px] text-white/40">
                    จาก: {item.originalCollection}
                  </span>
                </div>
                <span className="text-[10px] text-red-400 bg-red-500/10 px-2 py-0.5 rounded">
                  อยู่ในถังขยะ
                </span>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-[#0d0d12] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs text-white/70 hover:text-white bg-white/5 cursor-pointer"
          >
            ปิด
          </button>
          {trashItems.length > 0 && (
            <button
              type="button"
              disabled={clearing}
              onClick={handleEmptyTrash}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
            >
              {clearing ? 'กำลังล้าง...' : 'ล้างถังขยะทั้งหมด'}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
