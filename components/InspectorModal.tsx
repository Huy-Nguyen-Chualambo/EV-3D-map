'use client';

import React from 'react';
import { MachineEquipment, ZoneInfo, AMR_FLEET_DATA } from '@/lib/factoryData';
import { 
  X, 
  Cpu, 
  Zap, 
  Clock, 
  Layers, 
  CheckCircle, 
  Maximize2,
  Truck,
  BatteryCharging,
  Gauge
} from 'lucide-react';

interface InspectorModalProps {
  selectedEquipment: MachineEquipment | null;
  selectedZone: ZoneInfo | null;
  selectedAmr: typeof AMR_FLEET_DATA[0] | null;
  onClose: () => void;
}

export default function InspectorModal({
  selectedEquipment,
  selectedZone,
  selectedAmr,
  onClose,
}: InspectorModalProps) {
  if (!selectedEquipment && !selectedZone && !selectedAmr) return null;

  return (
    <div id="inspector-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="inspector-modal-content"
        className="relative w-full max-w-lg bg-[#1e293b] border border-slate-700 rounded-lg shadow-2xl overflow-hidden flex flex-col text-slate-300 font-sans"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700 bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded bg-blue-500/20 border border-blue-500/40 text-blue-400">
              {selectedEquipment ? (
                <Cpu className="w-4 h-4" />
              ) : selectedAmr ? (
                <Truck className="w-4 h-4 text-yellow-400" />
              ) : (
                <Layers className="w-4 h-4 text-emerald-400" />
              )}
            </div>
            <div>
              <span className="text-[9px] font-mono font-bold tracking-widest uppercase text-blue-400 block">
                {selectedEquipment ? `EQUIPMENT • ${selectedEquipment.type.toUpperCase()}` : selectedAmr ? 'AMR TELEMETRY • ROBOTICS' : 'ZONE INSPECTOR • ISO 1:1'}
              </span>
              <h3 className="text-sm font-bold text-white leading-tight font-mono">
                {selectedEquipment?.name || selectedAmr?.name || selectedZone?.name}
              </h3>
            </div>
          </div>
          <button
            id="close-inspector-btn"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 space-y-3 max-h-[75vh] overflow-y-auto">
          {/* Equipment Inspector */}
          {selectedEquipment && (
            <>
              {/* Status & Telemetry Row */}
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2 rounded bg-slate-900 border border-slate-700/80">
                  <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block mb-0.5">Status</span>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {selectedEquipment.status}
                  </div>
                </div>

                {selectedEquipment.cycleTime && (
                  <div className="p-2 rounded bg-slate-900 border border-slate-700/80">
                    <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block mb-0.5">Cycle Time</span>
                    <div className="flex items-center gap-1 text-xs font-mono font-bold text-yellow-400">
                      <Clock className="w-3 h-3" />
                      {selectedEquipment.cycleTime}
                    </div>
                  </div>
                )}

                {selectedEquipment.powerRating && (
                  <div className="p-2 rounded bg-slate-900 border border-slate-700/80">
                    <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block mb-0.5">Power Rating</span>
                    <div className="flex items-center gap-1 text-xs font-mono font-bold text-blue-400">
                      <Zap className="w-3 h-3" />
                      {selectedEquipment.powerRating}
                    </div>
                  </div>
                )}

                {selectedEquipment.capacity && (
                  <div className="p-2 rounded bg-slate-900 border border-slate-700/80">
                    <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block mb-0.5">Capacity</span>
                    <div className="text-xs font-mono font-bold text-purple-300 truncate">
                      {selectedEquipment.capacity}
                    </div>
                  </div>
                )}
              </div>

              {/* 1:1 Metric Dimension Box */}
              <div className="p-2.5 rounded bg-slate-900 border border-slate-700/80 space-y-1">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300 font-mono">
                  <span className="flex items-center gap-1 text-blue-400">
                    <Maximize2 className="w-3 h-3" />
                    DIMENSIONS (1:1m):
                  </span>
                  <span className="text-slate-200">
                    {selectedEquipment.dimensions[0]}m × {selectedEquipment.dimensions[2]}m × {selectedEquipment.dimensions[1]}m
                  </span>
                </div>
                <div className="text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-800">
                  Origin (X, Y, Z): [{selectedEquipment.position[0]}m, {selectedEquipment.position[1]}m, {selectedEquipment.position[2]}m]
                </div>
              </div>

              {/* Description */}
              <div className="text-[11px] text-slate-300 leading-relaxed bg-slate-900/60 p-2.5 rounded border border-slate-700/60">
                <span className="font-semibold text-white block mb-0.5 text-[10px] uppercase tracking-wider text-slate-400">Mô Tả Chức Năng:</span>
                {selectedEquipment.description}
              </div>

              {/* Technical Specifications Table */}
              {selectedEquipment.specs.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">
                    Technical Specifications
                  </span>
                  <div className="rounded border border-slate-700 divide-y divide-slate-800 bg-slate-900 overflow-hidden text-[11px] font-mono">
                    {selectedEquipment.specs.map((spec, i) => (
                      <div key={i} className="flex justify-between px-2.5 py-1.5">
                        <span className="text-slate-400">{spec.label}</span>
                        <span className="font-medium text-slate-100 text-right">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* AMR Inspector */}
          {selectedAmr && (
            <>
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2 rounded bg-slate-900 border border-slate-700/80">
                  <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block mb-0.5">Battery SOC</span>
                  <div className="flex items-center gap-1 text-xs font-bold text-emerald-400 font-mono">
                    <BatteryCharging className="w-3 h-3" />
                    {selectedAmr.battery}%
                  </div>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-700/80">
                  <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block mb-0.5">Speed</span>
                  <div className="flex items-center gap-1 text-xs font-mono font-bold text-blue-400">
                    <Gauge className="w-3 h-3" />
                    {selectedAmr.currentSpeed}
                  </div>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-700/80">
                  <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block mb-0.5">Payload</span>
                  <div className="text-xs font-mono font-medium text-yellow-400 truncate">
                    {selectedAmr.payload}
                  </div>
                </div>
              </div>

              <div className="p-2.5 bg-slate-900 rounded border border-slate-700/80 text-[11px]">
                <span className="font-semibold text-slate-300 block mb-0.5 font-mono text-[10px] text-yellow-400 uppercase tracking-wider">Trạng Thái Điều Phối:</span>
                <p className="text-slate-200">{selectedAmr.status}</p>
                <div className="mt-1.5 text-[10px] text-slate-400 font-mono pt-1.5 border-t border-slate-800">
                  Lộ trình: Bến Nhập ➔ Zone A ➔ Cửa X=40m ➔ Trạm Lắp Ráp B ➔ Bến Xuất C.
                </div>
              </div>
            </>
          )}

          {/* Zone Inspector */}
          {selectedZone && (
            <>
              <div className="p-2.5 rounded bg-slate-900 border border-slate-700/80">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1 font-mono">
                  <span>QUY MÔ MẶT BẰNG:</span>
                  <span className="text-blue-400">
                    {selectedZone.dimensions.length}m × {selectedZone.dimensions.width}m (H: {selectedZone.dimensions.height}m)
                  </span>
                </div>
                <div className="text-[10px] text-emerald-400 font-mono">
                  Tổng diện tích: {selectedZone.dimensions.length * selectedZone.dimensions.width} m² (Trần thép tiêu chuẩn)
                </div>
              </div>

              <div className="text-[11px] text-slate-300 bg-slate-900/60 p-2.5 rounded border border-slate-700/60 leading-relaxed">
                {selectedZone.description}
              </div>

              <div className="space-y-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">
                  Trang Bị &amp; Hạng Mục Chính
                </span>
                <ul className="space-y-1 text-[11px]">
                  {selectedZone.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2 text-slate-300">
                      <CheckCircle className="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-2.5 border-t border-slate-700 bg-slate-900/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-3 py-1 text-xs font-mono font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition-colors cursor-pointer"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}
