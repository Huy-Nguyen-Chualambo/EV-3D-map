'use client';

import React from 'react';
import { X, MousePointer, ZoomIn, Ruler, Download, Eye } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HelpModal({ isOpen, onClose }: HelpModalProps) {
  if (!isOpen) return null;

  return (
    <div id="help-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="help-modal-content"
        className="relative w-full max-w-lg bg-[#1e293b] border border-slate-700 rounded-lg shadow-2xl overflow-hidden flex flex-col text-slate-300 font-sans"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700 bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/40">
              <Eye className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white leading-tight font-mono">
              USER GUIDE &amp; 3D NAVIGATION CONTROLS
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-2.5 max-h-[75vh] overflow-y-auto text-xs font-sans">
          <div className="space-y-2">
            <div className="flex items-start gap-2.5 p-2.5 rounded bg-slate-900 border border-slate-700/80">
              <MousePointer className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-bold text-white block mb-0.5 font-mono text-[11px]">Xoay &amp; Khám Phá 3D (Orbit / Rotate / Pan):</span>
                <span className="text-slate-300 text-[11px]">
                  Nhấp giữ chuột trái và kéo để xoay góc nhìn 360°. Nhấp giữ chuột phải hoặc giữ phím Shift để di chuyển (Pan) camera.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 rounded bg-slate-900 border border-slate-700/80">
              <ZoomIn className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-bold text-white block mb-0.5 font-mono text-[11px]">Thu Phóng Camera (Zoom):</span>
                <span className="text-slate-300 text-[11px]">
                  Cuộn con lăn chuột để zoom cận cảnh chi tiết từng trạm máy hàn robot, khuôn đúc Giga-press, hoặc dây chuyền lắp ráp chữ U.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 rounded bg-slate-900 border border-slate-700/80">
              <MousePointer className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-bold text-white block mb-0.5 font-mono text-[11px]">Tra Cứu Thông Số (Object Inspection):</span>
                <span className="text-slate-300 text-[11px]">
                  Nhấp chuột vào bất kỳ cỗ máy, kệ pallet, trạm QC, xe AMR hoặc xe điện trên sàn để mở bảng thông số kỹ thuật, công suất điện, và chu kỳ sản xuất.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 rounded bg-slate-900 border border-slate-700/80">
              <Ruler className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-bold text-white block mb-0.5 font-mono text-[11px]">Thước Đo 1:1 Mét Thực Tế:</span>
                <span className="text-slate-300 text-[11px]">
                  Bật công cụ &quot;Thước Đo 1:1&quot; ở góc trên bên phải, sau đó nhấp 2 điểm bất kỳ trên mặt bằng để đo khoảng cách chính xác theo mét.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 rounded bg-slate-900 border border-slate-700/80">
              <Download className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-bold text-white block mb-0.5 font-mono text-[11px]">Xuất File 3D (.OBJ, .USD, .GLTF, .SVG):</span>
                <span className="text-slate-300 text-[11px]">
                  Hỗ trợ tải mô hình 3D nguyên bản tỷ lệ 1:1 dùng trực tiếp cho Blender, Gazebo Simulator, NVIDIA Isaac Sim, Omniverse hoặc sơ đồ mặt bằng 2D CAD.
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 py-2.5 border-t border-slate-700 bg-slate-900/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-3 py-1 text-xs font-mono font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors cursor-pointer"
          >
            CONFIRM
          </button>
        </div>
      </div>
    </div>
  );
}
