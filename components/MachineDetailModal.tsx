import React from 'react';
import { Machine, MachineStatus, CHC, StubbleHotspot, FarmerBooking } from '../types';
import {
  X,
  Tractor,
  Gauge,
  Fuel,
  Clock,
  MapPin,
  User,
  Phone,
  Radio,
  Flame,
  CalendarCheck,
  CheckCircle2,
  Wrench,
  Navigation,
  Trash2,
} from 'lucide-react';

interface MachineDetailModalProps {
  machine: Machine | null;
  onClose: () => void;
  chcs: CHC[];
  hotspots: StubbleHotspot[];
  bookings: FarmerBooking[];
  onUpdateStatus: (machineId: string, status: MachineStatus) => void;
  onAssignHotspot: (machineId: string, hotspotId: string) => void;
  onAssignBooking: (machineId: string, bookingId: string) => void;
  onDeleteMachine?: (machineId: string) => void;
}

export const MachineDetailModal: React.FC<MachineDetailModalProps> = ({
  machine,
  onClose,
  chcs,
  hotspots,
  bookings,
  onUpdateStatus,
  onAssignHotspot,
  onAssignBooking,
  onDeleteMachine,
}) => {
  const [confirmDelete, setConfirmDelete] = React.useState(false);

  if (!machine) return null;

  const chc = chcs.find(c => c.id === machine.chcId);
  const assignedHotspot = hotspots.find(h => h.id === machine.assignedHotspotId);
  const assignedBooking = bookings.find(b => b.id === machine.assignedBookingId);
  const unassignedHotspots = hotspots.filter(h => h.dispatchStatus === 'Unassigned');
  const pendingBookings = bookings.filter(b => b.status === 'Pending' || b.status === 'Approved');

  const getStatusStyle = (status: MachineStatus) => {
    switch (status) {
      case MachineStatus.InUse:
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case MachineStatus.Idle:
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case MachineStatus.Maintenance:
        return 'text-rose-700 bg-rose-50 border-rose-200';
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-800">
              <Tractor className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">{machine.name}</h2>
                <span className={`text-xs px-2 py-0.5 rounded-md border font-medium ${getStatusStyle(machine.status)}`}>
                  {machine.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono">
                {machine.id} <span className="text-slate-300">·</span> {machine.schemeRegNo}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Key Telemetry Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
                <Gauge className="h-3.5 w-3.5 text-emerald-600" />
                <span>Operating Speed</span>
              </div>
              <p className="text-xl font-bold font-mono text-slate-800 tabular-nums">
                {machine.telemetry.speedKmH} <span className="text-xs font-normal text-slate-500">km/h</span>
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
                <Fuel className="h-3.5 w-3.5 text-amber-600" />
                <span>Fuel Level</span>
              </div>
              <p className="text-xl font-bold font-mono text-slate-800 tabular-nums">
                {machine.telemetry.fuelPercent}%
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
                <Clock className="h-3.5 w-3.5 text-blue-600" />
                <span>Engine Hours</span>
              </div>
              <p className="text-xl font-bold font-mono text-slate-800 tabular-nums">
                {machine.telemetry.engineHours} <span className="text-xs font-normal text-slate-500">hrs</span>
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
                <Radio className="h-3.5 w-3.5 text-purple-600" />
                <span>IoT GPS Signal</span>
              </div>
              <p className="text-sm font-semibold text-slate-800">
                {machine.telemetry.gpsSignal} ({machine.telemetry.batteryPercent}%)
              </p>
            </div>
          </div>

          {/* Today's In-Situ Residue Management Impact */}
          <div className="bg-emerald-50/60 border border-emerald-100 rounded-lg p-4">
            <h3 className="text-xs font-semibold text-emerald-900 uppercase tracking-wider mb-2">
              Today's Field Impact (Crop Residue Management)
            </h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-emerald-700">Area Processed</p>
                <p className="text-lg font-bold font-mono text-emerald-950 tabular-nums">
                  {machine.telemetry.acresCoveredToday} <span className="text-xs font-normal">Acres</span>
                </p>
              </div>
              <div>
                <p className="text-xs text-emerald-700">Paddy Straw Managed</p>
                <p className="text-lg font-bold font-mono text-emerald-950 tabular-nums">
                  {machine.telemetry.tonsResidueManaged} <span className="text-xs font-normal">Tons</span>
                </p>
              </div>
              <div>
                <p className="text-xs text-emerald-700">CO₂ / Smoke Averted</p>
                <p className="text-lg font-bold font-mono text-emerald-950 tabular-nums">
                  {machine.telemetry.co2SavedKg} <span className="text-xs font-normal">kg</span>
                </p>
              </div>
            </div>
          </div>

          {/* Details & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-3 bg-slate-50/60 p-4 rounded-lg border border-slate-100 text-sm">
              <h4 className="font-semibold text-slate-900 text-xs uppercase tracking-wider">
                Assigned CHC & Hub
              </h4>
              <div className="space-y-1.5 text-xs text-slate-600">
                <p className="font-medium text-slate-800">{chc?.name || 'Central Agricultural Hub'}</p>
                <p className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  {chc?.district}, {chc?.state}
                </p>
                <p className="text-slate-500">Contact: {chc?.contactPerson} ({chc?.phone})</p>
              </div>

              <div className="pt-2 border-t border-slate-200">
                <p className="text-xs font-semibold text-slate-800 mb-1 flex items-center gap-1">
                  <User className="h-3.5 w-3.5 text-slate-400" /> Assigned Operator
                </p>
                <p className="text-xs text-slate-700 font-medium">{machine.telemetry.operatorName}</p>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <Phone className="h-3 w-3 text-slate-400" /> {machine.telemetry.operatorPhone}
                </p>
              </div>
            </div>

            <div className="space-y-3 bg-slate-50/60 p-4 rounded-lg border border-slate-100 text-sm">
              <h4 className="font-semibold text-slate-900 text-xs uppercase tracking-wider">
                Current Coordinates & Status
              </h4>
              <div className="space-y-1.5 text-xs text-slate-600">
                <p className="font-mono tabular-nums text-slate-800">
                  Lat: {machine.location.lat.toFixed(5)}, Lng: {machine.location.lng.toFixed(5)}
                </p>
                <p className="text-slate-500">
                  Last Synced: {new Date(machine.lastActive).toLocaleTimeString()}
                </p>
                <p className="text-slate-500">
                  Engine Temp: {machine.telemetry.tempCelsius}°C
                </p>
              </div>

              {assignedHotspot && (
                <div className="mt-2 p-2 rounded bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-1.5">
                  <Flame className="h-4 w-4 text-rose-600 shrink-0" />
                  <span>Dispatched to Fire Hotspot at <strong>{assignedHotspot.village}</strong></span>
                </div>
              )}

              {assignedBooking && (
                <div className="mt-2 p-2 rounded bg-blue-50 border border-blue-200 text-xs text-blue-800 flex items-center gap-1.5">
                  <CalendarCheck className="h-4 w-4 text-blue-600 shrink-0" />
                  <span>Hired by <strong>{assignedBooking.farmerName}</strong> ({assignedBooking.village})</span>
                </div>
              )}
            </div>
          </div>

          {/* Machine Controls & Dispatch */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
              Fleet Operational Controls
            </h4>

            {/* Quick Status Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onUpdateStatus(machine.id, MachineStatus.InUse)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  machine.status === MachineStatus.InUse
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Set In Use (Active Chopping / Seeding)
              </button>
              <button
                onClick={() => onUpdateStatus(machine.id, MachineStatus.Idle)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  machine.status === MachineStatus.Idle
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Set Idle (Ready for Dispatch)
              </button>
              <button
                onClick={() => onUpdateStatus(machine.id, MachineStatus.Maintenance)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  machine.status === MachineStatus.Maintenance
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Mark Maintenance / Blade Inspection
              </button>
            </div>

            {/* Hotspot & Booking Dispatch Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {unassignedHotspots.length > 0 && (
                <div className="p-3 bg-rose-50/50 border border-rose-100 rounded-lg">
                  <label className="block text-xs font-semibold text-rose-900 mb-1.5">
                    Quick Dispatch to Stubble Fire:
                  </label>
                  <select
                    onChange={e => {
                      if (e.target.value) {
                        onAssignHotspot(machine.id, e.target.value);
                      }
                    }}
                    defaultValue=""
                    className="w-full text-xs bg-white border border-rose-200 rounded-md p-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  >
                    <option value="" disabled>Select fire hotspot...</option>
                    {unassignedHotspots.map(h => (
                      <option key={h.id} value={h.id}>
                        {h.village} ({h.district}) - {h.acresAtRisk} acres ({h.confidence})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {pendingBookings.length > 0 && (
                <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-lg">
                  <label className="block text-xs font-semibold text-blue-900 mb-1.5">
                    Assign to Farmer Hire Request:
                  </label>
                  <select
                    onChange={e => {
                      if (e.target.value) {
                        onAssignBooking(machine.id, e.target.value);
                      }
                    }}
                    defaultValue=""
                    className="w-full text-xs bg-white border border-blue-200 rounded-md p-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="" disabled>Select pending booking...</option>
                    {pendingBookings.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.farmerName} - {b.farmSizeAcres} ac ({b.village})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          {onDeleteMachine && (
            <div>
              {confirmDelete ? (
                <div className="flex items-center gap-2">
                  <span className="text-rose-600 font-medium">Confirm remove?</span>
                  <button
                    onClick={() => {
                      onDeleteMachine(machine.id);
                      onClose();
                    }}
                    className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded font-medium transition-colors"
                  >
                    Yes, Remove
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="px-2 py-1 text-slate-600 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="flex items-center gap-1.5 text-rose-600 hover:text-rose-700 font-medium px-2 py-1 rounded hover:bg-rose-50 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Remove Machine</span>
                </button>
              )}
            </div>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
