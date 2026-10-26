import React from 'react';
import { ActiveNavTab } from '../types';
import { Tractor, Play, Pause, Download, Plus } from 'lucide-react';

interface HeaderProps {
  activeTab: ActiveNavTab;
  onSelectTab: (tab: ActiveNavTab) => void;
  isSimulating: boolean;
  onToggleSimulation: () => void;
  simulationSpeed: number;
  onChangeSpeed: (speed: number) => void;
  onOpenAddMachine: () => void;
  onExportCsv: () => void;
}

const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  isSimulating,
  onToggleSimulation,
  simulationSpeed,
  onChangeSpeed,
  onOpenAddMachine,
  onExportCsv,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-6 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
        {/* Zone 1: Brand wordmark (single element, whitespace-nowrap shrink-0) */}
        <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
          <div className="bg-emerald-600 text-white p-1.5 rounded-lg flex items-center justify-center">
            <Tractor className="h-5 w-5" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-slate-900 block leading-tight">
              AgriTrack CRM
            </span>
            <span className="text-[11px] text-slate-500 hidden sm:block leading-none">
              National Crop Residue Telemetry Portal
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links (single-line, clean unboxed hover states) */}
        <nav className="hidden lg:flex items-center gap-1">
          <button
            onClick={() => onSelectTab('operations')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'operations'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Operations Map
          </button>
          <button
            onClick={() => onSelectTab('hotspots')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'hotspots'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Stubble Hotspots
          </button>
          <button
            onClick={() => onSelectTab('bookings')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'bookings'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Farmer Bookings
          </button>
          <button
            onClick={() => onSelectTab('analytics')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'analytics'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Impact & Progress
          </button>
          <button
            onClick={() => onSelectTab('fleet')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'fleet'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Fleet Telemetry
          </button>
        </nav>

        {/* Zone 3: Primary Action & Live Telemetry Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Simulation controller */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg">
            <button
              onClick={onToggleSimulation}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                isSimulating
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title={isSimulating ? 'Pause Telemetry Simulation' : 'Resume Telemetry Simulation'}
            >
              {isSimulating ? <Pause className="h-3.5 w-3.5 text-emerald-600" /> : <Play className="h-3.5 w-3.5 text-slate-600" />}
              <span className="hidden sm:inline font-mono tabular-nums">{isSimulating ? 'Live IoT' : 'Paused'}</span>
            </button>

            {isSimulating && (
              <div className="hidden sm:flex items-center border-l border-slate-200 ml-1 pl-1">
                {[1, 2, 5].map(speed => (
                  <button
                    key={speed}
                    onClick={() => onChangeSpeed(speed)}
                    className={`px-1.5 py-0.5 text-[11px] font-mono rounded ${
                      simulationSpeed === speed
                        ? 'font-bold text-emerald-700 bg-white'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Add Machine Button */}
          <button
            onClick={onOpenAddMachine}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors whitespace-nowrap shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Register Machine</span>
            <span className="sm:hidden">Add</span>
          </button>

          {/* Export Report */}
          <button
            onClick={onExportCsv}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
            title="Export Telemetry Data (CSV)"
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Mobile nav bar */}
      <div className="lg:hidden flex items-center justify-around pt-3 mt-3 border-t border-slate-100 text-xs overflow-x-auto gap-2">
        <button
          onClick={() => onSelectTab('operations')}
          className={`py-1 px-2 whitespace-nowrap rounded ${activeTab === 'operations' ? 'font-bold text-emerald-700 bg-emerald-50' : 'text-slate-600'}`}
        >
          Map
        </button>
        <button
          onClick={() => onSelectTab('hotspots')}
          className={`py-1 px-2 whitespace-nowrap rounded ${activeTab === 'hotspots' ? 'font-bold text-emerald-700 bg-emerald-50' : 'text-slate-600'}`}
        >
          Hotspots
        </button>
        <button
          onClick={() => onSelectTab('bookings')}
          className={`py-1 px-2 whitespace-nowrap rounded ${activeTab === 'bookings' ? 'font-bold text-emerald-700 bg-emerald-50' : 'text-slate-600'}`}
        >
          Bookings
        </button>
        <button
          onClick={() => onSelectTab('analytics')}
          className={`py-1 px-2 whitespace-nowrap rounded ${activeTab === 'analytics' ? 'font-bold text-emerald-700 bg-emerald-50' : 'text-slate-600'}`}
        >
          Impact
        </button>
        <button
          onClick={() => onSelectTab('fleet')}
          className={`py-1 px-2 whitespace-nowrap rounded ${activeTab === 'fleet' ? 'font-bold text-emerald-700 bg-emerald-50' : 'text-slate-600'}`}
        >
          Fleet
        </button>
      </div>
    </header>
  );
};

export default Header;
