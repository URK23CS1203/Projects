import React, { useState, useMemo } from 'react';
import { Machine, CHC, MachineStatus, MachineType } from '../types';
import {
  Search,
  Plus,
  Tractor,
  Fuel,
  Gauge,
  Phone,
  SlidersHorizontal,
  Info,
  CalendarCheck,
  CheckCircle2,
  Trash2,
} from 'lucide-react';

interface MachineListProps {
  machines: Machine[];
  chcs: CHC[];
  onSelectMachine: (machine: Machine) => void;
  onOpenAddMachine: () => void;
  onDeleteMachine?: (machineId: string) => void;
}

const timeAgo = (date: Date): string => {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const MachineList: React.FC<MachineListProps> = ({
  machines,
  chcs,
  onSelectMachine,
  onOpenAddMachine,
  onDeleteMachine,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | MachineStatus>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [chcFilter, setChcFilter] = useState<number | 'All'>('All');
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);

  const chcMap = useMemo(() => new Map(chcs.map(c => [c.id, c.name])), [chcs]);

  const filteredMachines = useMemo(() => {
    return machines
      .filter(machine => {
        if (statusFilter !== 'All' && machine.status !== statusFilter) return false;
        if (typeFilter !== 'All' && machine.type !== typeFilter) return false;
        if (chcFilter !== 'All' && machine.chcId !== chcFilter) return false;
        return true;
      })
      .filter(machine => {
        const chcName = chcMap.get(machine.chcId) || '';
        const opName = machine.telemetry?.operatorName || '';
        return (
          machine.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          machine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          chcName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          opName.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
  }, [machines, searchTerm, chcMap, statusFilter, typeFilter, chcFilter]);

  const getStatusBadge = (status: MachineStatus) => {
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
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by ID, name, operator..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
            {(['All', MachineStatus.InUse, MachineStatus.Idle, MachineStatus.Maintenance] as const).map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-2.5 py-1 rounded font-medium whitespace-nowrap transition-colors ${
                  statusFilter === status
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Type dropdown */}
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
          >
            <option value="All">All Machine Types</option>
            {Object.values(MachineType).map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          {/* CHC Hub dropdown */}
          <select
            value={chcFilter}
            onChange={e => setChcFilter(e.target.value === 'All' ? 'All' : Number(e.target.value))}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
          >
            <option value="All">All CHC Hubs</option>
            {chcs.map(chc => (
              <option key={chc.id} value={chc.id}>
                {chc.district} Hub
              </option>
            ))}
          </select>

          {/* Add Machine Button */}
          <button
            onClick={onOpenAddMachine}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition-colors shadow-xs ml-auto md:ml-0"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Register Machine</span>
          </button>
        </div>
      </div>

      {/* High-Density Machines Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        {filteredMachines.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            No machines match your active filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-4 py-3">Machine & Implement</th>
                  <th className="px-4 py-3">Custom Hiring Center</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Telemetry Speed</th>
                  <th className="px-4 py-3 text-right">Fuel Level</th>
                  <th className="px-4 py-3 text-right">Today's Area</th>
                  <th className="px-4 py-3">Operator</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMachines.map(machine => (
                  <tr
                    key={machine.id}
                    onClick={() => onSelectMachine(machine)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    {/* Machine & Implement */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-md bg-slate-100 text-slate-700">
                          <Tractor className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{machine.name}</p>
                          <p className="text-[11px] font-mono text-slate-500">
                            {machine.id} · <span className="font-sans">{machine.type}</span>
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* CHC Hub */}
                    <td className="px-4 py-3">
                      <p className="text-slate-800 font-medium">{chcMap.get(machine.chcId)}</p>
                      <p className="text-[11px] text-slate-400">
                        Active {timeAgo(machine.lastActive)}
                      </p>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-md border font-medium text-xs ${getStatusBadge(machine.status)}`}>
                        {machine.status}
                      </span>
                    </td>

                    {/* Speed */}
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-800">
                      {machine.telemetry.speedKmH} km/h
                    </td>

                    {/* Fuel */}
                    <td className="px-4 py-3 text-right font-mono tabular-nums">
                      <span
                        className={
                          machine.telemetry.fuelPercent < 25
                            ? 'text-rose-600 font-bold'
                            : 'text-slate-800'
                        }
                      >
                        {machine.telemetry.fuelPercent}%
                      </span>
                    </td>

                    {/* Today's Area */}
                    <td className="px-4 py-3 text-right font-mono tabular-nums text-emerald-700 font-medium">
                      {machine.telemetry.acresCoveredToday} ac
                    </td>

                    {/* Operator */}
                    <td className="px-4 py-3">
                      <p className="text-slate-800 font-medium">{machine.telemetry.operatorName}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{machine.telemetry.operatorPhone}</p>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => onSelectMachine(machine)}
                          className="px-2.5 py-1 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors border border-slate-200"
                        >
                          Inspect
                        </button>
                        {onDeleteMachine && (
                          <>
                            {confirmingDeleteId === machine.id ? (
                              <div className="flex items-center gap-1 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                                <span className="text-[11px] text-rose-700 font-medium">Remove?</span>
                                <button
                                  onClick={() => {
                                    onDeleteMachine(machine.id);
                                    setConfirmingDeleteId(null);
                                  }}
                                  className="px-1.5 py-0.5 bg-rose-600 text-white rounded text-[10px] font-bold"
                                >
                                  Yes
                                </button>
                                <button
                                  onClick={() => setConfirmingDeleteId(null)}
                                  className="px-1 text-slate-500 hover:text-slate-800 text-[10px]"
                                >
                                  No
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setConfirmingDeleteId(machine.id)}
                                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors border border-transparent hover:border-rose-200"
                                title="Remove machine from fleet"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MachineList;
