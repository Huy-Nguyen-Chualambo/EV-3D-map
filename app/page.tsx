'use client';

import React, { useState, useRef } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import FactoryCanvas, { CameraPreset } from '@/components/FactoryCanvas';
import InspectorModal from '@/components/InspectorModal';
import ExportModal from '@/components/ExportModal';
import HelpModal from '@/components/HelpModal';
import { FactorySceneHandles } from '@/lib/threeFactoryScene';
import { MachineEquipment, ZoneInfo, AMR_FLEET_DATA } from '@/lib/factoryData';

export default function FactoryPage() {
  // Layer & Display States
  const [roofMode, setRoofMode] = useState<'hidden' | 'truss' | 'solid' | 'xray'>('truss');
  const [showAmrRoutes, setShowAmrRoutes] = useState<boolean>(true);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showSafetyZones, setShowSafetyZones] = useState<boolean>(true);
  
  // Simulation States
  const [simSpeed, setSimSpeed] = useState<number>(1);
  const [isSimPlaying, setIsSimPlaying] = useState<boolean>(true);
  const [lightingIntensity, setLightingIntensity] = useState<number>(1.0);

  // Inspector & Modal States
  const [selectedEquipment, setSelectedEquipment] = useState<MachineEquipment | null>(null);
  const [selectedZone, setSelectedZone] = useState<ZoneInfo | null>(null);
  const [selectedAmr, setSelectedAmr] = useState<typeof AMR_FLEET_DATA[0] | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState<boolean>(false);

  // Reference to Three.js scene instance
  const sceneHandleRef = useRef<FactorySceneHandles | null>(null);
  const [activeSceneHandle, setActiveSceneHandle] = useState<FactorySceneHandles | null>(null);

  const handleSceneReady = React.useCallback((handle: FactorySceneHandles) => {
    sceneHandleRef.current = handle;
    setActiveSceneHandle(handle);
  }, []);

  const handleFocusCamera = (preset: CameraPreset) => {
    const camBtn = document.getElementById(`cam-btn-${preset}`);
    if (camBtn) {
      camBtn.click();
    }
  };

  return (
    <main id="ev-factory-app" className="w-screen h-screen flex flex-col bg-[#0f172a] text-slate-300 overflow-hidden font-sans">
      {/* Top Header */}
      <Header
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenHelpModal={() => setIsHelpModalOpen(true)}
      />

      {/* Main App Body (Sidebar + 3D Viewport) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Interactive Control Sidebar */}
        <Sidebar
          roofMode={roofMode}
          setRoofMode={setRoofMode}
          showAmrRoutes={showAmrRoutes}
          setShowAmrRoutes={setShowAmrRoutes}
          showLabels={showLabels}
          setShowLabels={setShowLabels}
          showGrid={showGrid}
          setShowGrid={setShowGrid}
          showSafetyZones={showSafetyZones}
          setShowSafetyZones={setShowSafetyZones}
          simSpeed={simSpeed}
          setSimSpeed={setSimSpeed}
          isSimPlaying={isSimPlaying}
          setIsSimPlaying={setIsSimPlaying}
          lightingIntensity={lightingIntensity}
          setLightingIntensity={setLightingIntensity}
          onSelectEquipment={(eq) => {
            setSelectedEquipment(eq);
            setSelectedZone(null);
            setSelectedAmr(null);
          }}
          onSelectZone={(zone) => {
            setSelectedZone(zone);
            setSelectedEquipment(null);
            setSelectedAmr(null);
          }}
          onSelectAmr={(amr) => {
            setSelectedAmr(amr);
            setSelectedEquipment(null);
            setSelectedZone(null);
          }}
          onFocusCamera={handleFocusCamera}
        />

        {/* Center/Right 3D Factory Canvas */}
        <div className="flex-1 h-full relative">
          <FactoryCanvas
            roofMode={roofMode}
            setRoofMode={setRoofMode}
            showAmrRoutes={showAmrRoutes}
            setShowAmrRoutes={setShowAmrRoutes}
            showLabels={showLabels}
            setShowLabels={setShowLabels}
            showGrid={showGrid}
            setShowGrid={setShowGrid}
            showSafetyZones={showSafetyZones}
            setShowSafetyZones={setShowSafetyZones}
            simSpeed={simSpeed}
            isSimPlaying={isSimPlaying}
            lightingIntensity={lightingIntensity}
            onSelectEquipment={(eq) => {
              setSelectedEquipment(eq);
              setSelectedZone(null);
              setSelectedAmr(null);
            }}
            onSelectZone={(zone) => {
              setSelectedZone(zone);
              setSelectedEquipment(null);
              setSelectedAmr(null);
            }}
            onSelectAmr={(amr) => {
              setSelectedAmr(amr);
              setSelectedEquipment(null);
              setSelectedZone(null);
            }}
            onOpenExportModal={() => setIsExportModalOpen(true)}
            sceneHandleRef={sceneHandleRef}
            onSceneReady={handleSceneReady}
          />
        </div>
      </div>

      {/* High Density Status Footer */}
      <footer className="h-7 md:h-8 bg-[#0f172a] border-t border-slate-800 px-4 flex items-center justify-between text-[10px] text-slate-400 font-mono select-none shrink-0">
        <div className="flex items-center gap-3">
          <span>LAT: 21.0285 | LONG: 105.8542</span>
          <span className="hidden sm:inline">| GRID-776-B</span>
          <span className="text-blue-400 font-bold hidden md:inline">| SCALE: 1 UNIT = 1.000 METER</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-emerald-400 font-semibold hidden sm:inline">REAL-TIME TELEMETRY CONNECTED</span>
          <span>DATA-RATE: 450 KB/S</span>
        </div>
      </footer>

      {/* Interactive Inspector Modal */}
      <InspectorModal
        selectedEquipment={selectedEquipment}
        selectedZone={selectedZone}
        selectedAmr={selectedAmr}
        onClose={() => {
          setSelectedEquipment(null);
          setSelectedZone(null);
          setSelectedAmr(null);
        }}
      />

      {/* 3D Model & Floor Plan Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        sceneHandle={activeSceneHandle}
      />

      {/* Navigation Help Modal */}
      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />
    </main>
  );
}
