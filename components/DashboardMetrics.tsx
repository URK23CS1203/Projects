import React, { useMemo } from 'react';
import { Machine, MachineStatus, StubbleHotspot, FarmerBooking } from '../types';
import { Tractor, Flame, Trees, CheckCircle2, TrendingUp } from 'lucide-react';

interface DashboardMetricsProps {
  machines: Machine[];
  hotspots: StubbleHotspot[];
  bookings: FarmerBooking[];
}

const DashboardMetrics: React.FC<DashboardMetricsProps> = ({ machines, hotspots, bookings }) => {
  const metrics = useMemo(() => {
    const total = machines.length;
    const inUse = machines.filter(m => m.status === MachineStatus.InUse).length;
    const idle = machines.filter(m => m.status === MachineStatus.Idle).length;
    const maintenance = machines.filter(m => m.status === MachineStatus.Maintenance).length;
    const utilizationRate = total > 0 ? Math.round((inUse / total) * 100) : 0;

    const totalAcresToday = machines.reduce((acc, m) => acc + (m.telemetry?.acresCoveredToday || 0), 0);
    const totalResidueTons = machines.reduce((acc, m) => acc + (m.telemetry?.tonsResidueManaged || 0), 0);
    const totalCo2SavedKg = machines.reduce((acc, m) => acc + (m.telemetry?.co2SavedKg || 0), 0);

    const activeFires = hotspots.filter(h => h.dispatchStatus === 'Unassigned' || h.dispatchStatus === 'Dispatched').length;
    const extinguishedFires = hotspots.filter(h => h.dispatchStatus === 'Extinguished').length;

    const pendingBookings = bookings.filter(b => b.status === 'Pending').length;

    return {
      total,
      inUse,
      idle,
      maintenance,
      utilizationRate,
      totalAcresToday: +totalAcresToday.toFixed(1),
      totalResidueTons: +totalResidueTons.toFixed(1),
      totalCo2SavedTonnes: +(totalCo2SavedKg / 1000).toFixed(1),
      activeFires,
      extinguishedFires,
      pendingBookings,
    };
  }, [machines, hotspots, bookings]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Metric 1: Fleet Utilization */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Active Fleet Utilization
          </span>
          <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
            <Tractor className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {metrics.utilizationRate}%
            </span>
            <span className="text-xs text-slate-500 font-mono tabular-nums">
              ({metrics.inUse} of {metrics.total} active)
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2.5 overflow-hidden">
            <div
              className="bg-emerald-600 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${metrics.utilizationRate}%` }}
            />
          </div>
        </div>
        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>{metrics.idle} standby</span>
          <span aria-hidden="true">·</span>
          <span>{metrics.maintenance} maintenance</span>
        </div>
      </div>

      {/* Metric 2: Today's In-Situ Residue Management */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Residue Managed Today
          </span>
          <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
            <TrendingUp className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {metrics.totalResidueTons}
            </span>
            <span className="text-xs font-medium text-slate-600">Metric Tonnes</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Across <span className="font-mono font-medium text-slate-700 tabular-nums">{metrics.totalAcresToday} acres</span> today
          </p>
        </div>
        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Target pace: On track</span>
          <span aria-hidden="true">·</span>
          <span>~2.2 t/acre yield</span>
        </div>
      </div>

      {/* Metric 3: Stubble Fire Hotspot Alerts */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Satellite Fire Hotspots
          </span>
          <div className="p-1.5 rounded-lg bg-rose-50 text-rose-700">
            <Flame className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {metrics.activeFires}
            </span>
            <span className="text-xs font-medium text-rose-600">Active Thermal Anomaly</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            NASA VIIRS / ISRO FIRMS feed
          </p>
        </div>
        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>{metrics.extinguishedFires} contained</span>
          <span aria-hidden="true">·</span>
          <span>100% dispatch rate</span>
        </div>
      </div>

      {/* Metric 4: Environmental & Emissions Benefit */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            CO₂ & Smoke Averted
          </span>
          <div className="p-1.5 rounded-lg bg-teal-50 text-teal-700">
            <Trees className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {metrics.totalCo2SavedTonnes}
            </span>
            <span className="text-xs font-medium text-teal-700">Tonnes CO₂ eq</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {metrics.pendingBookings} pending farmer bookings
          </p>
        </div>
        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Clean air benefit</span>
          <span aria-hidden="true">·</span>
          <span>Zero in-field burning</span>
        </div>
      </div>
    </div>
  );
};

export default DashboardMetrics;
