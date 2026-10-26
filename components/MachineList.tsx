
import React, { useState, useMemo } from 'react';
import { Machine, CHC } from '../types';
import { MachineStatus } from '../types';
import { Search, Plus } from 'lucide-react';

const StatusBadge: React.FC<{ status: MachineStatus }> = ({ status }) => {
  const statusClasses = {
    [MachineStatus.InUse]: 'bg-green-100 text-green-700',
    [MachineStatus.Idle]: 'bg-yellow-100 text-yellow-700',
    [MachineStatus.Maintenance]: 'bg-red-100 text-red-700',
  };
  return <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusClasses[status]}`}>{status}</span>;
};

const timeAgo = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

const MachineList: React.FC<MachineListProps> = ({ machines, chcs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<MachineStatus | 'All'>('All');
  
  const chcMap = useMemo(() => new Map(chcs.map(c => [c.id, c.name])), [chcs]);

  const filteredMachines = useMemo(() => {
    return machines
      .filter(machine => {
        if (activeFilter === 'All') return true;
        return machine.status === activeFilter;
      })
      .filter(machine => {
        const chcName = chcMap.get(machine.chcId) || '';
        return (
          machine.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          machine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          chcName.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
  }, [machines, searchTerm, chcMap, activeFilter]);
  
  const filters: (MachineStatus | 'All')[] = ['All', MachineStatus.InUse, MachineStatus.Idle, MachineStatus.Maintenance];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or ID..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-gray-100 border border-gray-200 rounded-md py-2 pl-9 pr-4 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:outline-none"
          />
        </div>
        <button className="ml-4 flex items-center bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
            <Plus className="h-4 w-4 mr-1" />
            Add
        </button>
      </div>
      
      <div className="flex space-x-1 border-b border-gray-200">
        {filters.map(filter => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-3 py-2 text-sm font-medium transition-colors ${
              activeFilter === filter
                ? 'border-b-2 border-green-600 text-green-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="overflow-y-auto max-h-[400px] -mr-3 pr-3">
        <ul className="divide-y divide-gray-200">
          {filteredMachines.map(machine => (
            <li key={machine.id} className="p-3 hover:bg-gray-50 rounded-md">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-gray-800">{machine.name}</p>
                  <p className="text-sm text-gray-500">{chcMap.get(machine.chcId)}</p>
                </div>
                <div className="text-right">
                    <StatusBadge status={machine.status} />
                    <p className="text-xs text-gray-400 mt-1">
                      {timeAgo(machine.lastActive)}
                    </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

interface MachineListProps {
  machines: Machine[];
  chcs: CHC[];
}

export default MachineList;
