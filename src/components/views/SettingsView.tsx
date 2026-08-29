import React, { useState } from 'react';
import {
  Building2,
  Upload,
  Download,
  RotateCcw,
  Sparkles,
  Check,
  AlertTriangle,
  FileText,
  ShieldCheck,
  Layers,
  Grid,
  Smartphone,
  ExternalLink
} from 'lucide-react';
import { usePG } from '../../context/PGContext';

export const SettingsView: React.FC = () => {
  const { theme, setTheme, resetSystem, importResidents, residents, stats } = usePG();
  const [importCsvText, setImportCsvText] = useState('');
  const [importNotice, setImportNotice] = useState<{ successCount: number; errors: string[] } | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Sample CSV format for user reference
  const sampleCsvFormat = `fullName,phone,aadhaarNumber,roomNumber,bedNumber,monthlyRent,amountPaid,emergencyName,emergencyPhone
Rahul Sharma,9876543210,123456789012,G01,1,7500,7500,Suresh Sharma,9876543211
Amit Kumar,9876543220,123456789013,101,1,8000,4000,Ramesh Kumar,9876543221`;

  const handleRunImport = () => {
    if (!importCsvText.trim()) return;

    const lines = importCsvText.trim().split('\n');
    if (lines.length < 2) {
      setImportNotice({ successCount: 0, errors: ['CSV string must have a header row and at least one data row.'] });
      return;
    }

    const headers = lines[0].split(',').map((h) => h.trim());
    const dataRows = lines.slice(1);

    const parsedItems = dataRows
      .map((rowStr) => {
        if (!rowStr.trim()) return null;
        const cols = rowStr.split(',').map((c) => c.trim());
        return {
          fullName: cols[0] || 'Unknown',
          phone: cols[1] || '0000000000',
          aadhaarNumber: cols[2] || '000000000000',
          roomNumber: cols[3] || 'G01',
          bedNumber: Number(cols[4]) || 1,
          monthlyRent: Number(cols[5]) || 7500,
          amountPaid: Number(cols[6]) || 0,
          emergencyName: cols[7] || 'N/A',
          emergencyPhone: cols[8] || 'N/A'
        };
      })
      .filter(Boolean) as Array<any>;

    const res = importResidents(parsedItems);
    setImportNotice(res);
    if (res.successCount > 0) {
      setImportCsvText('');
    }
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(residents, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `aarush_mens_luxury_pg_data_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#181919] tracking-tight mb-1">
          Settings & App Downloads
        </h1>
        <p className="text-xs text-[#747878]">
          Download Android APK / App, configure property info, import bulk resident records, export data or reset system.
        </p>
      </div>

      {/* ANDROID APP DOWNLOAD CARD */}
      <div className="p-6 rounded-xl border border-[#D4E6C2] bg-[#F2F7EE] space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#536347] text-white flex items-center justify-center font-bold">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-base text-[#121F09]">Download Android App (.apk)</h3>
            <p className="text-xs text-[#3C4B31] font-mono">Android App Binary & PWA Installer</p>
          </div>
        </div>

        <p className="text-xs text-[#3C4B31] leading-relaxed">
          Android users can download and install the Android app directly on their mobile phones. iPhone (iOS) users can open the website URL in Safari and tap <strong>Add to Home Screen</strong>.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <a
            href="https://github.com/valtooy/aarush-pg/releases/download/v1.0.0/aarush-pg.apk"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              // Direct browser download trigger
              alert('Downloading Aarush Mens Luxury PG Android APK package...');
            }}
            className="py-2.5 px-5 rounded-lg bg-[#181919] text-white text-xs font-semibold hover:bg-[#2D2D2D] transition-colors flex items-center gap-2 shadow-subtle"
          >
            <Download className="w-4 h-4 text-[#D4E6C2]" />
            <span>Download Android APK (Direct)</span>
          </a>

          <button
            onClick={() => {
              alert('To install on Android Chrome: Tap Chrome Menu (3 dots) -> Tap "Add to Home screen" or "Install App".');
            }}
            className="py-2.5 px-4 rounded-lg border border-[#536347] text-[#3C4B31] bg-white text-xs font-medium hover:bg-[#D4E6C2] transition-colors flex items-center gap-1.5"
          >
            <Smartphone className="w-4 h-4 text-[#536347]" />
            <span>Android Chrome Install Guide</span>
          </button>
        </div>
      </div>

      {/* Building Structure Summary Card */}
      <div className="p-6 rounded-xl border bg-white border-[#F5F2ED] space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#181919] text-white flex items-center justify-center font-bold">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-base text-[#181919]">Aarush Mens Luxury PG</h3>
            <p className="text-xs text-[#747878] font-mono">67 Rooms • 240 Beds • 8 Floors Total</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono pt-2">
          <div className="p-3 rounded-lg bg-[#FDFBF7] border border-[#F5F2ED]">
            <span className="text-[#747878] block">Total Bedrooms</span>
            <span className="font-bold text-sm text-[#181919]">67 Rooms</span>
          </div>
          <div className="p-3 rounded-lg bg-[#FDFBF7] border border-[#F5F2ED]">
            <span className="text-[#747878] block">Total Beds</span>
            <span className="font-bold text-sm text-[#181919]">240 Beds</span>
          </div>
          <div className="p-3 rounded-lg bg-[#FDFBF7] border border-[#F5F2ED]">
            <span className="text-[#747878] block">Ground Floor</span>
            <span className="font-bold text-sm text-[#181919]">Office + G01</span>
          </div>
          <div className="p-3 rounded-lg bg-[#FDFBF7] border border-[#F5F2ED]">
            <span className="text-[#747878] block">7th Floor</span>
            <span className="font-bold text-sm text-[#181919]">Dining Area</span>
          </div>
        </div>
      </div>

      {/* Import Residents Section */}
      <div className="p-6 rounded-xl border bg-white border-[#F5F2ED] space-y-4">
        <div className="flex items-center gap-2">
          <Upload className="w-5 h-5 text-[#536347]" />
          <h3 className="font-semibold text-base text-[#181919]">Import Residents (CSV Upload)</h3>
        </div>

        <p className="text-xs text-[#747878]">
          Paste CSV formatted data below to bulk import residents and automatically assign them to available empty beds.
        </p>

        {/* Sample Template Box */}
        <div className="p-3 rounded-lg bg-[#FDFBF7] border border-[#F5F2ED] font-mono text-[11px]">
          <div className="flex items-center justify-between mb-1.5 text-[#747878] text-[10px]">
            <span>SAMPLE CSV HEADER & FORMAT:</span>
            <button
              onClick={() => setImportCsvText(sampleCsvFormat)}
              className="text-[#536347] font-semibold underline hover:text-[#181919]"
            >
              Load Sample Data
            </button>
          </div>
          <pre className="overflow-x-auto text-[#181919] p-2 bg-white rounded border border-[#E4E2E2]">
            {sampleCsvFormat}
          </pre>
        </div>

        {/* CSV Textarea Input */}
        <div>
          <textarea
            rows={4}
            value={importCsvText}
            onChange={(e) => setImportCsvText(e.target.value)}
            placeholder="Paste your CSV rows here..."
            className="w-full p-3 text-xs font-mono rounded-lg border border-[#F5F2ED] bg-white focus:outline-none focus:border-[#181919]"
          />
        </div>

        <button
          onClick={handleRunImport}
          disabled={!importCsvText.trim()}
          className="py-2.5 px-5 rounded-lg bg-[#181919] text-white text-xs font-medium hover:bg-[#2D2D2D] disabled:opacity-40 transition-all flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          <span>Execute Bulk Import</span>
        </button>

        {/* Import Results Notification */}
        {importNotice && (
          <div className="p-3 rounded-lg bg-[#F2F7EE] border border-[#D4E6C2] text-xs space-y-1">
            <p className="font-semibold text-[#3C4B31]">
              Successfully imported {importNotice.successCount} resident(s).
            </p>
            {importNotice.errors.map((err, idx) => (
              <p key={idx} className="text-red-700 font-mono text-[11px]">
                • {err}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* Export & Data Backup */}
      <div className="p-6 rounded-xl border bg-white border-[#F5F2ED] space-y-4">
        <div className="flex items-center gap-2">
          <Download className="w-5 h-5 text-[#181919]" />
          <h3 className="font-semibold text-base text-[#181919]">Export Data</h3>
        </div>

        <p className="text-xs text-[#747878]">
          Download a full snapshot of active residents, room allocations, and payment records in JSON format.
        </p>

        <button
          onClick={handleExportJson}
          className="py-2.5 px-5 rounded-lg border border-[#F5F2ED] bg-white text-[#181919] text-xs font-medium hover:bg-[#F5F3F3] transition-colors flex items-center gap-2 shadow-subtle"
        >
          <FileText className="w-4 h-4 text-[#747878]" />
          <span>Download JSON Export</span>
        </button>
      </div>

      {/* System Reset Section */}
      <div className="p-6 rounded-xl border border-red-200 bg-red-50/40 space-y-4">
        <div className="flex items-center gap-2 text-red-900">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <h3 className="font-semibold text-base">Reset System State</h3>
        </div>

        <p className="text-xs text-red-800">
          Resetting the system will clear all created residents, payments, and activity logs. All 240 beds will return to empty status.
        </p>

        {showResetConfirm ? (
          <div className="p-4 rounded-lg bg-white border border-red-200 space-y-3">
            <p className="text-xs font-semibold text-red-900">
              Are you sure you want to clear all data? This action cannot be undone.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  resetSystem();
                  setShowResetConfirm(false);
                }}
                className="py-2 px-4 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors"
              >
                Yes, Reset All Data
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="py-2 px-4 rounded-lg border border-[#E4E2E2] bg-white text-xs text-[#181919] hover:bg-[#F5F3F3]"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowResetConfirm(true)}
            className="py-2.5 px-5 rounded-lg bg-red-600 text-white text-xs font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset to Initial Empty State (240 Beds)</span>
          </button>
        )}
      </div>
    </div>
  );
};
