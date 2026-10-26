import React, { useState } from 'react';
import { FarmerBooking, MachineType, CHC } from '../types';
import { X, CalendarPlus, UserCheck } from 'lucide-react';

interface NewBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBooking: (booking: FarmerBooking) => void;
  chcs: CHC[];
}

export const NewBookingModal: React.FC<NewBookingModalProps> = ({
  isOpen,
  onClose,
  onAddBooking,
  chcs,
}) => {
  if (!isOpen) return null;

  const [farmerName, setFarmerName] = useState('');
  const [village, setVillage] = useState('');
  const [phone, setPhone] = useState('');
  const [farmSizeAcres, setFarmSizeAcres] = useState<number>(15);
  const [cropType, setCropType] = useState('Paddy (Non-Basmati PR-126)');
  const [requiredMachineType, setRequiredMachineType] = useState<MachineType>(MachineType.HappySeeder);
  const [urgency, setUrgency] = useState<'Immediate (<24h)' | 'Scheduled (2-3 days)' | 'Flexible'>('Immediate (<24h)');
  const [assignedChcId, setAssignedChcId] = useState<number>(chcs[0]?.id || 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedChc = chcs.find(c => c.id === Number(assignedChcId)) || chcs[0];
    const randomId = `BK-2024-${Math.floor(Math.random() * 899 + 100)}`;

    const newBooking: FarmerBooking = {
      id: randomId,
      farmerName: farmerName.trim() || 'Sardar Kulwant Singh',
      village: village.trim() || 'Raikot Rural',
      district: selectedChc.district,
      state: selectedChc.state,
      phone: phone.trim() || '+91 98145-22334',
      farmSizeAcres: Number(farmSizeAcres) || 10,
      cropType,
      requiredMachineType,
      urgency,
      bookingDate: new Date(),
      status: 'Pending',
      assignedChcId: Number(assignedChcId),
    };

    onAddBooking(newBooking);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
              <CalendarPlus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">New Farmer Machine Hire Request</h2>
              <p className="text-xs text-slate-500">In-situ residue management booking under Subsidized CHC Scheme</p>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Farmer Full Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Jaswinder Singh"
                value={farmerName}
                onChange={e => setFarmerName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mobile Number
              </label>
              <input
                type="tel"
                required
                placeholder="+91 98765-43210"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Village / Tehsil
              </label>
              <input
                type="text"
                required
                placeholder="Village name"
                value={village}
                onChange={e => setVillage(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Assigned Custom Hiring Center
              </label>
              <select
                value={assignedChcId}
                onChange={e => setAssignedChcId(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                {chcs.map(chc => (
                  <option key={chc.id} value={chc.id}>
                    {chc.name} ({chc.district})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Farm Size (Acres)
              </label>
              <input
                type="number"
                min="1"
                max="500"
                value={farmSizeAcres}
                onChange={e => setFarmSizeAcres(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Crop Variety / Residue
              </label>
              <select
                value={cropType}
                onChange={e => setCropType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="Paddy (Non-Basmati PR-126)">Paddy (Non-Basmati PR-126)</option>
                <option value="Paddy (Basmati 1509/1121)">Paddy (Basmati 1509/1121)</option>
                <option value="Paddy (Pusa-44 High Stubble)">Paddy (Pusa-44 High Stubble)</option>
                <option value="Sugarcane Trash">Sugarcane Trash</option>
                <option value="Cotton / Maize Residue">Cotton / Maize Residue</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Required Machine Implement
              </label>
              <select
                value={requiredMachineType}
                onChange={e => setRequiredMachineType(e.target.value as MachineType)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                {Object.values(MachineType).map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Urgency (Risk of Stubble Burning)
              </label>
              <select
                value={urgency}
                onChange={e => setUrgency(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="Immediate (<24h)">Immediate (&lt;24h) - High Fire Risk</option>
                <option value="Scheduled (2-3 days)">Scheduled (2-3 days)</option>
                <option value="Flexible">Flexible / Next Week</option>
              </select>
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
              <UserCheck className="h-4 w-4" />
              Submit Hiring Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
