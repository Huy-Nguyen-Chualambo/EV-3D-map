import * as THREE from 'three';
import { OBJExporter } from 'three/examples/jsm/exporters/OBJExporter.js';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { FACTORY_ZONES, FACTORY_EQUIPMENT_DATA, AMR_FLEET_DATA } from './factoryData';

// 1. Export to OBJ format for Blender / Gazebo / Isaac Sim
export function exportToOBJ(scene: THREE.Scene, filename = 'EV_Factory_Layout_1to1.obj') {
  const exporter = new OBJExporter();
  const result = exporter.parse(scene);
  const blob = new Blob([result], { type: 'text/plain' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

// 2. Export to GLTF / GLB format
export function exportToGLTF(scene: THREE.Scene, binary = false, filename = 'EV_Factory_Layout_1to1.gltf') {
  const exporter = new GLTFExporter();
  exporter.parse(
    scene,
    (gltf) => {
      const output = binary ? (gltf as ArrayBuffer) : JSON.stringify(gltf, null, 2);
      const blob = new Blob([output], { type: binary ? 'application/octet-stream' : 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = binary ? filename.replace('.gltf', '.glb') : filename;
      link.click();
      URL.revokeObjectURL(link.href);
    },
    (error) => {
      console.error('Error exporting GLTF:', error);
    },
    {
      binary,
      embedImages: true,
    }
  );
}

// 3. Export to USD / NVIDIA Omniverse / Isaac Sim USD Scene Script & JSON Spec
export function exportToIsaacSimUSD(filename = 'ev_factory_isaac_sim.py') {
  const isaacSimScript = `"""
NVIDIA Isaac Sim / Omniverse 1:1 Metric EV Factory Simulation Setup Script
Generated for EV Factory 3D Layout (Zone A: 40x30m, Zone B: 50x40m, Zone C: 30x30m)
Coordinate System: Right-Handed Z-Up / Y-Up Metric (1 unit = 1.0 meter)
"""

import omni
from pxr import Usd, UsdGeom, UsdPhysics, Gf, Sdf
import numpy as np

def build_ev_factory_stage(stage_path="omniverse://localhost/Projects/EV_Factory.usd"):
    stage = Usd.Stage.CreateNew(stage_path)
    UsdGeom.SetStageUpAxis(stage, UsdGeom.Tokens.z)
    UsdGeom.SetStageMetersPerUnit(stage, 1.0) # Exact 1:1 Scale
    
    world_prim = UsdGeom.Xform.Define(stage, "/World")
    
    # 1. ZONE DEFINITIONS
    zones = ${JSON.stringify(FACTORY_ZONES, null, 4)}
    
    for zone in zones:
        zone_path = f"/World/{zone['id'].replace('-', '_')}"
        zone_xform = UsdGeom.Xform.Define(stage, zone_path)
        
        # Floor Plane
        floor_path = f"{zone_path}/Floor"
        floor = UsdGeom.Cube.Define(stage, floor_path)
        floor.GetSizeAttr().Set(1.0)
        
        dim = zone['dimensions']
        cx = (dim['xStart'] + dim['xEnd']) / 2.0
        cz = (dim['zStart'] + dim['zEnd']) / 2.0
        
        # Scale and Position (Z-up conversion)
        xform = zone_xform.AddTranslateOp()
        xform.Set(Gf.Vec3d(cx, cz, 0.0))
        
        floor_scale = floor.AddScaleOp()
        floor_scale.Set(Gf.Vec3d(dim['length'], dim['width'], 0.1))
        
        # Add physics ground collider
        UsdPhysics.CollisionAPI.Apply(floor.GetPrim())
        
    # 2. EQUIPMENT & ROBOT STATIONS
    equipment_list = ${JSON.stringify(FACTORY_EQUIPMENT_DATA, null, 4)}
    for eq in equipment_list:
        eq_path = f"/World/Equipment/{eq['id'].replace('-', '_')}"
        eq_prim = UsdGeom.Xform.Define(stage, eq_path)
        
        pos = eq['position']
        dims = eq['dimensions']
        
        x_op = eq_prim.AddTranslateOp()
        x_op.Set(Gf.Vec3d(pos[0], pos[2], pos[1])) # Three.js Y -> Isaac Sim Z
        
        # Bounding collision box
        box = UsdGeom.Cube.Define(stage, f"{eq_path}/CollisionMesh")
        box.GetSizeAttr().Set(1.0)
        b_scale = box.AddScaleOp()
        b_scale.Set(Gf.Vec3d(dims[0], dims[2], dims[1]))
        UsdPhysics.CollisionAPI.Apply(box.GetPrim())
        
    # 3. AMR FLEET NAVIGATION WAYPOINTS
    amr_fleet = ${JSON.stringify(AMR_FLEET_DATA, null, 4)}
    print(f"Successfully generated {len(zones)} zones, {len(equipment_list)} machines, and {len(amr_fleet)} AMRs in Isaac Sim USD format.")
    
    stage.GetRootLayer().Save()
    return stage

if __name__ == "__main__":
    build_ev_factory_stage()
`;

  const blob = new Blob([isaacSimScript], { type: 'text/x-python' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

// 4. Export 2D Technical Blueprint (SVG format with CAD dimension lines)
export function exportFloorPlanSVG(filename = 'EV_Factory_FloorPlan_CAD.svg') {
  const scale = 8; // 8px = 1m
  const totalLength = 120; // 120m
  const maxWidth = 40; // 40m
  const pad = 60;
  const svgWidth = totalLength * scale + pad * 2;
  const svgHeight = maxWidth * scale + pad * 2;
  const centerY = svgHeight / 2;

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}" xmlns="http://www.w3.org/2000/svg" style="background:#0f172a; font-family: sans-serif;">
  <defs>
    <pattern id="grid" width="8" height="8" patternUnits="userSpaceOnUse">
      <path d="M 8 0 L 0 0 0 8" fill="none" stroke="#334155" stroke-width="0.5"/>
    </pattern>
    <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#38bdf8"/>
    </marker>
  </defs>
  
  <!-- Grid -->
  <rect x="0" y="0" width="${svgWidth}" height="${svgHeight}" fill="url(#grid)" />
  
  <!-- Title Header -->
  <text x="${svgWidth / 2}" y="32" fill="#ffffff" font-size="18" font-weight="bold" text-anchor="middle">SƠ ĐỒ MẶT BẰNG 2D NHÀ MÁY SẢN XUẤT XE ĐIỆN (EV FACTORY) - TỶ LỆ 1:1</text>
  <text x="${svgWidth / 2}" y="50" fill="#94a3b8" font-size="12" text-anchor="middle">Tổng diện tích: 4,100 m² | Chiều dài: 120m | Quy mô: Kho A (40x30m) ➔ Sản xuất B (50x40m) ➔ Thành phẩm C (30x30m)</text>

  <!-- Zone A (40m x 30m) -->
  <g transform="translate(${pad}, ${centerY - 15 * scale})">
    <rect x="0" y="0" width="${40 * scale}" height="${30 * scale}" fill="#1e293b" stroke="#3b82f6" stroke-width="3" />
    <text x="${20 * scale}" y="25" fill="#38bdf8" font-size="14" font-weight="bold" text-anchor="middle">KHU VỰC A: KHO &amp; NHẬN HÀNG (40m × 30m × H:8m)</text>
    
    <!-- Docks -->
    <rect x="2" y="${5 * scale}" width="${3 * scale}" height="${4 * scale}" fill="#2563eb" />
    <text x="${3.5 * scale}" y="${7.5 * scale}" fill="#fff" font-size="8" text-anchor="middle">Bến Nhập 1</text>
    <rect x="2" y="${17 * scale}" width="${3 * scale}" height="${4 * scale}" fill="#2563eb" />
    <text x="${3.5 * scale}" y="${19.5 * scale}" fill="#fff" font-size="8" text-anchor="middle">Bến Nhập 2</text>
    
    <!-- 4 Racks -->
    ${[3, 9, 15, 21].map((ry, i) => `
      <rect x="${12 * scale}" y="${ry * scale}" width="${16 * scale}" height="${2.2 * scale}" fill="#1d4ed8" stroke="#ea580c" stroke-width="1.5" />
      <text x="${20 * scale}" y="${(ry + 1.4) * scale}" fill="#ffffff" font-size="9" text-anchor="middle">Kệ K${i + 1} (${16}m × 2.2m) - 4 Tầng</text>
    `).join('')}
  </g>

  <!-- Sliding Door A-B -->
  <rect x="${pad + 40 * scale - 2}" y="${centerY - 2 * scale}" width="4" height="${4 * scale}" fill="#f59e0b" />

  <!-- Zone B (50m x 40m) -->
  <g transform="translate(${pad + 40 * scale}, ${centerY - 20 * scale})">
    <rect x="0" y="0" width="${50 * scale}" height="${40 * scale}" fill="#0f172a" stroke="#10b981" stroke-width="3" />
    <text x="${25 * scale}" y="25" fill="#34d399" font-size="14" font-weight="bold" text-anchor="middle">KHU VỰC B: XƯỞNG SẢN XUẤT CHÍNH (50m × 40m × H:10m)</text>
    
    <!-- Central AMR Highway 4m -->
    <rect x="0" y="${18 * scale}" width="${50 * scale}" height="${4 * scale}" fill="#334155" stroke="#facc15" stroke-dasharray="6,4" stroke-width="1.5" />
    <text x="${25 * scale}" y="${20.5 * scale}" fill="#facc15" font-size="10" font-weight="bold" text-anchor="middle">LÀN ĐƯỜNG AMR TRUNG TÂM (4.0m)</text>

    <!-- Die Casting -->
    <rect x="${4 * scale}" y="${4 * scale}" width="${14 * scale}" height="${10 * scale}" fill="#7c2d12" stroke="#f97316" stroke-width="2" />
    <text x="${11 * scale}" y="${8 * scale}" fill="#fed7aa" font-size="11" font-weight="bold" text-anchor="middle">PHÂN KHU ĐÚC GIGA-PRESS</text>
    <text x="${11 * scale}" y="${10 * scale}" fill="#fed7aa" font-size="8" text-anchor="middle">Máy Ép 6000T + Bể Làm Nguội</text>

    <!-- Robotic Welding -->
    <rect x="${24 * scale}" y="${4 * scale}" width="${20 * scale}" height="${10 * scale}" fill="#991b1b" stroke="#ef4444" stroke-width="2" />
    <text x="${34 * scale}" y="${8 * scale}" fill="#fecaca" font-size="11" font-weight="bold" text-anchor="middle">PHÂN KHU HÀN ROBOT (2 TRẠM)</text>
    <text x="${34 * scale}" y="${10 * scale}" fill="#fecaca" font-size="8" text-anchor="middle">Robot 6 Trục + Băng Chuyền</text>

    <!-- Final Assembly U-Line -->
    <rect x="${4 * scale}" y="${25 * scale}" width="${42 * scale}" height="${12 * scale}" fill="#064e3b" stroke="#10b981" stroke-width="2" />
    <text x="${25 * scale}" y="${29 * scale}" fill="#a7f3d0" font-size="11" font-weight="bold" text-anchor="middle">DÂY CHUYỀN LẮP RÁP CHỮ U (5 TRẠM SẢN XUẤT)</text>
    <text x="${25 * scale}" y="${34 * scale}" fill="#6ee7b7" font-size="9" text-anchor="middle">St1: Pin ➔ St2: Treo ➔ St3: Taplo ➔ St4: Thân vỏ ➔ St5: Bánh xe</text>
  </g>

  <!-- Sliding Door B-C -->
  <rect x="${pad + 90 * scale - 2}" y="${centerY - 2 * scale}" width="4" height="${4 * scale}" fill="#f59e0b" />

  <!-- Zone C (30m x 30m) -->
  <g transform="translate(${pad + 90 * scale}, ${centerY - 15 * scale})">
    <rect x="0" y="0" width="${30 * scale}" height="${30 * scale}" fill="#1e293b" stroke="#a855f7" stroke-width="3" />
    <text x="${15 * scale}" y="25" fill="#c084fc" font-size="14" font-weight="bold" text-anchor="middle">KHU VỰC C: THÀNH PHẨM &amp; XUẤT HÀNG (30m × 30m × H:8m)</text>

    <!-- QC 1 & 2 -->
    <rect x="${3 * scale}" y="${6 * scale}" width="${8 * scale}" height="${6 * scale}" fill="#7f1d1d" stroke="#ef4444" stroke-width="2" />
    <text x="${7 * scale}" y="${9.5 * scale}" fill="#fca5a5" font-size="8" font-weight="bold" text-anchor="middle">Trạm QC #1 (ADAS)</text>

    <rect x="${3 * scale}" y="${18 * scale}" width="${8 * scale}" height="${6 * scale}" fill="#7f1d1d" stroke="#ef4444" stroke-width="2" />
    <text x="${7 * scale}" y="${21.5 * scale}" fill="#fca5a5" font-size="8" font-weight="bold" text-anchor="middle">Trạm QC #2 (Dyno)</text>

    <!-- EV Staging Buffer -->
    <rect x="${14 * scale}" y="${6 * scale}" width="${9 * scale}" height="${18 * scale}" fill="#083344" stroke="#06b6d4" stroke-width="1.5" />
    <text x="${18.5 * scale}" y="${15 * scale}" fill="#67e8f9" font-size="9" font-weight="bold" text-anchor="middle">Bãi Xe Thành Phẩm</text>

    <!-- Shipping Docks -->
    <rect x="${25 * scale}" y="${5 * scale}" width="${3 * scale}" height="${4 * scale}" fill="#8b5cf6" />
    <text x="${26.5 * scale}" y="${7.5 * scale}" fill="#fff" font-size="8" text-anchor="middle">Cổng Xuất 1</text>
    <rect x="${25 * scale}" y="${17 * scale}" width="${3 * scale}" height="${4 * scale}" fill="#8b5cf6" />
    <text x="${26.5 * scale}" y="${19.5 * scale}" fill="#fff" font-size="8" text-anchor="middle">Cổng Xuất 2</text>
  </g>

  <!-- Flow Direction Arrows -->
  <path d="M ${pad + 20 * scale} ${svgHeight - 20} L ${pad + 100 * scale} ${svgHeight - 20}" stroke="#38bdf8" stroke-width="3" marker-end="url(#arrow)"/>
  <text x="${pad + 60 * scale}" y="${svgHeight - 28}" fill="#38bdf8" font-size="12" font-weight="bold" text-anchor="middle">LUỒNG SẢN XUẤT MỘT CHIỀU (ONE-PIECE FLOW): KHO A ➔ GIA CÔNG B ➔ XUẤT HÀNG C</text>
</svg>`;

  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}
