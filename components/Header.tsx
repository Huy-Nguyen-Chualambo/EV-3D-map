'use client';

import React from 'react';
import { 
  Boxes, 
  Download, 
  HelpCircle, 
  Truck, 
  Activity,
  Layers
} from 'lucide-react';

interface HeaderProps {
  onOpenExportModal: () => void;
  onOpenHelpModal: () => void;
}

export default function Header({ onOpenExportModal, onOpenHelpModal }: HeaderProps) {
  return (
    <header 
      id="factory-header"
      className="h-14 border-b border-slate-700 bg-[#1e293b] flex items-center justify-between px-4 md:px-6 shrink-0 z-40 select-none text-slate-300 font-sans"
    >
      {/* Brand & Factory Title */}
      <div className="flex items-center gap-3 md:gap-4">
        <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center text-white font-bold text-xs shadow-sm">
          EV
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm md:text-base font-semibold tracking-tight text-white flex items-center gap-2">
              SMART FACTORY | DIGITAL TWIN
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/40 font-bold uppercase">
                v2.4 (1:1m)
              </span>
            </h1>
          </div>
          <p className="text-[10px] text-slate-400 hidden lg:block font-mono">
            AREA A (40×30m) ➔ AREA B (50×40m) ➔ AREA C (30×30m)
          </p>
        </div>
      </div>

      {/* High Density Status Telemetry */}
      <div className="hidden md:flex items-center gap-4 lg:gap-6 text-xs uppercase tracking-widest font-medium">
        <div className="flex items-center gap-2 text-slate-200">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          SYSTEM ONLINE
        </div>
        <div className="text-slate-400">
          SITE: NORTH SECTOR A-C
        </div>
        <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded bg-slate-900/80 border border-slate-700 text-[11px] font-mono">
          <span className="text-slate-400">AREA:</span>
          <span className="text-blue-400 font-bold">4,100 m²</span>
        </div>
        <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded bg-slate-900/80 border border-slate-700 text-[11px] font-mono">
          <Truck className="w-3 h-3 text-yellow-400" />
          <span className="text-slate-400">AMR:</span>
          <span className="text-yellow-400 font-bold">3 ACTIVE</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          id="header-help-btn"
          onClick={onOpenHelpModal}
          className="p-1.5 px-2.5 rounded bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors text-xs flex items-center gap-1.5 cursor-pointer"
          title="Hướng dẫn điều khiển 3D & phím tắt"
        >
          <HelpCircle className="w-4 h-4 text-slate-400" />
          <span className="hidden sm:inline text-[11px] font-mono">HELP</span>
        </button>

        <button
          id="header-export-btn"
          onClick={onOpenExportModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white border border-blue-500 shadow-sm transition-all cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="text-[11px] font-mono tracking-tight">EXPORT 3D (.OBJ / .USD)</span>
        </button>
      </div>
    </header>
  );
}
