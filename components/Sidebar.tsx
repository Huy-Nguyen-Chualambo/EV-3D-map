'use client';

import React, { useState } from 'react';
import { FACTORY_ZONES, FACTORY_EQUIPMENT_DATA, AMR_FLEET_DATA, ZoneInfo, MachineEquipment } from '@/lib/factoryData';
import { 
  Layers, 
  Truck, 
  Play, 
  Pause, 
  Sun, 
  Grid3X3, 
  ShieldCheck, 
  Compass, 
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Sliders,
  RefreshCw,
  Activity
} from 'lucide-react';

interface SidebarProps {
  roofMode: 'hidden' | 'truss' | 'solid' | 'xray';
  setRoofMode: (mode: 'hidden' | 'truss' | 'solid' | 'xray') => void;
  showAmrRoutes: boolean;
  setShowAmrRoutes: (v: boolean) => void;
  showLabels: boolean;
  setShowLabels: (v: boolean) => void;
  showGrid: boolean;
  setShowGrid: (v: boolean) => void;
  showSafetyZones: boolean;
  setShowSafetyZones: (v: boolean) => void;
  simSpeed: number;
  setSimSpeed: (s: number) => void;
  isSimPlaying: boolean;
  setIsSimPlaying: (p: boolean) => void;
  lightingIntensity: number;
  setLightingIntensity: (i: number) => void;
  onSelectEquipment: (equipment: MachineEquipment | null) => void;
  onSelectZone: (zone: ZoneInfo | null) => void;
  onSelectAmr: (amr: typeof AMR_FLEET_DATA[0] | null) => void;
  onFocusCamera: (preset: 'overview' | 'zone-a' | 'zone-b' | 'zone-c' | 'welding' | 'casting' | 'assembly' | 'topdown' | 'follow-amr', amrId?: string) => void;
}

export default function Sidebar({
  roofMode,
  setRoofMode,
  showAmrRoutes,
  setShowAmrRoutes,
  showLabels,
  setShowLabels,
  showGrid,
  setShowGrid,
  showSafetyZones,
  setShowSafetyZones,
  simSpeed,
  setSimSpeed,
  isSimPlaying,
  setIsSimPlaying,
  lightingIntensity,
  setLightingIntensity,
  onSelectEquipment,
  onSelectZone,
  onSelectAmr,
  onFocusCamera,
}: SidebarProps) {
  const [activeTab, setActiveTab] = useState<'zones' | 'layers' | 'amr'>('zones');
  const [expandedZone, setExpandedZone] = useState<string>('zone-b');

  return (
    <aside 
      id="factory-sidebar"
      className="w-72 md:w-80 h-full bg-[#1e293b] border-r border-slate-700 flex flex-col flex-shrink-0 text-slate-300 select-none z-30 font-sans shadow-xl"
    >
      {/* Sidebar Navigation Tabs */}
      <div className="flex border-b border-slate-700 bg-slate-900/60 p-1.5 gap-1 shrink-0">
        <button
          id="tab-btn-zones"
          onClick={() => setActiveTab('zones')}
          className={`flex-1 py-1.5 text-[11px] font-semibold rounded flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'zones'
              ? 'bg-blue-600 text-white shadow-sm font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          ZONES (A-C)
        </button>
        <button
          id="tab-btn-layers"
          onClick={() => setActiveTab('layers')}
          className={`flex-1 py-1.5 text-[11px] font-semibold rounded flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'layers'
              ? 'bg-blue-600 text-white shadow-sm font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          LAYERS
        </button>
        <button
          id="tab-btn-amr"
          onClick={() => setActiveTab('amr')}
          className={`flex-1 py-1.5 text-[11px] font-semibold rounded flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'amr'
              ? 'bg-blue-600 text-white shadow-sm font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Truck className="w-3.5 h-3.5" />
          AMR ({AMR_FLEET_DATA.length})
        </button>
      </div>

      {/* Main Tab Content Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5">
        {/* TAB 1: ZONES HIERARCHY (High Density Zone Inspector) */}
        {activeTab === 'zones' && (
          <section className="space-y-2.5">
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest flex items-center justify-between">
              <span>Zone Inspector</span>
              <span className="text-blue-400 font-mono">120m × 40m</span>
            </div>

            <div className="space-y-2">
              {FACTORY_ZONES.map((zone) => {
                const isExpanded = expandedZone === zone.id;
                const eqInZone = FACTORY_EQUIPMENT_DATA.filter(e => e.zoneId === zone.id);
                const borderAccent = zone.id === 'zone-a' ? 'border-blue-500' : zone.id === 'zone-b' ? 'border-yellow-500' : 'border-red-500';
                const occupancyValue = zone.id === 'zone-a' ? '78%' : zone.id === 'zone-b' ? '12/15 AMR' : '42 units/hr';
                const occupancyLabel = zone.id === 'zone-a' ? 'Occupancy' : zone.id === 'zone-b' ? 'Active AMR' : 'Throughput';
                const textAccent = zone.id === 'zone-a' ? 'text-blue-400' : zone.id === 'zone-b' ? 'text-yellow-400' : 'text-red-400';

                return (
                  <div
                    key={zone.id}
                    className={`p-3 bg-slate-800/50 border-l-4 ${borderAccent} rounded border border-slate-700/60 shadow-sm transition-all`}
                  >
                    {/* Zone Header */}
                    <div
                      onClick={() => setExpandedZone(isExpanded ? '' : zone.id)}
                      className="cursor-pointer flex items-center justify-between"
                    >
                      <div>
                        <div className="text-xs font-bold text-white tracking-wide">
                          {zone.code}: {zone.name.toUpperCase()}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                          {zone.dimensions.length}m x {zone.dimensions.width}m | H: {zone.dimensions.height}.0m
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                      </div>
                    </div>

                    <div className="flex justify-between mt-2 text-[10px] pt-1.5 border-t border-slate-700/50">
                      <span className="text-slate-400">{occupancyLabel}</span>
                      <span className={`${textAccent} font-mono font-bold`}>{occupancyValue}</span>
                    </div>

                    {/* Zone Expanded Content */}
                    {isExpanded && (
                      <div className="mt-2 pt-2 border-t border-slate-700/60 space-y-2 text-xs">
                        <p className="text-slate-300 text-[10px] leading-relaxed">
                          {zone.description}
                        </p>

                        {/* Sub-zones pills */}
                        {zone.subZones && (
                          <div className="space-y-1">
                            <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Phân Khu Chức Năng:</span>
                            <div className="grid grid-cols-1 gap-1">
                              {zone.subZones.map(sub => (
                                <div key={sub.id} className="p-1.5 rounded bg-slate-900/60 border border-slate-700/50 flex items-start gap-1.5">
                                  <div className="w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0" style={{ backgroundColor: sub.color }} />
                                  <div className="truncate">
                                    <div className="font-semibold text-slate-200 text-[10px] truncate">{sub.name}</div>
                                    <div className="text-[9px] text-slate-400 truncate">{sub.description}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Equipment list */}
                        <div className="space-y-1">
                          <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Thiết Bị &amp; Trạm Máy:</span>
                          <div className="space-y-1 max-h-32 overflow-y-auto">
                            {eqInZone.map((eq) => (
                              <button
                                key={eq.id}
                                onClick={() => onSelectEquipment(eq)}
                                className="w-full text-left p-1.5 rounded bg-slate-900/60 hover:bg-slate-700/60 border border-slate-700/50 transition-all flex items-center justify-between group cursor-pointer"
                              >
                                <div className="truncate pr-1">
                                  <span className="font-medium text-slate-200 text-[10px] group-hover:text-blue-300 block truncate">
                                    {eq.name}
                                  </span>
                                  <span className="text-[9px] text-slate-400 font-mono">
                                    {eq.dimensions[0]}m × {eq.dimensions[2]}m
                                  </span>
                                </div>
                                <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-blue-400 flex-shrink-0" />
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Focus Camera to this zone */}
                        <button
                          onClick={() => onFocusCamera(zone.id as any)}
                          className="w-full py-1 rounded bg-slate-700/70 hover:bg-blue-600 text-blue-300 hover:text-white font-semibold text-[10px] transition-colors flex items-center justify-center gap-1 cursor-pointer font-mono"
                        >
                          <Compass className="w-3 h-3" />
                          FOCUS CAMERA: {zone.code}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Active Operations Live Stream */}
            <div className="pt-2 border-t border-slate-700 space-y-1.5">
              <h2 className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Active Operations</h2>
              <div className="text-[10px] space-y-1 font-mono text-slate-400 bg-slate-900/60 p-2 rounded border border-slate-700/60">
                <div className="flex justify-between">
                  <span className="text-yellow-400 font-semibold">AMR-01 (Battery):</span>
                  <span>In Transit A ➔ B (Trạm 1)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-400 font-semibold">Robot-W1/W2:</span>
                  <span className="text-emerald-400">Welding Active (45s)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-400 font-semibold">QC-01/02:</span>
                  <span>Dyno &amp; ADAS Calibration</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* TAB 2: LAYERS & STRUCTURAL TOGGLES */}
        {activeTab === 'layers' && (
          <div className="space-y-3 text-xs">
            {/* Roof / Truss Structure Mode */}
            <div className="p-2.5 rounded bg-slate-800/60 border border-slate-700/60 space-y-2">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest block">Kết Cấu Mái (Truss Mode)</span>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'truss', label: 'Khung Giàn Thép' },
                  { id: 'hidden', label: 'Ẩn Mái (Top-View)' },
                  { id: 'solid', label: 'Mái Nguyên Khối' },
                  { id: 'xray', label: 'Nhìn Xuyên (X-Ray)' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setRoofMode(mode.id as any)}
                    className={`py-1.5 px-2 rounded text-[10px] font-semibold transition-all ${
                      roofMode === mode.id
                        ? 'bg-blue-600 text-white font-bold shadow-sm'
                        : 'bg-slate-900 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Visibility Toggles */}
            <div className="p-2.5 rounded bg-slate-800/60 border border-slate-700/60 space-y-2.5">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest block">Lớp Đối Tượng (Layers)</span>

              {/* AMR Routes */}
              <label className="flex items-center justify-between cursor-pointer text-[11px]">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-yellow-400" />
                  Lộ Trình Tuyến AMR
                </span>
                <input
                  type="checkbox"
                  checked={showAmrRoutes}
                  onChange={(e) => setShowAmrRoutes(e.target.checked)}
                  className="w-3.5 h-3.5 accent-blue-500 rounded cursor-pointer"
                />
              </label>

              {/* 3D Billboards / Labels */}
              <label className="flex items-center justify-between cursor-pointer text-[11px]">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-blue-400" />
                  Biển Báo Chỉ Dẫn 3D
                </span>
                <input
                  type="checkbox"
                  checked={showLabels}
                  onChange={(e) => setShowLabels(e.target.checked)}
                  className="w-3.5 h-3.5 accent-blue-500 rounded cursor-pointer"
                />
              </label>

              {/* 1:1 Metric Floor Grid */}
              <label className="flex items-center justify-between cursor-pointer text-[11px]">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <Grid3X3 className="w-3.5 h-3.5 text-emerald-400" />
                  Lưới Tọa Độ 1:1 Mét (1m Grid)
                </span>
                <input
                  type="checkbox"
                  checked={showGrid}
                  onChange={(e) => setShowGrid(e.target.checked)}
                  className="w-3.5 h-3.5 accent-blue-500 rounded cursor-pointer"
                />
              </label>

              {/* Safety Zones & Red Lines */}
              <label className="flex items-center justify-between cursor-pointer text-[11px]">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-red-400" />
                  Vùng An Toàn &amp; Vạch QC
                </span>
                <input
                  type="checkbox"
                  checked={showSafetyZones}
                  onChange={(e) => setShowSafetyZones(e.target.checked)}
                  className="w-3.5 h-3.5 accent-blue-500 rounded cursor-pointer"
                />
              </label>
            </div>

            {/* Industrial Lighting Intensity */}
            <div className="p-2.5 rounded bg-slate-800/60 border border-slate-700/60 space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-300 flex items-center gap-1.5 font-medium">
                  <Sun className="w-3.5 h-3.5 text-yellow-400" />
                  Đèn Chiếu Sáng High-Bay
                </span>
                <span className="font-mono text-blue-400 font-bold">{Math.round(lightingIntensity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="2.0"
                step="0.1"
                value={lightingIntensity}
                onChange={(e) => setLightingIntensity(parseFloat(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* TAB 3: AMR FLEET TELEMETRY */}
        {activeTab === 'amr' && (
          <div className="space-y-2.5 text-xs">
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-widest flex items-center justify-between">
              <span>Đội Xe Tự Hành AMR</span>
              <span className="text-emerald-400 font-mono font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                3 ONLINE
              </span>
            </div>

            {AMR_FLEET_DATA.map((amr) => (
              <div
                key={amr.id}
                onClick={() => onSelectAmr(amr)}
                className="p-2.5 rounded bg-slate-800/60 border border-slate-700 hover:border-blue-500 transition-all space-y-1.5 cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded bg-slate-900 text-yellow-400">
                      <Truck className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-100 group-hover:text-blue-300 block text-[11px] leading-tight font-mono">
                        {amr.name.split(' (')[0]}
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono">{amr.type}</span>
                    </div>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    {amr.battery}% BAT
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1.5 text-[10px] bg-slate-900/70 p-1.5 rounded border border-slate-700/50 font-mono">
                  <div>
                    <span className="text-slate-400 block text-[9px]">TẢI TRỌNG:</span>
                    <span className="font-semibold text-slate-200 truncate block">{amr.payload}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px]">VẬN TỐC:</span>
                    <span className="font-bold text-blue-400">{amr.currentSpeed}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-0.5">
                  <span className="text-[9px] text-slate-400 truncate max-w-[150px] font-mono">
                    📍 {amr.status}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onFocusCamera('follow-amr', amr.id);
                    }}
                    className="px-2 py-0.5 bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white rounded text-[9px] font-mono font-bold transition-all"
                  >
                    BÁM THEO
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Global Efficiency High Density Card */}
      <div className="p-3 bg-slate-900 border-t border-slate-700 shrink-0">
        <div className="text-[9px] uppercase text-slate-400 font-bold tracking-widest mb-1 flex items-center justify-between">
          <span>Global Efficiency</span>
          <span className="text-emerald-400 font-mono">ISO 1:1 METRIC</span>
        </div>
        <div className="text-2xl font-mono text-white font-bold flex items-baseline justify-between">
          <span>94.2<span className="text-xs text-slate-400 font-normal">%</span></span>
          <span className="text-xs text-slate-400 font-normal">CYCLE: 48s</span>
        </div>
      </div>

      {/* Sidebar Footer: Realtime Simulation Controls */}
      <div className="p-3 border-t border-slate-700 bg-slate-950/80 space-y-2 shrink-0">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-300 text-[11px] font-mono flex items-center gap-1.5">
            <RefreshCw className={`w-3 h-3 text-blue-400 ${isSimPlaying ? 'animate-spin' : ''}`} />
            SIM SPEED
          </span>
          <div className="flex items-center gap-1">
            {[1, 2, 4].map((speed) => (
              <button
                key={speed}
                onClick={() => setSimSpeed(speed)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-colors ${
                  simSpeed === speed
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>

        <button
          id="toggle-sim-play-btn"
          onClick={() => setIsSimPlaying(!isSimPlaying)}
          className={`w-full py-1.5 px-3 rounded text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm ${
            isSimPlaying
              ? 'bg-amber-600 hover:bg-amber-500 text-white'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white'
          }`}
        >
          {isSimPlaying ? (
            <>
              <Pause className="w-3.5 h-3.5" /> PAUSE SIMULATION
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5" /> RESUME SIMULATION
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
