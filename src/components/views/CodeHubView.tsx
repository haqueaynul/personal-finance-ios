import React, { useState } from 'react';
import { 
  FileCode2, 
  Copy, 
  Check, 
  Download, 
  Share2, 
  Terminal, 
  Database,
  ExternalLink,
  Smartphone
} from 'lucide-react';
import { GENERATED_SWIFT_FILES } from '../../data/generatedSwiftCode';
import { SwiftCodeFile, Transaction, Category, BudgetSettings } from '../../types';
import { sounds } from '../../utils/audio';

interface CodeHubViewProps {
  transactions: Transaction[];
  categories: Category[];
  settings: BudgetSettings;
}

export const CodeHubView: React.FC<CodeHubViewProps> = ({
  transactions,
  categories,
  settings
}) => {
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [hasCopied, setHasCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const currentFile: SwiftCodeFile = GENERATED_SWIFT_FILES[selectedFileIndex] || GENERATED_SWIFT_FILES[0];

  const handleCopy = async () => {
    sounds.playTap();
    try {
      await navigator.clipboard.writeText(currentFile.code);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
    } catch {
      // Fallback if clipboard API restricted in iframe
      const textArea = document.createElement('textarea');
      textArea.value = currentFile.code;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
    }
  };

  const handleDownloadFile = () => {
    sounds.playSuccess();
    const blob = new Blob([currentFile.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = currentFile.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2000);
  };

  const handleDownloadAllSwift = () => {
    sounds.playSuccess();
    const allCode = GENERATED_SWIFT_FILES.map(
      (f) => `// ==========================================\n// FILE: ${f.filename}\n// ${f.description}\n// ==========================================\n\n${f.code}\n\n`
    ).join('\n');

    const blob = new Blob([allCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'PersonalFinance_SwiftUI_Bundle.swift';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportDataJSON = () => {
    sounds.playSuccess();
    const exportData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      categories,
      transactions,
      settings
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `personal_finance_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar pb-20 px-4 pt-1 space-y-3.5">
      {/* iOS Header */}
      <div className="pt-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
          Source Exports
        </span>
        <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight flex items-center gap-2">
          Generated Codes
          <span className="bg-[#007AFF]/10 text-[#007AFF] text-xs font-bold px-2 py-0.5 rounded-full">
            SwiftUI
          </span>
        </h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Production-ready native iOS 18 / Xcode 16 codebase with automated budget alerts.
        </p>
        <div className="mt-2 bg-neutral-100/80 rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 text-[11px] text-neutral-600 font-mono">
          <Terminal size={12} className="text-[#007AFF] shrink-0" />
          <span>Saved in workspace: <span className="text-neutral-900 font-semibold">ios/</span> folder</span>
        </div>
      </div>

      {/* Quick Action Export Chips */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
        <button
          onClick={handleDownloadAllSwift}
          className="px-3 py-1.5 rounded-xl bg-[#007AFF] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs hover:bg-blue-600 transition shrink-0"
        >
          <Download size={13} />
          Download All .swift Files
        </button>

        <button
          onClick={handleExportDataJSON}
          className="px-3 py-1.5 rounded-xl bg-white border border-neutral-200 text-neutral-700 text-xs font-semibold flex items-center gap-1.5 hover:bg-neutral-50 transition shrink-0"
        >
          <Database size={13} />
          Export Data JSON
        </button>
      </div>

      {/* File Selector Tabs */}
      <div className="bg-neutral-200/70 p-1 rounded-2xl flex overflow-x-auto no-scrollbar gap-1">
        {GENERATED_SWIFT_FILES.map((file, idx) => {
          const isSelected = idx === selectedFileIndex;
          return (
            <button
              key={file.filename}
              onClick={() => {
                sounds.playTap();
                setSelectedFileIndex(idx);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              <FileCode2 size={13} className={isSelected ? 'text-[#007AFF]' : 'text-neutral-400'} />
              {file.filename}
            </button>
          );
        })}
      </div>

      {/* Active File Inspector Box */}
      <div className="bg-[#1C1C1E] text-neutral-100 rounded-2xl shadow-xl overflow-hidden border border-neutral-800 flex flex-col">
        {/* Editor Bar */}
        <div className="px-3.5 py-2.5 bg-[#2C2C2E] border-b border-neutral-700/60 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            </div>
            <span className="font-mono text-xs text-neutral-300 font-semibold truncate ml-1">
              {currentFile.filename}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopy}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-medium transition flex items-center gap-1"
            >
              {hasCopied ? (
                <>
                  <Check size={12} className="text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={12} />
                  <span>Copy</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownloadFile}
              className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] transition"
              title="Download File"
            >
              <Download size={13} />
            </button>
          </div>
        </div>

        {/* Code Content */}
        <div className="p-3.5 max-h-[380px] overflow-y-auto font-mono text-[11px] leading-relaxed select-text text-neutral-200 no-scrollbar">
          <pre className="whitespace-pre">
            <code>{currentFile.code}</code>
          </pre>
        </div>

        {/* File Description Footer */}
        <div className="px-3.5 py-2 bg-[#252528] border-t border-neutral-700/60 text-[11px] text-neutral-400 flex items-center justify-between">
          <span>{currentFile.description}</span>
          <span className="text-neutral-500">{currentFile.code.split('\n').length} lines</span>
        </div>
      </div>

      {/* Instructions on Xcode Integration */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-neutral-200/70 space-y-2">
        <h3 className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
          <Smartphone size={14} className="text-[#007AFF]" />
          How to Run on Your iPhone / Xcode
        </h3>
        <ol className="text-xs text-neutral-600 space-y-1.5 list-decimal list-inside leading-relaxed">
          <li>Open <strong>Xcode 16</strong> on macOS and create a new <strong>SwiftUI App</strong>.</li>
          <li>Copy or download the files above and add them to your Xcode project tree.</li>
          <li>In <strong>Signing & Capabilities</strong>, enable <em>Push Notifications</em> and <em>Background Modes</em>.</li>
          <li>Select your iPhone or simulator (e.g. iPhone 16 Pro) and hit <strong>Cmd + R</strong> to run.</li>
        </ol>
      </div>
    </div>
  );
};
