import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Machine,
  CHC,
  MachineStatus,
  MachineType,
  StubbleHotspot,
  FarmerBooking,
  ActiveNavTab,
} from './types';
import {
  generateInitialMachines,
  generateInitialHotspots,
  generateInitialBookings,
  CHCS,
} from './services/mockData';
import Header from './components/Header';
import DashboardMetrics from './components/DashboardMetrics';
import MachineMap from './components/MachineMap';
import UsageCharts from './components/UsageCharts';
import MachineList from './components/MachineList';
import { StubbleHotspotsView } from './components/StubbleHotspotsView';
import { FarmerBookingsView } from './components/FarmerBookingsView';
import { EnvironmentalImpactView } from './components/EnvironmentalImpactView';
import { MachineDetailModal } from './components/MachineDetailModal';
import { AddMachineModal } from './components/AddMachineModal';
import { NewBookingModal } from './components/NewBookingModal';
import {
  Tractor,
  Flame,
  CheckCircle2,
  CalendarCheck,
  Building2,
  Layers,
  TrendingUp,
  MapPin,
  Clock,
  ArrowRight,
} from 'lucide-react';

const CHCPerformance: React.FC<{
  machines: Machine[];
  chcs: CHC[];
  onSelectChc?: (chcId: number) => void;
}> = ({ machines, chcs }) => {
  const performanceData = useMemo(() => {
    return chcs
      .map(chc => {
        const chcMachines = machines.filter(m => m.chcId === chc.id);
        const inUseCount = chcMachines.filter(m => m.status === MachineStatus.InUse).length;
        const totalCount = chcMachines.length;
        const utilization = totalCount > 0 ? Math.round((inUseCount / totalCount) * 100) : 0;
        const totalAcres = chcMachines.reduce((sum, m) => sum + (m.telemetry?.acresCoveredToday || 0), 0);
        return {
          ...chc,
          machineCount: totalCount,
          inUseCount,
          utilization,
          totalAcres: +totalAcres.toFixed(1),
        };
      })
      .sort((a, b) => b.utilization - a.utilization);
  }, [machines, chcs]);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-12 px-3 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
        <div className="col-span-5">CHC Hub & District</div>
        <div className="col-span-3 text-center">Active / Total</div>
        <div className="col-span-4 text-right">Fleet Utilization</div>
      </div>
      <ul className="space-y-2">
        {performanceData.map(chc => (
          <li
            key={chc.id}
            className="grid grid-cols-12 items-center px-3.5 py-2.5 bg-slate-50/70 border border-slate-100 rounded-lg hover:bg-slate-100/80 transition-colors"
          >
            <div className="col-span-5">
              <p className="font-semibold text-xs text-slate-900">{chc.name}</p>
              <p className="text-[11px] text-slate-500">
                {chc.district}, {chc.state}
              </p>
            </div>
            <div className="col-span-3 text-center font-mono tabular-nums text-xs text-slate-700">
              <span className="font-bold text-emerald-700">{chc.inUseCount}</span> / {chc.machineCount}
            </div>
            <div className="col-span-4">
              <div className="flex items-center justify-end gap-2">
                <div className="w-24 bg-slate-200 rounded-full h-1.5 hidden sm:block overflow-hidden">
                  <div
                    className="bg-emerald-600 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${chc.utilization}%` }}
                  />
                </div>
                <span className="text-xs font-bold font-mono text-slate-800 tabular-nums w-9 text-right">
                  {chc.utilization}%
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

const App: React.FC = () => {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [hotspots, setHotspots] = useState<StubbleHotspot[]>([]);
  const [bookings, setBookings] = useState<FarmerBooking[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveNavTab>('operations');
  const [isMapExpanded, setIsMapExpanded] = useState(false);

  // Modals & inspect
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [isAddMachineOpen, setIsAddMachineOpen] = useState(false);
  const [isNewBookingOpen, setIsNewBookingOpen] = useState(false);

  // Simulation controls
  const [isSimulating, setIsSimulating] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Trigger brief toast alert
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  }, []);

  // Initialize data
  useEffect(() => {
    setMachines(generateInitialMachines());
    setHotspots(generateInitialHotspots());
    setBookings(generateInitialBookings());
  }, []);

  // Real-time Simulation Engine
  useEffect(() => {
    if (!isSimulating) return;

    const intervalTime = Math.max(800, 2400 / simulationSpeed);

    const simulationInterval = setInterval(() => {
      setMachines(prevMachines =>
        prevMachines.map(machine => {
          if (machine.status === MachineStatus.Maintenance) {
            // Occasionally finish maintenance
            if (Math.random() < 0.02 * simulationSpeed) {
              return {
                ...machine,
                status: MachineStatus.Idle,
                telemetry: {
                  ...machine.telemetry,
                  speedKmH: 0,
                  fuelPercent: 95,
                  tempCelsius: 60,
                },
              };
            }
            return machine;
          }

          let newStatus = machine.status;
          let newLocation = machine.location;
          let newLastActive = machine.lastActive;
          let newSpeed = machine.telemetry.speedKmH;
          let newAcres = machine.telemetry.acresCoveredToday;
          let newTons = machine.telemetry.tonsResidueManaged;
          let newCo2 = machine.telemetry.co2SavedKg;
          let newTrail = [...machine.pathTrail];

          if (machine.status === MachineStatus.InUse) {
            // In use machine: slowly cover ground
            const deltaLat = (Math.random() - 0.5) * 0.0006;
            const deltaLng = (Math.random() - 0.5) * 0.0006;
            newLocation = {
              lat: +(machine.location.lat + deltaLat).toFixed(5),
              lng: +(machine.location.lng + deltaLng).toFixed(5),
            };
            newLastActive = new Date();
            newSpeed = Math.floor(Math.random() * 5) + 6; // 6-11 km/h
            newAcres = +(newAcres + 0.03 * simulationSpeed).toFixed(2);
            newTons = +(newTons + 0.07 * simulationSpeed).toFixed(2);
            newCo2 = Math.round(newCo2 + 95 * simulationSpeed);

            // Keep trail up to 6 positions
            newTrail.push(newLocation);
            if (newTrail.length > 6) newTrail.shift();

            // Occasionally finish operation
            if (Math.random() < 0.03 * simulationSpeed) {
              newStatus = MachineStatus.Idle;
              newSpeed = 0;
            }
          } else if (machine.status === MachineStatus.Idle) {
            // Standby machine: occasionally start operating
            if (Math.random() < 0.03 * simulationSpeed) {
              newStatus = MachineStatus.InUse;
              newLastActive = new Date();
              newSpeed = 7;
            }
          }

          return {
            ...machine,
            status: newStatus,
            location: newLocation,
            lastActive: newLastActive,
            pathTrail: newTrail,
            telemetry: {
              ...machine.telemetry,
              speedKmH: newSpeed,
              acresCoveredToday: newAcres,
              tonsResidueManaged: newTons,
              co2SavedKg: newCo2,
              fuelPercent: Math.max(15, machine.telemetry.fuelPercent - (machine.status === MachineStatus.InUse ? 0.05 : 0)),
            },
          };
        })
      );
    }, intervalTime);

    return () => clearInterval(simulationInterval);
  }, [isSimulating, simulationSpeed]);

  // Keep selectedMachine synchronized with live telemetry updates
  useEffect(() => {
    if (selectedMachine) {
      const updated = machines.find(m => m.id === selectedMachine.id);
      if (updated) setSelectedMachine(updated);
    }
  }, [machines, selectedMachine?.id]);

  // Handler: Add new machine
  const handleAddMachine = (newMachine: Machine) => {
    setMachines(prev => [newMachine, ...prev]);
    showToast(`Registered new CRM machine: ${newMachine.name} (${newMachine.id})`);
  };

  // Handler: Add new booking
  const handleAddBooking = (newBooking: FarmerBooking) => {
    setBookings(prev => [newBooking, ...prev]);
    showToast(`New machine hire request submitted for ${newBooking.farmerName} (${newBooking.farmSizeAcres} acres)`);
  };

  // Handler: Remove machine from fleet
  const handleDeleteMachine = (machineId: string) => {
    setMachines(prev => prev.filter(m => m.id !== machineId));
    if (selectedMachine?.id === machineId) {
      setSelectedMachine(null);
    }
    showToast(`Machine ${machineId} removed from fleet.`);
  };

  // Handler: Delete / Cancel booking
  const handleDeleteBooking = (bookingId: string) => {
    setBookings(prev => prev.filter(b => b.id !== bookingId));
    showToast(`Farmer booking ${bookingId} cancelled and removed.`);
  };

  // Handler: Dismiss / Clear Hotspot Alert
  const handleDismissHotspot = (hotspotId: string) => {
    setHotspots(prev => prev.filter(h => h.id !== hotspotId));
    showToast(`Thermal alert ${hotspotId} dismissed.`);
  };

  // Handler: Update machine status directly
  const handleUpdateMachineStatus = (machineId: string, status: MachineStatus) => {
    setMachines(prev =>
      prev.map(m =>
        m.id === machineId
          ? {
              ...m,
              status,
              telemetry: {
                ...m.telemetry,
                speedKmH: status === MachineStatus.InUse ? 8 : 0,
              },
            }
          : m
      )
    );
    showToast(`Machine status updated to ${status}`);
  };

  // Handler: Dispatch machine to hotspot
  const handleDispatchMachineToHotspot = (hotspotId: string, machineId?: string) => {
    let targetMachineId = machineId;
    if (!targetMachineId) {
      const idleMachine = machines.find(m => m.status === MachineStatus.Idle);
      if (idleMachine) targetMachineId = idleMachine.id;
    }

    if (!targetMachineId) {
      showToast('No idle CRM machines available right now. Please reassign from fleet.');
      return;
    }

    // Update hotspot
    setHotspots(prev =>
      prev.map(h =>
        h.id === hotspotId
          ? { ...h, dispatchStatus: 'Dispatched', assignedMachineId: targetMachineId }
          : h
      )
    );

    // Update machine
    setMachines(prev =>
      prev.map(m =>
        m.id === targetMachineId
          ? {
              ...m,
              status: MachineStatus.InUse,
              assignedHotspotId: hotspotId,
              telemetry: { ...m.telemetry, speedKmH: 9 },
            }
          : m
      )
    );

    showToast(`Machine ${targetMachineId} dispatched to Stubble Fire Hotspot ${hotspotId}!`);
  };

  // Handler: Assign machine to booking
  const handleAssignBooking = (machineId: string, bookingId: string) => {
    setBookings(prev =>
      prev.map(b =>
        b.id === bookingId
          ? { ...b, status: 'Dispatched', assignedMachineId: machineId }
          : b
      )
    );

    setMachines(prev =>
      prev.map(m =>
        m.id === machineId
          ? {
              ...m,
              status: MachineStatus.InUse,
              assignedBookingId: bookingId,
              telemetry: { ...m.telemetry, speedKmH: 8 },
            }
          : m
      )
    );

    showToast(`Machine ${machineId} assigned to Booking ${bookingId}`);
  };

  // Handler: Update Booking Status
  const handleUpdateBookingStatus = (
    bookingId: string,
    status: FarmerBooking['status'],
    machineId?: string
  ) => {
    setBookings(prev =>
      prev.map(b => {
        if (b.id !== bookingId) return b;
        return {
          ...b,
          status,
          assignedMachineId: machineId || b.assignedMachineId,
        };
      })
    );

    if (machineId && (status === 'Dispatched' || status === 'In Progress')) {
      setMachines(prev =>
        prev.map(m =>
          m.id === machineId
            ? { ...m, status: MachineStatus.InUse, assignedBookingId: bookingId }
            : m
        )
      );
    }

    showToast(`Booking ${bookingId} status advanced to ${status}`);
  };

  // Handler: Simulate New Satellite Fire Hotspot
  const handleSimulateNewHotspot = () => {
    const villages = [
      { name: 'Raikot Khurd', district: 'Ludhiana', state: 'Punjab', lat: 30.652, lng: 75.602 },
      { name: 'Tohana Dehat', district: 'Fatehabad', state: 'Haryana', lat: 29.702, lng: 75.912 },
      { name: 'Dhuri Rural', district: 'Sangrur', state: 'Punjab', lat: 30.372, lng: 75.865 },
      { name: 'Pehowa Border', district: 'Kurukshetra', state: 'Haryana', lat: 29.982, lng: 76.582 },
    ];
    const picked = villages[Math.floor(Math.random() * villages.length)];
    const randomSuffix = Math.floor(Math.random() * 899 + 100);

    const newHotspot: StubbleHotspot = {
      id: `FIRMS-2024-${randomSuffix}`,
      location: { lat: picked.lat, lng: picked.lng },
      village: picked.name,
      district: picked.district,
      state: picked.state,
      confidence: 'Critical',
      detectedAt: new Date(),
      acresAtRisk: Math.floor(Math.random() * 20) + 10,
      dispatchStatus: 'Unassigned',
    };

    setHotspots(prev => [newHotspot, ...prev]);
    showToast(`New Satellite Stubble Burning Anomaly detected in ${picked.name} (${picked.district})!`);
  };

  // Handler: Export CSV Telemetry Report
  const handleExportCsv = () => {
    const headers = [
      'Machine ID',
      'Scheme Registration No',
      'Machine Name',
      'Implement Type',
      'Status',
      'CHC Hub ID',
      'Latitude',
      'Longitude',
      'Speed (km/h)',
      'Fuel (%)',
      'Engine Hours',
      'Acres Today',
      'Residue Managed (Tons)',
      'CO2 Saved (kg)',
      'Operator Name',
      'Operator Phone',
      'GPS Signal',
      'Last Active',
    ];

    const rows = machines.map(m => [
      m.id,
      m.schemeRegNo,
      `"${m.name}"`,
      `"${m.type}"`,
      m.status,
      m.chcId,
      m.location.lat,
      m.location.lng,
      m.telemetry.speedKmH,
      m.telemetry.fuelPercent,
      m.telemetry.engineHours,
      m.telemetry.acresCoveredToday,
      m.telemetry.tonsResidueManaged,
      m.telemetry.co2SavedKg,
      `"${m.telemetry.operatorName}"`,
      m.telemetry.operatorPhone,
      m.telemetry.gpsSignal,
      new Date(m.lastActive).toISOString(),
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `CRM_Machine_Telemetry_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('CRM Machine Telemetry CSV exported successfully.');
  };

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col font-sans">
      {/* Top Bar Header */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isSimulating={isSimulating}
        onToggleSimulation={() => setIsSimulating(!isSimulating)}
        simulationSpeed={simulationSpeed}
        onChangeSpeed={setSimulationSpeed}
        onOpenAddMachine={() => setIsAddMachineOpen(true)}
        onExportCsv={handleExportCsv}
      />

      {/* Ephemeral Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-[1100] max-w-md bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 text-xs flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
          <span className="flex-1 leading-snug">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white text-xs ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Real-time KPI Bar (always visible for constant situation awareness) */}
        <DashboardMetrics machines={machines} hotspots={hotspots} bookings={bookings} />

        {/* Tab 1: Operations Map */}
        {activeTab === 'operations' && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* Map Column (8 cols in standard mode, 12 cols when expanded) */}
            <div className={`${isMapExpanded ? 'xl:col-span-12' : 'xl:col-span-8'} space-y-6`}>
              <div
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col transition-all duration-300"
                style={{ minHeight: isMapExpanded ? '80vh' : '620px' }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">
                      Live Telemetry & Geo-Tracking Operations Map
                    </h2>
                    <p className="text-xs text-slate-500">
                      Real-time IoT machine coordinates, satellite thermal alerts & CHC hiring radii
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 hidden sm:inline">
                      {machines.filter(m => m.status === MachineStatus.InUse).length} units active in field
                    </span>
                    <button
                      onClick={() => setIsMapExpanded(!isMapExpanded)}
                      className="text-xs font-medium px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    >
                      {isMapExpanded ? 'Standard View' : 'Full Screen Map'}
                    </button>
                  </div>
                </div>
                <div className="flex-1 w-full" style={{ minHeight: isMapExpanded ? '74vh' : '560px' }}>
                  <MachineMap
                    machines={machines}
                    chcs={CHCS}
                    hotspots={hotspots}
                    selectedMachine={selectedMachine}
                    onSelectMachine={setSelectedMachine}
                    onDispatchHotspot={hotspotId => handleDispatchMachineToHotspot(hotspotId)}
                    isExpanded={isMapExpanded}
                    onToggleExpand={() => setIsMapExpanded(!isMapExpanded)}
                  />
                </div>
              </div>

              {/* CHC Performance Grid */}
              {!isMapExpanded && (
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">
                        Custom Hiring Center (CHC) Fleet Utilization
                      </h2>
                      <p className="text-xs text-slate-500">
                        Subsidized machinery deployment status across cooperative societies
                      </p>
                    </div>
                    <span className="text-xs text-slate-500 font-mono">
                      {CHCS.length} Centers Active
                    </span>
                  </div>
                  <CHCPerformance machines={machines} chcs={CHCS} />
                </div>
              )}
            </div>

            {/* Right 4 cols: Implement Breakdown & Quick Fleet Queue (hidden when map is expanded) */}
            {!isMapExpanded && (
              <div className="xl:col-span-4 space-y-6">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                <h2 className="text-sm font-bold text-slate-900 mb-1">
                  Machinery Allocation by Implement
                </h2>
                <p className="text-xs text-slate-500 mb-3">
                  In Field vs Standby capacity for direct stubble processing
                </p>
                <UsageCharts machines={machines} />
              </div>

              {/* Quick Fleet List Strip */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">Active Machinery Feed</h2>
                    <p className="text-xs text-slate-500">Latest telemetry transmissions</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('fleet')}
                    className="text-xs text-emerald-700 hover:underline font-medium flex items-center gap-1"
                  >
                    View All →
                  </button>
                </div>
                <div className="max-h-[380px] overflow-y-auto space-y-2 pr-1">
                  {machines.slice(0, 7).map(machine => (
                    <div
                      key={machine.id}
                      onClick={() => setSelectedMachine(machine)}
                      className="p-2.5 rounded-lg border border-slate-100 hover:border-slate-300 hover:bg-slate-50/80 cursor-pointer transition-colors flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            machine.status === MachineStatus.InUse
                              ? 'bg-emerald-600'
                              : machine.status === MachineStatus.Idle
                              ? 'bg-amber-600'
                              : 'bg-rose-600'
                          }`}
                        />
                        <div>
                          <p className="font-semibold text-slate-900">{machine.name}</p>
                          <p className="text-[11px] text-slate-400 font-mono">{machine.id} · {machine.type}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-mono tabular-nums text-slate-700 font-medium">
                          {machine.telemetry.speedKmH} km/h
                        </span>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {machine.telemetry.fuelPercent}% fuel
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            )}
          </div>
        )}

        {/* Tab 2: Satellite Stubble Hotspots & Dispatch */}
        {activeTab === 'hotspots' && (
          <StubbleHotspotsView
            hotspots={hotspots}
            machines={machines}
            onDispatchMachine={handleDispatchMachineToHotspot}
            onSimulateNewHotspot={handleSimulateNewHotspot}
            onSelectMachine={setSelectedMachine}
            onViewOnMap={targetMachine => {
              setActiveTab('operations');
              if (targetMachine) setSelectedMachine(targetMachine);
            }}
            onDismissHotspot={handleDismissHotspot}
          />
        )}

        {/* Tab 3: Farmer Bookings & CHC Working Progress */}
        {activeTab === 'bookings' && (
          <FarmerBookingsView
            bookings={bookings}
            machines={machines}
            chcs={CHCS}
            onOpenNewBooking={() => setIsNewBookingOpen(true)}
            onUpdateBookingStatus={handleUpdateBookingStatus}
            onSelectMachine={machine => {
              setSelectedMachine(machine);
              setActiveTab('operations');
            }}
            onDeleteBooking={handleDeleteBooking}
          />
        )}

        {/* Tab 4: Impact & Season Progress */}
        {activeTab === 'analytics' && (
          <EnvironmentalImpactView
            machines={machines}
            chcs={CHCS}
            hotspots={hotspots}
            bookings={bookings}
          />
        )}

        {/* Tab 5: Complete Fleet Telemetry */}
        {activeTab === 'fleet' && (
          <MachineList
            machines={machines}
            chcs={CHCS}
            onSelectMachine={machine => {
              setSelectedMachine(machine);
              setActiveTab('operations');
            }}
            onOpenAddMachine={() => setIsAddMachineOpen(true)}
            onDeleteMachine={handleDeleteMachine}
          />
        )}
      </main>

      {/* Machine Telemetry Inspection Modal */}
      <MachineDetailModal
        machine={selectedMachine}
        onClose={() => setSelectedMachine(null)}
        chcs={CHCS}
        hotspots={hotspots}
        bookings={bookings}
        onUpdateStatus={handleUpdateMachineStatus}
        onAssignHotspot={handleDispatchMachineToHotspot}
        onAssignBooking={handleAssignBooking}
        onDeleteMachine={handleDeleteMachine}
      />

      {/* Register Subsidized Machine Modal */}
      <AddMachineModal
        isOpen={isAddMachineOpen}
        onClose={() => setIsAddMachineOpen(false)}
        onAddMachine={handleAddMachine}
        chcs={CHCS}
      />

      {/* New Farmer Hire Request Modal */}
      <NewBookingModal
        isOpen={isNewBookingOpen}
        onClose={() => setIsNewBookingOpen(false)}
        onAddBooking={handleAddBooking}
        chcs={CHCS}
      />

      {/* Quiet Footer adhering to anti-slop guidelines */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-4 px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            Department of Agriculture & Farmers Welfare · Promotion of Agricultural Mechanization for In-Situ Management of Crop Residue
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>ISRO & NASA FIRMS Sync Active</span>
            <span>·</span>
            <span>CHC Custom Hiring Network</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
