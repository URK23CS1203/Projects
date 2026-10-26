import React, { useState } from 'react';
import { StubbleHotspot, Machine, MachineStatus, MachineType } from '../types';
import {
  Flame,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MapPin,
  Tractor,
  Send,
  PlusCircle,
  Radio,
  Trash2,
} from 'lucide-react';

interface StubbleHotspotsViewProps {
  hotspots: StubbleHotspot[];
  machines: Machine[];
  onDispatchMachine: (hotspotId: string, machineId: string) => void;
  onSimulateNewHotspot: () => void;
  onSelectMachine: (machine: Machine) => void;
  onViewOnMap?: (machine?: Machine) => void;
  onDismissHotspot?: (hotspotId: string) => void;
}

// Calculate rough geographic distance in km
const calculateDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return +(R * c).toFixed(1);
};

export const StubbleHotspotsView: React.FC<StubbleHotspotsViewProps> = ({
  hotspots,
  machines,
  onDispatchMachine,
  onSimulateNewHotspot,
  onSelectMachine,
  onViewOnMap,
  onDismissHotspot,
}) => {
  const [filter, setFilter] = useState<'All' | 'Unassigned' | 'Dispatched' | 'Extinguished'>('All');
  const [selectedHotspotId, setSelectedHotspotId] = useState<string | null>(null);
  const [confirmDismiss, setConfirmDismiss] = useState(false);

  const filteredHotspots = hotspots.filter(h => {
    if (filter === 'All') return true;
    return h.dispatchStatus === filter;
  });

  const activeHotspot = hotspots.find(h => h.id === selectedHotspotId) || filteredHotspots[0];

  // Find nearest idle machines for the active hotspot
  const nearestIdleMachines = React.useMemo(() => {
    if (!activeHotspot) return [];
    return machines
      .filter(m => m.status === MachineStatus.Idle)
      .map(m => ({
        machine: m,
        distanceKm: calculateDistanceKm(
          activeHotspot.location.lat,
          activeHotspot.location.lng,
          m.location.lat,
          m.location.lng
        ),
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 5);
  }, [activeHotspot, machines]);

  return (
    <div className="space-y-6">
      {/* Top Banner / Summary */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-rose-100 text-rose-700 rounded-lg">
              <Flame className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Satellite Stubble Burning Hotspots & Rapid Dispatch
              </h2>
              <p className="text-xs text-slate-500">
                Live thermal anomalies ingested from NASA VIIRS & ISRO FIRMS constellation
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Filter segment */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
            {(['All', 'Unassigned', 'Dispatched', 'Extinguished'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  filter === tab
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Trigger Fire Simulation */}
          <button
            onClick={onSimulateNewHotspot}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-medium transition-colors shadow-xs"
            title="Simulate incoming satellite telemetry alert"
          >
            <Radio className="h-3.5 w-3.5" />
            Simulate Fire Scan Alert
          </button>
        </div>
      </div>

      {/* Main 2-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Hotspots Feed List */}
        <div className="lg:col-span-7 space-y-3">
          {filteredHotspots.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 text-sm">
              No fire hotspots found matching "{filter}".
            </div>
          ) : (
            filteredHotspots.map(hotspot => {
              const isSelected = activeHotspot?.id === hotspot.id;
              const assignedMachine = machines.find(m => m.id === hotspot.assignedMachineId);

              return (
                <div
                  key={hotspot.id}
                  onClick={() => setSelectedHotspotId(hotspot.id)}
                  className={`bg-white rounded-xl border p-4 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-slate-900 ring-1 ring-slate-900 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-lg mt-0.5 ${
                          hotspot.dispatchStatus === 'Extinguished'
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'bg-rose-50 text-rose-600'
                        }`}
                      >
                        <Flame className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900 text-sm">{hotspot.village}</h3>
                          <span className="text-xs text-slate-400">·</span>
                          <span className="text-xs text-slate-600">{hotspot.district}, {hotspot.state}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                          <span className="font-mono">{hotspot.id}</span>
                          <span aria-hidden="true">·</span>
                          <span>{hotspot.acresAtRisk} acres at risk</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono text-[11px]">
                            {new Date(hotspot.detectedAt).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-md font-medium ${
                          hotspot.dispatchStatus === 'Unassigned'
                            ? 'bg-rose-100 text-rose-800'
                            : hotspot.dispatchStatus === 'Dispatched'
                            ? 'bg-amber-100 text-amber-800'
                            : hotspot.dispatchStatus === 'On Site'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {hotspot.dispatchStatus}
                      </span>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Confidence: <strong>{hotspot.confidence}</strong>
                      </p>
                    </div>
                  </div>

                  {assignedMachine && (
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <Tractor className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Dispatched: <strong>{assignedMachine.name}</strong> ({assignedMachine.type})</span>
                      </div>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          onSelectMachine(assignedMachine);
                        }}
                        className="text-xs font-medium text-emerald-700 hover:underline"
                      >
                        Track Machine →
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Selected Hotspot Rapid Dispatch Console */}
        <div className="lg:col-span-5">
          {activeHotspot ? (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-5 sticky top-20">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider">
                    Rapid Dispatch Console
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">
                    {activeHotspot.village} Field Sector
                  </h3>
                </div>
                <span className="text-xs font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                  {activeHotspot.confidence} Risk
                </span>
              </div>

              {/* Coordinates & Details */}
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Coordinates:</span>
                  <span className="font-mono text-slate-800 tabular-nums">
                    {activeHotspot.location.lat.toFixed(4)}, {activeHotspot.location.lng.toFixed(4)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">District / State:</span>
                  <span className="font-medium text-slate-800">{activeHotspot.district}, {activeHotspot.state}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Unmanaged Crop Residue:</span>
                  <span className="font-bold text-rose-700">{activeHotspot.acresAtRisk} Acres</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Current Dispatch:</span>
                  <span className="font-medium text-slate-800">{activeHotspot.dispatchStatus}</span>
                </div>
                {onViewOnMap && (
                  <button
                    onClick={() => onViewOnMap(machines.find(m => m.id === activeHotspot.assignedMachineId))}
                    className="w-full mt-2 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>View Fire Sector on Live Map →</span>
                  </button>
                )}

                {onDismissHotspot && (
                  <div className="pt-2 border-t border-slate-200 mt-2">
                    {confirmDismiss ? (
                      <div className="flex items-center justify-between bg-rose-50 p-2 rounded border border-rose-200 text-xs">
                        <span className="text-rose-700 font-medium">Dismiss this alert?</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              onDismissHotspot(activeHotspot.id);
                              setConfirmDismiss(false);
                            }}
                            className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded font-bold text-xs"
                          >
                            Yes, Dismiss
                          </button>
                          <button
                            onClick={() => setConfirmDismiss(false)}
                            className="px-2 py-1 text-slate-600 hover:text-slate-800 text-xs"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDismiss(true)}
                        className="w-full py-1 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Dismiss / Remove Thermal Alert</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Dispatch Action */}
              <div>
                <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Closest Idle CRM Machines</span>
                  <span className="text-[11px] font-normal text-slate-500">Ranked by proximity</span>
                </h4>

                {nearestIdleMachines.length === 0 ? (
                  <p className="text-xs text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200">
                    All nearby machines are currently in use or maintenance. Please reassign from the fleet view.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {nearestIdleMachines.map(({ machine, distanceKm }) => (
                      <div
                        key={machine.id}
                        className="p-3 rounded-lg border border-slate-200 hover:border-slate-300 bg-white flex items-center justify-between text-xs transition-colors"
                      >
                        <div>
                          <p className="font-bold text-slate-900">{machine.name}</p>
                          <p className="text-slate-500 text-[11px] font-mono">
                            {machine.type} · Fuel {machine.telemetry.fuelPercent}% · <strong className="text-slate-800 font-sans">{distanceKm} km away</strong>
                          </p>
                        </div>
                        <button
                          onClick={() => onDispatchMachine(activeHotspot.id, machine.id)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-medium text-xs transition-colors shadow-xs"
                        >
                          <Send className="h-3 w-3" />
                          Dispatch
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400 text-sm">
              Select a fire anomaly to manage dispatch.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
