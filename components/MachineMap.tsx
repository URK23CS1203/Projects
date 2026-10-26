import React, { useState, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Machine, MachineStatus, MachineType, CHC, StubbleHotspot } from '../types';
import {
  Layers,
  Flame,
  Building2,
  Tractor,
  Maximize2,
  Minimize2,
  Zap,
  Info,
  Map as MapIcon,
  Satellite,
  Compass,
} from 'lucide-react';

interface MachineMapProps {
  machines: Machine[];
  chcs: CHC[];
  hotspots: StubbleHotspot[];
  selectedMachine: Machine | null;
  onSelectMachine: (machine: Machine) => void;
  onDispatchHotspot: (hotspotId: string) => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

// Controller for invalidateSize and flyTo
const MapController: React.FC<{
  center: [number, number];
  zoom: number;
  isExpanded?: boolean;
}> = ({ center, zoom, isExpanded }) => {
  const map = useMap();

  useEffect(() => {
    // Invalidate size on initial mount and whenever container resizes
    map.invalidateSize();
    const t1 = setTimeout(() => map.invalidateSize(), 150);
    const t2 = setTimeout(() => map.invalidateSize(), 500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [map, isExpanded]);

  useEffect(() => {
    map.flyTo(center, zoom, { duration: 0.8 });
  }, [center[0], center[1], zoom, map]);

  return null;
};

// Create custom leaflet DivIcons with crisp SVG rendering
const createMachineIcon = (status: MachineStatus, isSelected: boolean) => {
  const color =
    status === MachineStatus.InUse
      ? '#059669' // emerald-600
      : status === MachineStatus.Idle
      ? '#d97706' // amber-600
      : '#e11d48'; // rose-600

  const ringStyle = isSelected
    ? 'stroke="#0f172a" stroke-width="3" stroke-dasharray="2,2"'
    : 'stroke="white" stroke-width="2"';

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="${isSelected ? '34' : '26'}" height="${isSelected ? '34' : '26'}">
      <circle cx="16" cy="16" r="${isSelected ? '14' : '11'}" fill="${color}" ${ringStyle} />
      <path d="M11 17l2-5h6l2 5M10 20a2 2 0 104 0 2 2 0 00-4 0zm8 0a2 2 0 104 0 2 2 0 00-4 0z" fill="none" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;

  return L.divIcon({
    html: svg,
    className: 'custom-leaflet-machine',
    iconSize: isSelected ? [34, 34] : [26, 26],
    iconAnchor: isSelected ? [17, 17] : [13, 13],
    popupAnchor: [0, -14],
  });
};

const createHotspotIcon = (confidence: string) => {
  const svg = `
    <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
      <span style="position: absolute; width: 28px; height: 28px; border-radius: 50%; background: rgba(225, 29, 72, 0.4); animation: ping 1.4s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="#e11d48" stroke="#ffffff" stroke-width="1.5">
        <path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 3z" />
      </svg>
    </div>`;

  return L.divIcon({
    html: svg,
    className: 'custom-leaflet-fire',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

const createChcIcon = () => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="28" height="28">
      <rect x="3" y="3" width="26" height="26" rx="6" fill="#1e293b" stroke="white" stroke-width="2"/>
      <path d="M9 13h14M9 18h14M16 8v16" stroke="#38bdf8" stroke-width="2" stroke-linecap="round"/>
    </svg>`;

  return L.divIcon({
    html: svg,
    className: 'custom-leaflet-chc',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
};

const chcIcon = createChcIcon();

const MachineMap: React.FC<MachineMapProps> = ({
  machines,
  chcs,
  hotspots,
  selectedMachine,
  onSelectMachine,
  onDispatchHotspot,
  isExpanded = false,
  onToggleExpand,
}) => {
  const [mapCenter, setMapCenter] = useState<[number, number]>([30.15, 76.45]);
  const [zoomLevel, setZoomLevel] = useState<number>(7);

  // Map Tile Style: 'street' | 'satellite'
  const [mapStyle, setMapStyle] = useState<'street' | 'satellite'>('street');

  // Layer filters
  const [showMachines, setShowMachines] = useState(true);
  const [showHotspots, setShowHotspots] = useState(true);
  const [showChcs, setShowChcs] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'All' | MachineStatus>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');

  // Filtered machines
  const filteredMachines = useMemo(() => {
    return machines.filter(m => {
      if (statusFilter !== 'All' && m.status !== statusFilter) return false;
      if (typeFilter !== 'All' && m.type !== typeFilter) return false;
      return true;
    });
  }, [machines, statusFilter, typeFilter]);

  // When selected machine changes, focus on it
  useEffect(() => {
    if (selectedMachine) {
      setMapCenter([selectedMachine.location.lat, selectedMachine.location.lng]);
      setZoomLevel(12);
    }
  }, [selectedMachine]);

  // Regions preset
  const handleRegionJump = (region: 'all' | 'punjab' | 'haryana' | 'up') => {
    switch (region) {
      case 'all':
        setMapCenter([30.0, 76.5]);
        setZoomLevel(7);
        break;
      case 'punjab':
        setMapCenter([30.5, 75.8]);
        setZoomLevel(9);
        break;
      case 'haryana':
        setMapCenter([29.7, 76.7]);
        setZoomLevel(9);
        break;
      case 'up':
        setMapCenter([28.9, 77.7]);
        setZoomLevel(9);
        break;
    }
  };

  return (
    <div
      className="relative w-full rounded-xl overflow-hidden border border-slate-200 shadow-inner flex flex-col"
      style={{
        height: isExpanded ? '78vh' : '560px',
        minHeight: '520px',
      }}
    >
      {/* Top Map Toolbar Overlay */}
      <div className="absolute top-3 left-3 right-3 z-[400] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Left Filter Island (pointer-events-auto) */}
        <div className="pointer-events-auto bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 shadow-md flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1 border-r border-slate-200 pr-2">
            <button
              onClick={() => setStatusFilter('All')}
              className={`px-2 py-1 rounded font-medium transition-colors ${
                statusFilter === 'All'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({machines.length})
            </button>
            <button
              onClick={() => setStatusFilter(MachineStatus.InUse)}
              className={`px-2 py-1 rounded font-medium transition-colors ${
                statusFilter === MachineStatus.InUse
                  ? 'bg-emerald-600 text-white'
                  : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              In Use ({machines.filter(m => m.status === MachineStatus.InUse).length})
            </button>
            <button
              onClick={() => setStatusFilter(MachineStatus.Idle)}
              className={`px-2 py-1 rounded font-medium transition-colors ${
                statusFilter === MachineStatus.Idle
                  ? 'bg-amber-600 text-white'
                  : 'text-amber-700 hover:bg-amber-50'
              }`}
            >
              Standby ({machines.filter(m => m.status === MachineStatus.Idle).length})
            </button>
          </div>

          {/* Machine Type Filter */}
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="bg-slate-100 border-0 rounded px-2 py-1 text-xs text-slate-800 font-medium focus:ring-1 focus:ring-slate-900"
          >
            <option value="All">All CRM Types</option>
            {Object.values(MachineType).map(t => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Right Layer & Region Quick Toggle (pointer-events-auto) */}
        <div className="pointer-events-auto bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 shadow-md flex items-center gap-2.5 text-xs">
          {/* Tile Layer Switcher */}
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
            <button
              onClick={() => setMapStyle('street')}
              className={`flex items-center gap-1 px-2 py-1 rounded font-medium text-[11px] transition-colors ${
                mapStyle === 'street'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Standard Road & Administrative Map"
            >
              <MapIcon className="h-3 w-3" />
              <span>Map</span>
            </button>
            <button
              onClick={() => setMapStyle('satellite')}
              className={`flex items-center gap-1 px-2 py-1 rounded font-medium text-[11px] transition-colors ${
                mapStyle === 'satellite'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Satellite Field Imagery"
            >
              <Satellite className="h-3 w-3" />
              <span>Satellite</span>
            </button>
          </div>

          <span className="text-slate-300">|</span>

          {/* Layer toggles */}
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
            <input
              type="checkbox"
              checked={showHotspots}
              onChange={e => setShowHotspots(e.target.checked)}
              className="rounded text-rose-600 focus:ring-rose-500"
            />
            <span className="flex items-center gap-1 font-medium">
              <Flame className="h-3.5 w-3.5 text-rose-600" />
              Fires ({hotspots.length})
            </span>
          </label>

          <span className="text-slate-300">|</span>

          <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
            <input
              type="checkbox"
              checked={showChcs}
              onChange={e => setShowChcs(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <span className="flex items-center gap-1 font-medium">
              <Building2 className="h-3.5 w-3.5 text-blue-600" />
              CHCs ({chcs.length})
            </span>
          </label>

          <span className="text-slate-300">|</span>

          {/* Jump to Region */}
          <div className="flex items-center gap-1 text-[11px]">
            <button
              onClick={() => handleRegionJump('all')}
              className="px-1.5 py-0.5 rounded hover:bg-slate-100 font-medium text-slate-600"
            >
              Overview
            </button>
            <button
              onClick={() => handleRegionJump('punjab')}
              className="px-1.5 py-0.5 rounded hover:bg-slate-100 font-medium text-slate-600"
            >
              Punjab
            </button>
            <button
              onClick={() => handleRegionJump('haryana')}
              className="px-1.5 py-0.5 rounded hover:bg-slate-100 font-medium text-slate-600"
            >
              Haryana
            </button>
          </div>

          {/* Expand Fullscreen Button */}
          {onToggleExpand && (
            <>
              <span className="text-slate-300">|</span>
              <button
                onClick={onToggleExpand}
                className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                title={isExpanded ? 'Collapse Map' : 'Expand Map to Full View'}
              >
                {isExpanded ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Leaflet Map Container with guaranteed non-zero pixel height */}
      <div className="flex-1 w-full h-full relative" style={{ minHeight: '500px' }}>
        <MapContainer
          center={mapCenter}
          zoom={zoomLevel}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%', minHeight: '500px' }}
          className="h-full w-full"
        >
          <MapController center={mapCenter} zoom={zoomLevel} isExpanded={isExpanded} />

          {/* Base Tile Layer */}
          {mapStyle === 'street' ? (
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={19}
            />
          ) : (
            <TileLayer
              attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              maxZoom={18}
            />
          )}

          {/* Selected Machine History Trail */}
          {selectedMachine && selectedMachine.pathTrail.length > 1 && (
            <Polyline
              positions={selectedMachine.pathTrail.map(p => [p.lat, p.lng])}
              pathOptions={{
                color: '#059669',
                weight: 4,
                opacity: 0.85,
                dashArray: '4, 4',
              }}
            />
          )}

          {/* CHC Hubs & Service Radii */}
          {showChcs &&
            chcs.map(chc => (
              <React.Fragment key={`chc-${chc.id}`}>
                <Circle
                  center={[chc.location.lat, chc.location.lng]}
                  radius={16000} // ~16 km operational radius for custom hiring
                  pathOptions={{
                    color: '#3b82f6',
                    fillColor: '#3b82f6',
                    fillOpacity: 0.06,
                    weight: 1.5,
                    dashArray: '3, 6',
                  }}
                />
                <Marker position={[chc.location.lat, chc.location.lng]} icon={chcIcon}>
                  <Popup>
                    <div className="p-3 font-sans text-xs max-w-xs space-y-1.5">
                      <div className="flex items-center gap-1.5 text-blue-700 font-bold text-sm">
                        <Building2 className="h-4 w-4" />
                        {chc.name}
                      </div>
                      <p className="text-slate-600">
                        {chc.district}, {chc.state}
                      </p>
                      <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                        <span>
                          Total Fleet: <strong>{chc.totalMachines} machines</strong>
                        </span>
                        <span>Subsidy: {chc.subsidySanctioned}</span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        In-Charge: {chc.contactPerson} ({chc.phone})
                      </p>
                    </div>
                  </Popup>
                </Marker>
              </React.Fragment>
            ))}

          {/* Satellite Stubble Fire Hotspots */}
          {showHotspots &&
            hotspots.map(h => (
              <React.Fragment key={`hotspot-${h.id}`}>
                <Circle
                  center={[h.location.lat, h.location.lng]}
                  radius={2800}
                  pathOptions={{
                    color: h.dispatchStatus === 'Extinguished' ? '#10b981' : '#e11d48',
                    fillColor: h.dispatchStatus === 'Extinguished' ? '#10b981' : '#e11d48',
                    fillOpacity: 0.18,
                    weight: 1.5,
                  }}
                />
                <Marker
                  position={[h.location.lat, h.location.lng]}
                  icon={createHotspotIcon(h.confidence)}
                >
                  <Popup>
                    <div className="p-3 font-sans text-xs max-w-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-rose-700 flex items-center gap-1 text-sm">
                          <Flame className="h-4 w-4" /> Thermal Anomaly
                        </span>
                        <span className="font-mono text-[10px] bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded">
                          {h.confidence}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">
                          {h.village}, {h.district}
                        </p>
                        <p className="text-slate-500 font-mono text-[11px]">
                          {h.acresAtRisk} acres at risk · Status: <strong>{h.dispatchStatus}</strong>
                        </p>
                      </div>

                      {h.dispatchStatus === 'Unassigned' && (
                        <button
                          onClick={() => onDispatchHotspot(h.id)}
                          className="w-full mt-2 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded font-medium text-xs transition-colors shadow-xs flex items-center justify-center gap-1.5"
                        >
                          <Zap className="h-3.5 w-3.5" />
                          Dispatch Nearest Baler / Seeder
                        </button>
                      )}

                      {h.assignedMachineId && (
                        <p className="text-[11px] text-emerald-700 font-medium">
                          Assigned Machine: {h.assignedMachineId}
                        </p>
                      )}
                    </div>
                  </Popup>
                </Marker>
              </React.Fragment>
            ))}

          {/* Machine Markers */}
          {showMachines &&
            filteredMachines.map(machine => {
              const isSelected = selectedMachine?.id === machine.id;
              return (
                <Marker
                  key={machine.id}
                  position={[machine.location.lat, machine.location.lng]}
                  icon={createMachineIcon(machine.status, isSelected)}
                  eventHandlers={{
                    click: () => onSelectMachine(machine),
                  }}
                >
                  <Popup>
                    <div className="p-3 font-sans text-xs max-w-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-sm">{machine.name}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                            machine.status === MachineStatus.InUse
                              ? 'bg-emerald-100 text-emerald-800'
                              : machine.status === MachineStatus.Idle
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {machine.status}
                        </span>
                      </div>

                      <p className="text-slate-500 text-[11px] font-mono">
                        {machine.id} · {machine.type}
                      </p>

                      <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2 rounded border border-slate-100 text-[11px]">
                        <div>
                          <span className="text-slate-400 block">Speed</span>
                          <strong className="font-mono text-slate-800">
                            {machine.telemetry.speedKmH} km/h
                          </strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Fuel</span>
                          <strong className="font-mono text-slate-800">
                            {machine.telemetry.fuelPercent}%
                          </strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Today's Area</span>
                          <strong className="font-mono text-slate-800">
                            {machine.telemetry.acresCoveredToday} ac
                          </strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Straw Cut</span>
                          <strong className="font-mono text-slate-800">
                            {machine.telemetry.tonsResidueManaged} t
                          </strong>
                        </div>
                      </div>

                      <button
                        onClick={() => onSelectMachine(machine)}
                        className="w-full mt-2 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded font-medium text-xs transition-colors flex items-center justify-center gap-1"
                      >
                        <Info className="h-3.5 w-3.5" />
                        View Telemetry Diagnostics
                      </button>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
        </MapContainer>
      </div>

      {/* Legend Island in Bottom Right */}
      <div className="absolute bottom-3 right-3 z-[400] bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 shadow-md text-[11px] text-slate-600 flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
          <span>In Use</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
          <span>Standby</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
          <span>Maintenance</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Flame className="h-3 w-3 text-rose-600" />
          <span>Fire Hotspot</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Building2 className="h-3 w-3 text-blue-600" />
          <span>CHC Hub</span>
        </div>
      </div>
    </div>
  );
};

export default MachineMap;
