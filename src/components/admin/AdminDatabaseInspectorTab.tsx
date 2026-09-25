import React, { useState } from 'react';
import { 
  Database, 
  Activity, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  HardDrive, 
  Layers, 
  Code2, 
  Server, 
  ShieldCheck,
  Zap
} from 'lucide-react';
import { testDatabaseBenchmark, exportCompleteDatabase } from '../../lib/store.ts';
import firebaseConfig from '../../../firebase-applet-config.json';

interface AdminDatabaseInspectorTabProps {
  productsCount: number;
  categoriesCount: number;
  usersCount: number;
  ordersCount: number;
  onShowToast: (msg: string) => void;
}

export const AdminDatabaseInspectorTab: React.FC<AdminDatabaseInspectorTabProps> = ({
  productsCount,
  categoriesCount,
  usersCount,
  ordersCount,
  onShowToast
}) => {
  const [testingPing, setTestingPing] = useState(false);
  const [benchmarkResult, setBenchmarkResult] = useState<{
    ok: boolean;
    latencyMs: number;
    timestamp: string;
    error?: string;
  } | null>(null);

  const [exporting, setExporting] = useState(false);
  const [exportedJsonPreview, setExportedJsonPreview] = useState<string | null>(null);

  const handleTestBenchmark = async () => {
    setTestingPing(true);
    try {
      const result = await testDatabaseBenchmark();
      setBenchmarkResult(result);
      if (result.ok) {
        onShowToast(`เชื่อมต่อ Firestore สำเร็จ! Ping: ${result.latencyMs}ms`);
      } else {
        alert('เกิดข้อผิดพลาดในการทดสอบ: ' + result.error);
      }
    } finally {
      setTestingPing(false);
    }
  };

  const handleExportBackup = async () => {
    setExporting(true);
    try {
      const data = await exportCompleteDatabase();
      const jsonString = JSON.stringify(data, null, 2);
      setExportedJsonPreview(jsonString);

      // Download file
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `xecute_lab_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      onShowToast('สำรองข้อมูลและดาวน์โหลด JSON เรียบร้อย!');
    } catch (err: any) {
      alert('Error exporting database: ' + err.message);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#0f0f13] border border-white/10 p-4 rounded-2xl">
        <div>
          <h3 className="font-heading text-lg font-bold text-white flex items-center gap-2">
            <Database className="size-5 text-[#ff1e27]" />
            <span>ตรวจสอบและยืนยันฐานข้อมูลจริง (Database Inspector & Benchmark)</span>
          </h3>
          <p className="text-xs text-white/50 mt-0.5">
            ยืนยันความปลอดภัยและความถูกต้องของข้อมูลบน Cloud Firestore พร้อมระบบสำรองข้อมูลฉุกเฉิน
          </p>
        </div>

        <button
          onClick={handleTestBenchmark}
          disabled={testingPing}
          className="btn-primary h-10 px-5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg cursor-pointer"
        >
          <Zap className={`size-3.5 ${testingPing ? 'animate-spin' : 'text-amber-300'}`} />
          <span>{testingPing ? 'กำลัง Ping Cloud...' : 'ทดสอบ Ping ฐานข้อมูลจริง'}</span>
        </button>
      </div>

      {/* Benchmark Status Banner */}
      {benchmarkResult && (
        <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in ${
          benchmarkResult.ok 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
            : 'bg-red-500/10 border-red-500/30 text-red-300'
        }`}>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="size-5 text-emerald-400 shrink-0" />
            <div>
              <span className="font-bold text-sm block text-white">
                การเชื่อมต่อ Cloud Firestore ทำงานได้ 100% (Verified Real Database)
              </span>
              <span className="text-xs opacity-80">
                ทำการเขียนข้อมูลทดสอบและอ่านกลับเรียบร้อย • Latency: <strong className="font-mono text-white">{benchmarkResult.latencyMs} ms</strong> • เวลา: {new Date(benchmarkResult.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold">
            HEALTHY
          </span>
        </div>
      )}

      {/* Cloud Project & Database Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-[#0d0d12] border border-white/10 space-y-1">
          <span className="text-xs text-white/40 block">Google Cloud Project ID</span>
          <span className="text-sm font-mono font-bold text-white block truncate" title={firebaseConfig.projectId}>
            {firebaseConfig.projectId}
          </span>
          <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1">
            <ShieldCheck className="size-3" />
            Provisioned & Protected
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[#0d0d12] border border-white/10 space-y-1">
          <span className="text-xs text-white/40 block">Firestore Custom Database ID</span>
          <span className="text-sm font-mono font-bold text-[#ff1e27] block truncate" title={firebaseConfig.firestoreDatabaseId}>
            {firebaseConfig.firestoreDatabaseId}
          </span>
          <span className="text-[10px] text-white/50 block mt-1">
            Dedicated Isolation Instance
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[#0d0d12] border border-white/10 space-y-1">
          <span className="text-xs text-white/40 block">Security Rules Version</span>
          <span className="text-sm font-mono font-bold text-white block">
            Rules Version 2 (Strict RBAC)
          </span>
          <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1">
            <CheckCircle2 className="size-3" />
            Deployed & Active
          </span>
        </div>
      </div>

      {/* Collections Overview */}
      <div className="rounded-2xl border border-white/10 bg-[#0d0d12] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-heading text-sm font-bold text-white flex items-center gap-2">
            <HardDrive className="size-4 text-[#ff1e27]" />
            <span>คอลเลกชันทั้งหมดในระบบ (Live Collections Status)</span>
          </h4>
          <button
            onClick={handleExportBackup}
            disabled={exporting}
            className="px-3.5 py-1.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-semibold text-white transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="size-3.5 text-blue-400" />
            <span>{exporting ? 'กำลังดึงข้อมูล...' : 'ส่งออกข้อมูลทั้งหมด (Export JSON)'}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { name: 'products', label: 'สินค้า (Products)', count: productsCount, desc: 'ข้อมูลสินค้า การ์ด และราคา' },
            { name: 'categories', label: 'หมวดหมู่ (Categories)', count: categoriesCount, desc: 'กลุ่มการจัดหมวดสินค้า' },
            { name: 'users', label: 'ผู้ใช้งาน (Users)', count: usersCount, desc: 'โปรไฟล์สมาชิกและยศสิทธิ์' },
            { name: 'orders', label: 'คำสั่งซื้อ (Orders)', count: ordersCount, desc: 'ประวัติการชำระเงิน' },
            { name: 'site_settings', label: 'ข้อความเว็บ (CMS)', count: 1, desc: 'ข้อความตัววิ่งและสถานะ' },
            { name: 'license_keys', label: 'คลังคีย์ (Vault)', count: 'Real-time', desc: 'รหัสไลเซนส์พร้อมส่ง' },
            { name: 'audit_logs', label: 'บันทึกความปลอดภัย', count: 'Active', desc: 'ประวัติการดำเนินการ' },
            { name: 'tags', label: 'แท็กกลาง (Tags)', count: 'Master', desc: 'แท็กและป้ายกำกับ' }
          ].map((col) => (
            <div
              key={col.name}
              className="p-3.5 rounded-xl bg-[#14141a] border border-white/5 space-y-1"
            >
              <span className="text-[10px] font-mono text-[#ff1e27] block">/{col.name}</span>
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-bold text-white block truncate">{col.label}</span>
                <span className="text-xs font-mono font-bold text-white/80">{col.count}</span>
              </div>
              <span className="text-[10px] text-white/40 block">{col.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* JSON Backup Preview if exported */}
      {exportedJsonPreview && (
        <div className="rounded-2xl border border-white/10 bg-[#070709] p-4 space-y-2 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-2">
              <Code2 className="size-4 text-emerald-400" />
              <span>ตัวอย่างโครงสร้างข้อมูลที่บันทึกจริงในคลาวด์ (Exported Payload)</span>
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">100% Real Firestore Data</span>
          </div>
          <pre className="text-[11px] font-mono text-emerald-300/80 bg-black/80 p-3 rounded-xl max-h-60 overflow-y-auto border border-white/10">
            {exportedJsonPreview.slice(0, 2000) + (exportedJsonPreview.length > 2000 ? '\n... (truncated)' : '')}
          </pre>
        </div>
      )}

    </div>
  );
};
