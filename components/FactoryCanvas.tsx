'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { buildFactoryScene, FactorySceneHandles } from '@/lib/threeFactoryScene';
import { FACTORY_ZONES, FACTORY_EQUIPMENT_DATA, AMR_FLEET_DATA, MachineEquipment, ZoneInfo } from '@/lib/factoryData';
import { 
  Eye, 
  Layers, 
  Compass, 
  Maximize2, 
  Ruler, 
  Navigation, 
  Sparkles, 
  Truck, 
  Activity,
  Info,
  Sun,
  ShieldAlert,
  Download,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';

interface FactoryCanvasProps {
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
  isSimPlaying: boolean;
  lightingIntensity: number;
  onSelectEquipment: (equipment: MachineEquipment | null) => void;
  onSelectZone: (zone: ZoneInfo | null) => void;
  onSelectAmr: (amr: typeof AMR_FLEET_DATA[0] | null) => void;
  onOpenExportModal: () => void;
  sceneHandleRef: React.MutableRefObject<FactorySceneHandles | null>;
  onSceneReady?: (handle: FactorySceneHandles) => void;
}

export type CameraPreset = 'overview' | 'zone-a' | 'zone-b' | 'zone-c' | 'welding' | 'casting' | 'assembly' | 'topdown' | 'follow-amr';

export default function FactoryCanvas({
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
  isSimPlaying,
  lightingIntensity,
  onSelectEquipment,
  onSelectZone,
  onSelectAmr,
  onOpenExportModal,
  sceneHandleRef,
  onSceneReady,
}: FactoryCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeCameraPreset, setActiveCameraPreset] = useState<CameraPreset>('overview');
  const [followedAmrId, setFollowedAmrId] = useState<string | null>(null);
  const [hoveredInfo, setHoveredInfo] = useState<{ name: string; type: string; pos: { x: number; y: number } } | null>(null);
  
  // Measurement Tool State
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [measurePoints, setMeasurePoints] = useState<THREE.Vector3[]>([]);
  const [measuredDistance, setMeasuredDistance] = useState<number | null>(null);

  // References for Three.js internal objects
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const measureLineRef = useRef<THREE.Line | null>(null);
  const targetCamPos = useRef<THREE.Vector3 | null>(null);
  const targetLookAt = useRef<THREE.Vector3 | null>(null);

  // References for mutable simulation states in animation loop
  const isSimPlayingRef = useRef(isSimPlaying);
  const simSpeedRef = useRef(simSpeed);
  const followedAmrIdRef = useRef(followedAmrId);

  useEffect(() => {
    isSimPlayingRef.current = isSimPlaying;
  }, [isSimPlaying]);

  useEffect(() => {
    simSpeedRef.current = simSpeed;
  }, [simSpeed]);

  useEffect(() => {
    followedAmrIdRef.current = followedAmrId;
  }, [followedAmrId]);

  // Set camera viewpoint presets
  const setCameraView = useCallback((preset: CameraPreset, amrId?: string) => {
    setActiveCameraPreset(preset);
    if (preset === 'follow-amr') {
      setFollowedAmrId(amrId || 'amr-01');
      return;
    }
    setFollowedAmrId(null);

    if (!cameraRef.current || !controlsRef.current) return;

    let targetP = new THREE.Vector3(60, 45, 65);
    let targetL = new THREE.Vector3(60, 0, 0);

    switch (preset) {
      case 'overview':
        targetP = new THREE.Vector3(60, 50, 75);
        targetL = new THREE.Vector3(60, 0, 0);
        break;
      case 'zone-a':
        targetP = new THREE.Vector3(20, 20, 32);
        targetL = new THREE.Vector3(20, 3, 0);
        break;
      case 'zone-b':
        targetP = new THREE.Vector3(65, 26, 42);
        targetL = new THREE.Vector3(65, 4, 0);
        break;
      case 'zone-c':
        targetP = new THREE.Vector3(105, 20, 32);
        targetL = new THREE.Vector3(105, 2, 0);
        break;
      case 'casting':
        targetP = new THREE.Vector3(50, 10, 5);
        targetL = new THREE.Vector3(50, 3, -11);
        break;
      case 'welding':
        targetP = new THREE.Vector3(74, 8, 2);
        targetL = new THREE.Vector3(74, 2, -12);
        break;
      case 'assembly':
        targetP = new THREE.Vector3(66, 14, 28);
        targetL = new THREE.Vector3(66, 2, 10);
        break;
      case 'topdown':
        targetP = new THREE.Vector3(60, 95, 0.1);
        targetL = new THREE.Vector3(60, 0, 0);
        break;
    }

    targetCamPos.current = targetP;
    targetLookAt.current = targetL;
  }, []);

  // Main Three.js Scene Setup & Loop
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // 1. Scene & Engine
    const sceneHandle = buildFactoryScene();
    sceneHandleRef.current = sceneHandle;
    if (onSceneReady) {
      onSceneReady(sceneHandle);
    }

    // 2. Camera (Perspective with 1:1 metric scale)
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 500);
    camera.position.set(60, 50, 75);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    rendererRef.current = renderer;

    // 4. Orbit Controls
    const controls = new OrbitControls(camera, canvasRef.current);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.02; // Prevent going below floor
    controls.minDistance = 2;
    controls.maxDistance = 180;
    controls.target.set(60, 0, 0);
    controlsRef.current = controls;

    // Measurement Line Object in Scene
    const measureMat = new THREE.LineBasicMaterial({ color: '#f43f5e', linewidth: 3 });
    const measureGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 0)]);
    const measureLine = new THREE.Line(measureGeo, measureMat);
    measureLine.visible = false;
    sceneHandle.scene.add(measureLine);
    measureLineRef.current = measureLine;

    // Resize Handler
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(containerRef.current);

    // Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animateLoop = () => {
      animationFrameId = requestAnimationFrame(animateLoop);
      const delta = clock.getDelta();

      // Update simulation physics & movements
      if (isSimPlayingRef.current) {
        sceneHandle.animate(delta * simSpeedRef.current);
      }

      // Smooth camera interpolation to target preset
      if (targetCamPos.current && targetLookAt.current && !followedAmrIdRef.current) {
        camera.position.lerp(targetCamPos.current, 0.06);
        controls.target.lerp(targetLookAt.current, 0.06);

        if (camera.position.distanceTo(targetCamPos.current) < 0.2) {
          targetCamPos.current = null;
          targetLookAt.current = null;
        }
      }

      // Follow AMR camera mode
      if (followedAmrIdRef.current) {
        const amrPos = sceneHandle.getAmrPosition(followedAmrIdRef.current);
        if (amrPos) {
          const offset = new THREE.Vector3(0, 6, 8);
          controls.target.lerp(amrPos, 0.1);
          camera.position.lerp(amrPos.clone().add(offset), 0.1);
        }
      }

      controls.update();
      renderer.render(sceneHandle.scene, camera);
    };

    animateLoop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      controls.dispose();
      renderer.dispose();
      sceneHandle.dispose();
    };
  }, [sceneHandleRef, onSceneReady]);

  // Update Roof Mode
  useEffect(() => {
    if (sceneHandleRef.current) {
      sceneHandleRef.current.setRoofMode(roofMode);
    }
  }, [roofMode, sceneHandleRef]);

  // Update Visibility Layers
  useEffect(() => {
    if (sceneHandleRef.current) {
      sceneHandleRef.current.setAmrRoutesVisible(showAmrRoutes);
      sceneHandleRef.current.setLabelsVisible(showLabels);
      sceneHandleRef.current.setGridVisible(showGrid);
      sceneHandleRef.current.setSafetyZonesVisible(showSafetyZones);
      sceneHandleRef.current.setLightingIntensity(lightingIntensity);
    }
  }, [showAmrRoutes, showLabels, showGrid, showSafetyZones, lightingIntensity, sceneHandleRef]);

  // Handle Canvas Click & Hover Interactions
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !cameraRef.current || !sceneHandleRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), cameraRef.current);
    const intersects = raycaster.intersectObjects(sceneHandleRef.current.interactiveMeshes, false);

    if (intersects.length > 0) {
      const eqId = intersects[0].object.userData.equipmentId;
      const eq = FACTORY_EQUIPMENT_DATA.find(x => x.id === eqId);
      const amr = AMR_FLEET_DATA.find(x => x.id === eqId);
      if (eq) {
        setHoveredInfo({ name: eq.name, type: `Thiết bị (${eq.type})`, pos: { x: e.clientX, y: e.clientY } });
        return;
      } else if (amr) {
        setHoveredInfo({ name: amr.name, type: `Xe Tự Hành AMR (${amr.status})`, pos: { x: e.clientX, y: e.clientY } });
        return;
      }
    }
    setHoveredInfo(null);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !cameraRef.current || !sceneHandleRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), cameraRef.current);

    // Measurement Mode Handling
    if (isMeasuring) {
      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const intersectPoint = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, intersectPoint);
      if (intersectPoint) {
        if (measurePoints.length === 0 || measurePoints.length >= 2) {
          setMeasurePoints([intersectPoint]);
          setMeasuredDistance(null);
          if (measureLineRef.current) measureLineRef.current.visible = false;
        } else if (measurePoints.length === 1) {
          const p1 = measurePoints[0];
          const p2 = intersectPoint;
          setMeasurePoints([p1, p2]);
          const dist = p1.distanceTo(p2);
          setMeasuredDistance(Number(dist.toFixed(2)));

          if (measureLineRef.current) {
            measureLineRef.current.geometry.setFromPoints([p1, p2]);
            measureLineRef.current.visible = true;
          }
        }
      }
      return;
    }

    // Standard Selection Handling
    const intersects = raycaster.intersectObjects(sceneHandleRef.current.interactiveMeshes, false);
    if (intersects.length > 0) {
      const eqId = intersects[0].object.userData.equipmentId;
      const eq = FACTORY_EQUIPMENT_DATA.find(x => x.id === eqId);
      const amr = AMR_FLEET_DATA.find(x => x.id === eqId);

      if (eq) {
        onSelectEquipment(eq);
        onSelectAmr(null);
      } else if (amr) {
        onSelectAmr(amr);
        onSelectEquipment(null);
      }
    }
  };

  return (
    <div id="factory-3d-viewport" className="relative w-full h-full select-none overflow-hidden bg-slate-950">
      {/* Three.js Canvas */}
      <div ref={containerRef} className="w-full h-full">
        <canvas
          id="webgl-canvas"
          ref={canvasRef}
          onPointerMove={handlePointerMove}
          onPointerDown={handlePointerDown}
          className="w-full h-full block cursor-grab active:cursor-grabbing"
        />
      </div>

      {/* Floating Hover Card */}
      {hoveredInfo && (
        <div
          className="pointer-events-none fixed z-50 rounded-lg bg-slate-900/90 backdrop-blur-md px-3 py-2 text-xs shadow-xl border border-sky-500/40 text-slate-100 flex flex-col gap-0.5"
          style={{ left: `${hoveredInfo.pos.x + 16}px`, top: `${hoveredInfo.pos.y - 12}px` }}
        >
          <div className="font-bold text-sky-400">{hoveredInfo.name}</div>
          <div className="text-slate-400">{hoveredInfo.type}</div>
          <div className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Nhấp chuột để xem chi tiết thông số
          </div>
        </div>
      )}

      {/* Top Left: Quick Camera Presets Toolbar */}
      <div id="camera-presets-bar" className="absolute top-3 left-3 z-20 flex flex-wrap items-center gap-1 p-1 bg-[#1e293b]/90 backdrop-blur-md rounded border border-slate-700 shadow-xl max-w-[calc(100%-2rem)]">
        <span className="text-[10px] font-mono font-bold text-slate-400 px-1.5 flex items-center gap-1 uppercase tracking-wider">
          <Compass className="w-3 h-3 text-blue-400" />
          VIEW:
        </span>
        <button
          id="cam-btn-overview"
          onClick={() => setCameraView('overview')}
          className={`px-2 py-0.5 text-[10px] font-mono rounded transition-all font-semibold flex items-center gap-1 ${
            activeCameraPreset === 'overview'
              ? 'bg-blue-600 text-white font-bold'
              : 'text-slate-300 hover:bg-slate-700 hover:text-white'
          }`}
        >
          3D OVERVIEW
        </button>
        <button
          id="cam-btn-zone-a"
          onClick={() => setCameraView('zone-a')}
          className={`px-2 py-0.5 text-[10px] font-mono rounded transition-all font-semibold ${
            activeCameraPreset === 'zone-a'
              ? 'bg-blue-600 text-white font-bold'
              : 'text-slate-300 hover:bg-slate-700 hover:text-white'
          }`}
        >
          ZONE A (40x30m)
        </button>
        <button
          id="cam-btn-zone-b"
          onClick={() => setCameraView('zone-b')}
          className={`px-2 py-0.5 text-[10px] font-mono rounded transition-all font-semibold ${
            activeCameraPreset === 'zone-b'
              ? 'bg-yellow-600 text-white font-bold'
              : 'text-slate-300 hover:bg-slate-700 hover:text-white'
          }`}
        >
          ZONE B (50x40m)
        </button>
        <button
          id="cam-btn-zone-c"
          onClick={() => setCameraView('zone-c')}
          className={`px-2 py-0.5 text-[10px] font-mono rounded transition-all font-semibold ${
            activeCameraPreset === 'zone-c'
              ? 'bg-red-600 text-white font-bold'
              : 'text-slate-300 hover:bg-slate-700 hover:text-white'
          }`}
        >
          ZONE C (30x30m)
        </button>
        <button
          id="cam-btn-topdown"
          onClick={() => setCameraView('topdown')}
          className={`px-2 py-0.5 text-[10px] font-mono rounded transition-all font-semibold flex items-center gap-1 ${
            activeCameraPreset === 'topdown'
              ? 'bg-slate-700 text-white font-bold border border-slate-500'
              : 'text-slate-300 hover:bg-slate-700 hover:text-white'
          }`}
        >
          2D TOP-VIEW
        </button>
        <button
          id="cam-btn-follow-amr"
          onClick={() => setCameraView('follow-amr')}
          className={`px-2 py-0.5 text-[10px] font-mono rounded transition-all font-semibold flex items-center gap-1 ${
            activeCameraPreset === 'follow-amr'
              ? 'bg-cyan-600 text-white font-bold'
              : 'text-slate-300 hover:bg-slate-700 hover:text-white'
          }`}
        >
          <Truck className="w-3 h-3 text-yellow-400" />
          FOLLOW AMR
        </button>
      </div>

      {/* Top Right: Quick Action Buttons (Measure Tape, Export 3D, Reset View) */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5">
        {/* Metric Measurement Tool Toggle */}
        <button
          id="btn-measure-tool"
          onClick={() => {
            setIsMeasuring(!isMeasuring);
            setMeasurePoints([]);
            setMeasuredDistance(null);
            if (measureLineRef.current) measureLineRef.current.visible = false;
          }}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono font-semibold backdrop-blur-md border transition-all shadow-sm ${
            isMeasuring
              ? 'bg-red-600 border-red-400 text-white animate-pulse'
              : 'bg-[#1e293b]/90 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
          }`}
          title="Nhấp 2 điểm trên sàn để đo khoảng cách thực tế tỷ lệ 1:1"
        >
          <Ruler className="w-3.5 h-3.5" />
          {isMeasuring ? 'MEASURING (1:1m)' : 'MEASURE TAPE'}
        </button>

        {/* 3D Export Button */}
        <button
          id="btn-export-3d-model"
          onClick={onOpenExportModal}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono font-semibold bg-blue-600 hover:bg-blue-500 text-white border border-blue-500 shadow-sm transition-all cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          EXPORT 3D
        </button>
      </div>

      {/* Measurement Tool Active Banner */}
      {isMeasuring && (
        <div id="measure-banner" className="absolute top-14 right-3 z-20 p-2.5 bg-[#1e293b]/95 backdrop-blur-md rounded border border-red-500/50 shadow-2xl text-xs max-w-xs text-slate-200 font-sans">
          <div className="font-bold text-red-400 flex items-center gap-1.5 mb-1 text-[11px] font-mono uppercase tracking-wider">
            <Ruler className="w-3.5 h-3.5" /> 1:1 Metric Dimension Tool
          </div>
          <p className="text-[10px] text-slate-300 mb-1.5">
            Nhấp 2 điểm bất kỳ trên sàn nhà máy để đo khoảng cách theo đơn vị mét (m).
          </p>
          {measuredDistance !== null ? (
            <div className="p-1.5 bg-slate-900 border border-red-600/40 rounded text-center">
              <span className="text-slate-400 text-[9px] uppercase font-bold block font-mono">Khoảng cách đo được:</span>
              <span className="text-base font-mono font-extrabold text-red-400">{measuredDistance} mét</span>
            </div>
          ) : (
            <div className="text-[10px] text-yellow-400 font-mono italic">
              {measurePoints.length === 0 ? '👉 Nhấp điểm 1 (Bắt đầu)...' : '👉 Nhấp điểm 2 (Kết thúc)...'}
            </div>
          )}
        </div>
      )}

      {/* Bottom Right: High Density Floating Color Legend */}
      <div className="absolute bottom-3 right-3 z-20 hidden md:flex items-center gap-4 bg-[#1e293b]/90 backdrop-blur-md px-3 py-1.5 rounded border border-slate-700 text-slate-300 text-[10px] font-mono shadow-xl">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-blue-500 shrink-0" />
          <span>AREA A: WAREHOUSE</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-yellow-500 shrink-0" />
          <span>AREA B: PRODUCTION</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-red-500 shrink-0" />
          <span>AREA C: SHIPPING / QC</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
          <span>AMR ARTERY</span>
        </div>
      </div>

      {/* Bottom Left: Scale Bar & Dimension Indicators */}
      <div className="absolute bottom-3 left-3 z-20 flex items-center gap-3 bg-[#1e293b]/90 backdrop-blur-md px-3 py-1.5 rounded border border-slate-700 text-slate-300 text-[10px] font-mono shadow-xl">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 uppercase font-semibold">TỶ LỆ:</span>
          <span className="font-mono font-bold text-blue-400">1 unit = 1.0m</span>
        </div>
        <div className="h-3 w-px bg-slate-700" />
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 uppercase font-semibold">DIỆN TÍCH:</span>
          <span className="font-bold text-emerald-400">4,100 m² (120×40m)</span>
        </div>
        <div className="h-3 w-px bg-slate-700 hidden sm:block" />
        <div className="hidden sm:flex items-center gap-1.5">
          <div className="w-12 h-1 bg-gradient-to-r from-blue-500 via-yellow-400 to-red-500 rounded-full" />
          <span className="text-slate-400 font-mono text-[9px]">10m ISO</span>
        </div>
      </div>
    </div>
  );
}
