'use client';

import React, { useState } from 'react';
import * as THREE from 'three';
import { exportToOBJ, exportToGLTF, exportToIsaacSimUSD, exportFloorPlanSVG } from '@/lib/exporters';
import { FactorySceneHandles } from '@/lib/threeFactoryScene';
import { 
  X, 
  Download, 
  Layers, 
  Box, 
  FileText, 
  Cpu, 
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  sceneHandle: FactorySceneHandles | null;
}

export default function ExportModal({ isOpen, onClose, sceneHandle }: ExportModalProps) {
  const [downloading, setDownloading] = useState<string | null>(null);

  if (!isOpen) return null;

  const triggerSuccessConfetti = () => {
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleExportOBJ = () => {
    if (!sceneHandle) return;
    setDownloading('obj');
    setTimeout(() => {
      exportToOBJ(sceneHandle.scene, 'EV_Factory_Layout_1to1.obj');
      setDownloading(null);
      triggerSuccessConfetti();
    }, 200);
  };

  const handleExportGLTF = (binary: boolean) => {
    if (!sceneHandle) return;
    setDownloading(binary ? 'glb' : 'gltf');
    setTimeout(() => {
      exportToGLTF(sceneHandle.scene, binary, binary ? 'EV_Factory_Layout_1to1.glb' : 'EV_Factory_Layout_1to1.gltf');
      setDownloading(null);
      triggerSuccessConfetti();
    }, 200);
  };

  const handleExportUSD = () => {
    setDownloading('usd');
    setTimeout(() => {
      exportToIsaacSimUSD('ev_factory_isaac_sim_1to1.py');
      setDownloading(null);
      triggerSuccessConfetti();
    }, 200);
  };

  const handleExportSVG = () => {
    setDownloading('svg');
    setTimeout(() => {
      exportFloorPlanSVG('EV_Factory_FloorPlan_CAD_1to1.svg');
      setDownloading(null);
      triggerSuccessConfetti();
    }, 200);
  };

  return (
    <div id="export-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="export-modal-content"
        className="relative w-full max-w-xl bg-[#1e293b] border border-slate-700 rounded-lg shadow-2xl overflow-hidden flex flex-col text-slate-300 font-sans"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700 bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded bg-blue-500/20 border border-blue-500/40 text-blue-400">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white leading-tight font-mono">
                EXPORT 3D DIGITAL TWIN &amp; CAD (1:1m METRIC)
              </h3>
              <p className="text-[10px] text-slate-400 font-mono">
                Blender • Isaac Sim • WebGL • Gazebo • ROS2 • CAD SVG
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-3 max-h-[75vh] overflow-y-auto">
          {/* Ratio & Units Notice */}
          <div className="flex items-start gap-2.5 p-2.5 rounded bg-blue-950/40 border border-blue-600/40 text-xs text-blue-300 font-mono">
            <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-[11px] leading-relaxed">
              <span className="font-bold text-white">ISO 1:1 METRIC SCALE:</span> Tất cả tọa độ (Kho A: 40x30m, Sản xuất B: 50x40m, Thành phẩm C: 30x30m) được trích xuất trực tiếp với 1 Unit = 1.000 Meter.
            </div>
          </div>

          {/* Export Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {/* 1. Wavefront OBJ */}
            <div className="p-3 rounded bg-slate-900 border border-slate-700 hover:border-blue-500 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-blue-400 flex items-center gap-1 font-mono">
                    <Box className="w-3.5 h-3.5" /> Wavefront 3D (.OBJ)
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold">
                    UNIVERSAL
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mb-2.5">
                  Tương thích Blender, Gazebo SDF, Maya, Unity, Unreal Engine &amp; 3ds Max.
                </p>
              </div>
              <button
                id="export-obj-btn"
                onClick={handleExportOBJ}
                disabled={downloading === 'obj'}
                className="w-full py-1.5 px-2.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-mono font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Download className="w-3 h-3" />
                {downloading === 'obj' ? 'EXTRACTING...' : 'DOWNLOAD .OBJ'}
              </button>
            </div>

            {/* 2. GLTF / GLB */}
            <div className="p-3 rounded bg-slate-900 border border-slate-700 hover:border-emerald-500 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 font-mono">
                    <Layers className="w-3.5 h-3.5" /> glTF 2.0 / GLB
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                    PBR MESH
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mb-2.5">
                  Chuẩn WebGL 3D, giữ nguyên vật liệu kim loại PBR, màu sắc phân khu.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  id="export-gltf-btn"
                  onClick={() => handleExportGLTF(false)}
                  disabled={downloading === 'gltf'}
                  className="py-1.5 px-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-mono font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer border border-slate-700"
                >
                  .GLTF (JSON)
                </button>
                <button
                  id="export-glb-btn"
                  onClick={() => handleExportGLTF(true)}
                  disabled={downloading === 'glb'}
                  className="py-1.5 px-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-mono font-bold transition-colors flex items-center justify-center gap-1 shadow-sm cursor-pointer"
                >
                  .GLB (BINARY)
                </button>
              </div>
            </div>

            {/* 3. USD / Isaac Sim Setup */}
            <div className="p-3 rounded bg-slate-900 border border-slate-700 hover:border-purple-500 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-purple-400 flex items-center gap-1 font-mono">
                    <Cpu className="w-3.5 h-3.5" /> Isaac Sim Script (.py)
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mb-2.5">
                  Python script tự động tạo stage USD, gán physics collider và AMR waypoints.
                </p>
              </div>
              <button
                id="export-usd-btn"
                onClick={handleExportUSD}
                disabled={downloading === 'usd'}
                className="w-full py-1.5 px-2.5 rounded bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-mono font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Download className="w-3 h-3" />
                {downloading === 'usd' ? 'GENERATING...' : 'DOWNLOAD SCRIPT (.PY)'}
              </button>
            </div>

            {/* 4. 2D CAD Blueprint SVG */}
            <div className="p-3 rounded bg-slate-900 border border-slate-700 hover:border-yellow-500 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-yellow-400 flex items-center gap-1 font-mono">
                    <FileText className="w-3.5 h-3.5" /> 2D CAD Layout (.SVG)
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mb-2.5">
                  Sơ đồ vector 2D với vạch kẻ kích thước mét, phân khu A/B/C và 5 trạm máy.
                </p>
              </div>
              <button
                id="export-svg-btn"
                onClick={handleExportSVG}
                disabled={downloading === 'svg'}
                className="w-full py-1.5 px-2.5 rounded bg-yellow-600 hover:bg-yellow-500 text-white text-[11px] font-mono font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Download className="w-3 h-3" />
                {downloading === 'svg' ? 'GENERATING CAD...' : 'DOWNLOAD 2D (.SVG)'}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-slate-700 bg-slate-900/80 flex items-center justify-between">
          <span className="text-[10px] text-slate-400 font-mono">
            SCALE: 1 UNIT = 1.000 METER (ISO SPEC)
          </span>
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
