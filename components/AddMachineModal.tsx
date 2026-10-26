import React, { useState } from 'react';
import { Machine, MachineStatus, MachineType, CHC } from '../types';
import { X, PlusCircle, Tractor } from 'lucide-react';

interface AddMachineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMachine: (newMachine: Machine) => void;
  chcs: CHC[];
}

export const AddMachineModal: React.FC<AddMachineModalProps> = ({
  isOpen,
  onClose,
  onAddMachine,
  chcs,
}) => {
  if (!isOpen) return null;

  const [type, setType] = useState<MachineType>(MachineType.HappySeeder);
  const [name, setName] = useState('');
  const [chcId, setChcId] = useState<number>(chcs[0]?.id || 1);
  const [operatorName, setOperatorName] = useState('');
  const [operatorPhone, setOperatorPhone] = useState('');
  const [initialStatus, setInitialStatus] = useState<MachineStatus>(MachineStatus.Idle);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedChc = chcs.find(c => c.id === Number(chcId)) || chcs[0];

    const randomSuffix = Math.floor(Math.random() * 899 + 100);
    const newMachineId = `CRM-2024-${randomSuffix}`;
    const schemeRegNo = `DAFW/CRM/${selectedChc.state.slice(0, 2).toUpperCase()}/2024/${randomSuffix}`;

    const newMachine: Machine = {
      id: newMachineId,
      schemeRegNo,
      name: name.trim() || `${type} #${randomSuffix}`,
      type,
      status: initialStatus,
      location: {
        lat: +(selectedChc.location.lat + (Math.random() - 0.5) * 0.08).toFixed(5),
        lng: +(selectedChc.location.lng + (Math.random() - 0.5) * 0.08).toFixed(5),
      },
      chcId: Number(chcId),
      lastActive: new Date(),
      pathTrail: [],
      telemetry: {
        speedKmH: initialStatus === MachineStatus.InUse ? 7 : 0,
        fuelPercent: 95,
        engineHours: 12,
        acresCoveredToday: 0,
        tonsResidueManaged: 0,
        co2SavedKg: 0,
        operatorName: operatorName.trim() || 'Assigned CHC Driver',
        operatorPhone: operatorPhone.trim() || '+91 98765-00000',
        gpsSignal: 'Strong',
        batteryPercent: 98,
        tempCelsius: 65,
      },
    };

    onAddMachine(newMachine);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
              <Tractor className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Register Subsidized CRM Machine</h2>
              <p className="text-xs text-slate-500">Add IoT telemetry unit under Central Stubble Scheme</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Machine Category / Implement Type
            </label>
            <select
              value={type}
              onChange={e => setType(e.target.value as MachineType)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              {Object.values(MachineType).map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Custom Fleet Name / Identifier (Optional)
            </label>
            <input
              type="text"
              placeholder={`e.g. ${type} SuperTrack Alpha`}
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Custom Hiring Center (CHC Hub)
              </label>
              <select
                value={chcId}
                onChange={e => setChcId(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                {chcs.map(chc => (
                  <option key={chc.id} value={chc.id}>
                    {chc.name} ({chc.district})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Initial Deployment Status
              </label>
              <select
                value={initialStatus}
                onChange={e => setInitialStatus(e.target.value as MachineStatus)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value={MachineStatus.Idle}>Idle (Ready for Hire)</option>
                <option value={MachineStatus.InUse}>In Use (In Field)</option>
                <option value={MachineStatus.Maintenance}>Maintenance / Yard</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Designated Operator / Driver
              </label>
              <input
                type="text"
                placeholder="Operator Full Name"
                value={operatorName}
                onChange={e => setOperatorName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Operator Contact Phone
              </label>
              <input
                type="tel"
                placeholder="+91 98765-43210"
                value={operatorPhone}
                onChange={e => setOperatorPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm"
            >
              <PlusCircle className="h-4 w-4" />
              Complete Registration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
