import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  ShieldCheck, 
  Crown, 
  KeyRound, 
  Coins, 
  Ban, 
  CheckCircle2, 
  Edit3, 
  X, 
  Check,
  Award,
  RefreshCw
} from 'lucide-react';
import { UserAccountItem } from '../../lib/store.ts';

interface AdminUsersTabProps {
  users: UserAccountItem[];
  onUpdateUser: (uid: string, data: Partial<UserAccountItem>) => Promise<void>;
  onRefreshUsers: () => void;
  isRefreshing: boolean;
}

const ROLES_INFO: Record<string, { label: string; desc: string; color: string }> = {
  owner: { label: 'Owner (เจ้าของระบบ)', desc: 'เข้าถึงได้ทุกส่วนของระบบ มีสิทธิ์ควบคุมและตั้งค่าหลังบ้านสูงสุด', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  admin: { label: 'Admin (ผู้ดูแลระบบ)', desc: 'จัดการสินค้า หมวดหมู่ คำสั่งซื้อ และดูแลผู้ใช้งาน', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  moderator: { label: 'Moderator (ผู้ตรวจสอบ)', desc: 'ตรวจสอบคำสั่งซื้อและดูแลความเรียบร้อยของหน้าเว็บ', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  vip: { label: 'VIP Member (สมาชิกระดับสูง)', desc: 'ได้รับส่วนลดพิเศษและเข้าถึงสคริปต์ระดับพรีเมียม', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  user: { label: 'Member (สมาชิกทั่วไป)', desc: 'สมาชิกทั่วไป สั่งซื้อและดาวน์โหลดสินค้า', color: 'bg-neutral-800 text-white/70 border-white/10' }
};

export const AdminUsersTab: React.FC<AdminUsersTabProps> = ({
  users,
  onUpdateUser,
  onRefreshUsers,
  isRefreshing
}) => {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccountItem | null>(null);

  // Form states for modal
  const [selectedRole, setSelectedRole] = useState<'owner' | 'admin' | 'moderator' | 'vip' | 'user'>('user');
  const [accountStatus, setAccountStatus] = useState<'active' | 'suspended' | 'banned'>('active');
  const [balance, setBalance] = useState('0');
  const [rankBadge, setRankBadge] = useState('');
  const [saving, setSaving] = useState(false);

  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      (u.email && u.email.toLowerCase().includes(search.toLowerCase())) ||
      (u.username && u.username.toLowerCase().includes(search.toLowerCase())) ||
      (u.displayName && u.displayName.toLowerCase().includes(search.toLowerCase())) ||
      (u.uid && u.uid.toLowerCase().includes(search.toLowerCase()));
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const openEditModal = (u: UserAccountItem) => {
    setEditingUser(u);
    setSelectedRole(u.role || 'user');
    setAccountStatus(u.status || 'active');
    setBalance(String(u.balance || 0));
    setRankBadge(u.rankBadge || '');
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setSaving(true);
    try {
      await onUpdateUser(editingUser.uid, {
        role: selectedRole,
        status: accountStatus,
        balance: Number(balance) || 0,
        rankBadge: rankBadge.trim() || undefined
      });
      setModalOpen(false);
    } catch (err: any) {
      alert('Error updating user permissions: ' + err.message);
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
            <Users className="size-5 text-[#ff1e27]" />
            <span>จัดการผู้ใช้งานและระบบมอบสิทธิ์/ยศ (Users & RBAC)</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#ff1e27]/15 border border-[#ff1e27]/30 text-white font-mono">
              {users.length} สมาชิก
            </span>
          </h3>
          <p className="text-xs text-white/50 mt-0.5">
            จัดการยศการเข้าถึง (Owner, Admin, Moderator, VIP, Member) และสถานะบัญชี
          </p>
        </div>

        <button
          onClick={onRefreshUsers}
          disabled={isRefreshing}
          className="h-10 px-4 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-semibold text-white transition-colors flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw className={`size-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>รีเฟรชข้อมูล</span>
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-[#0d0d11] p-3 rounded-xl border border-white/5">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาด้วยอีเมล ชื่อผู้ใช้ หรือ UID..."
            className="w-full bg-[#15151b] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:border-[#ff1e27] focus:outline-none"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="bg-[#15151b] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:border-[#ff1e27] focus:outline-none w-full sm:w-auto"
        >
          <option value="all">ทุกยศ / ทุกระดับ ({users.length})</option>
          <option value="owner">Owner (เจ้าของระบบ)</option>
          <option value="admin">Admin (ผู้ดูแลระบบ)</option>
          <option value="moderator">Moderator</option>
          <option value="vip">VIP Member</option>
          <option value="user">Member ทั่วไป</option>
        </select>
      </div>

      {/* Users Table */}
      {users.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-[#0a0a0e] p-8 text-center text-white/50 text-xs space-y-2">
          <p>ยังไม่มีข้อมูลผู้ใช้งานที่บันทึกในระบบ Firestore</p>
          <p className="text-[11px] text-white/30">เมื่อมีผู้ใช้งานสมัครสมาชิกหรือเข้าสู่ระบบ ข้อมูลจะปรากฏขึ้นที่นี่โดยอัตโนมัติ</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#0d0d11] p-8 text-center text-white/50 text-xs">
          ไม่พบผู้ใช้งานที่ตรงกับคำค้นหา
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#0d0d12]">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/5 text-white/60 border-b border-white/10 uppercase font-semibold">
              <tr>
                <th className="p-3.5">ผู้ใช้งาน</th>
                <th className="p-3.5">อีเมล & UID</th>
                <th className="p-3.5">ระดับสิทธิ์ (Role)</th>
                <th className="p-3.5">เครดิต (THB)</th>
                <th className="p-3.5">สถานะ</th>
                <th className="p-3.5 text-right">จัดการสิทธิ์</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.map((u) => {
                const roleConfig = ROLES_INFO[u.role || 'user'] || ROLES_INFO.user;
                return (
                  <tr key={u.uid} className="hover:bg-white/5 transition-colors">
                    <td className="p-3.5 flex items-center gap-3">
                      <div className="size-9 rounded-full bg-gradient-to-br from-red-600 to-neutral-800 flex items-center justify-center font-bold text-white uppercase text-xs shrink-0 border border-white/10">
                        {u.username ? u.username.slice(0, 2) : 'U'}
                      </div>
                      <div>
                        <span className="font-bold text-white block">
                          {u.displayName || u.username || 'Member'}
                        </span>
                        {u.rankBadge && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-semibold inline-block">
                            {u.rankBadge}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-3.5">
                      <span className="text-white/80 block font-mono">{u.email || '-'}</span>
                      <span className="text-[10px] text-white/40 font-mono">{u.uid.slice(0, 12)}...</span>
                    </td>

                    <td className="p-3.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${roleConfig.color}`}>
                        {u.role === 'owner' && <Crown className="size-3" />}
                        {u.role === 'admin' && <ShieldCheck className="size-3" />}
                        {u.role === 'vip' && <Award className="size-3" />}
                        <span>{u.role?.toUpperCase() || 'USER'}</span>
                      </span>
                    </td>

                    <td className="p-3.5 font-mono text-emerald-400 font-bold">
                      ฿{(u.balance || 0).toLocaleString()}
                    </td>

                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.status === 'banned' ? 'bg-red-600/30 text-red-400 border border-red-600/40' :
                        u.status === 'suspended' ? 'bg-amber-500/20 text-amber-300' :
                        'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        {u.status || 'active'}
                      </span>
                    </td>

                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => openEditModal(u)}
                        className="px-3 py-1 rounded-lg bg-[#ff1e27]/15 text-[#ff1e27] hover:bg-[#ff1e27] hover:text-white transition-colors text-xs font-semibold inline-flex items-center gap-1.5"
                      >
                        <Edit3 className="size-3" />
                        <span>แก้ไขยศ/สิทธิ์</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit User & Role Modal */}
      {modalOpen && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="max-w-md w-full rounded-2xl bg-[#0e0e12] border border-white/15 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="font-heading text-base font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="size-4 text-[#ff1e27]" />
                  <span>กำหนดระดับสิทธิ์และสถานะบัญชี</span>
                </h3>
                <p className="text-xs text-white/50">{editingUser.email}</p>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-white/40 hover:text-white">
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              
              {/* Role Selection */}
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">
                  เลือกตำแหน่งสิทธิ์ (Role Assignment)
                </label>
                <div className="space-y-2">
                  {(['owner', 'admin', 'moderator', 'vip', 'user'] as const).map((r) => {
                    const info = ROLES_INFO[r];
                    const isSelected = selectedRole === r;
                    return (
                      <div
                        key={r}
                        onClick={() => setSelectedRole(r)}
                        className={`p-2.5 rounded-xl border cursor-pointer transition-all text-xs flex items-center justify-between ${
                          isSelected 
                            ? 'bg-[#ff1e27]/15 border-[#ff1e27] text-white' 
                            : 'bg-[#15151b] border-white/5 text-white/70 hover:border-white/20'
                        }`}
                      >
                        <div>
                          <span className="font-bold block text-white">{info.label}</span>
                          <span className="text-[10px] text-white/50">{info.desc}</span>
                        </div>
                        {isSelected && <Check className="size-4 text-[#ff1e27] shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Account Status */}
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">
                  สถานะบัญชี
                </label>
                <select
                  value={accountStatus}
                  onChange={(e: any) => setAccountStatus(e.target.value)}
                  className="w-full bg-[#15151b] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:border-[#ff1e27] focus:outline-none"
                >
                  <option value="active">ใช้งานปกติ (Active)</option>
                  <option value="suspended">พักการใช้งานชั่วคราว (Suspended)</option>
                  <option value="banned">แบนถาวร (Banned)</option>
                </select>
              </div>

              {/* Balance Adjust */}
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">
                  ยอดเงินคงเหลือ / เครดิต (THB)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    value={balance}
                    onChange={(e) => setBalance(e.target.value)}
                    className="flex-1 bg-[#15151b] border border-white/15 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-[#ff1e27] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setBalance(String((Number(balance) || 0) + 100))}
                    className="px-2.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white/70 hover:text-white"
                  >
                    +100
                  </button>
                  <button
                    type="button"
                    onClick={() => setBalance(String((Number(balance) || 0) + 500))}
                    className="px-2.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white/70 hover:text-white"
                  >
                    +500
                  </button>
                </div>
              </div>

              {/* Custom Rank Badge */}
              <div>
                <label className="block text-xs font-semibold text-white/80 mb-1.5">
                  ป้ายยศพิเศษ (Custom Rank Badge)
                </label>
                <input
                  type="text"
                  value={rankBadge}
                  onChange={(e) => setRankBadge(e.target.value)}
                  placeholder="เช่น Senior Developer, VIP Master"
                  className="w-full bg-[#15151b] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:border-[#ff1e27] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-white/60 hover:text-white"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <Check className="size-3.5" />
                  <span>{saving ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
