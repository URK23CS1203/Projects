import React, { useMemo } from 'react';
import { Machine, CHC, StubbleHotspot, FarmerBooking, MachineType } from '../types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Trees,
  CloudRain,
  Flame,
  Award,
  CheckCircle,
  TrendingDown,
  Building2,
} from 'lucide-react';

interface EnvironmentalImpactViewProps {
  machines: Machine[];
  chcs: CHC[];
  hotspots: StubbleHotspot[];
  bookings: FarmerBooking[];
}

export const EnvironmentalImpactView: React.FC<EnvironmentalImpactViewProps> = ({
  machines,
  chcs,
  hotspots,
  bookings,
}) => {
  // Aggregate stats
  const aggregateStats = useMemo(() => {
    const totalAcresToday = machines.reduce((acc, m) => acc + (m.telemetry?.acresCoveredToday || 0), 0);
    const totalResidueTons = machines.reduce((acc, m) => acc + (m.telemetry?.tonsResidueManaged || 0), 0);
    const totalCo2SavedKg = machines.reduce((acc, m) => acc + (m.telemetry?.co2SavedKg || 0), 0);
    const pm25PreventedKg = +(totalResidueTons * 3.8).toFixed(1); // approx 3.8kg PM2.5 per ton burnt straw

    // State season targets
    const seasonTargetAcres = 85000;
    const seasonCumulativeAcres = 42800 + Math.round(totalAcresToday);
    const progressPercent = Math.round((seasonCumulativeAcres / seasonTargetAcres) * 100);

    return {
      totalAcresToday: +totalAcresToday.toFixed(1),
      totalResidueTons: +totalResidueTons.toFixed(1),
      totalCo2Tonnes: +(totalCo2SavedKg / 1000).toFixed(1),
      pm25PreventedKg,
      seasonCumulativeAcres,
      seasonTargetAcres,
      progressPercent,
    };
  }, [machines]);

  // Implement Breakdown Data
  const implementData = useMemo(() => {
    const counts: Record<string, number> = {};
    machines.forEach(m => {
      counts[m.type] = (counts[m.type] || 0) + (m.telemetry?.tonsResidueManaged || 0);
    });

    return Object.entries(counts).map(([name, tons]) => ({
      name,
      tons: +tons.toFixed(1),
    })).sort((a, b) => b.tons - a.tons);
  }, [machines]);

  // District Progress Data
  const districtProgress = useMemo(() => {
    return chcs.map(chc => {
      const chcMachines = machines.filter(m => m.chcId === chc.id);
      const acres = chcMachines.reduce((sum, m) => sum + (m.telemetry?.acresCoveredToday || 0), 0);
      const tons = chcMachines.reduce((sum, m) => sum + (m.telemetry?.tonsResidueManaged || 0), 0);
      const fireCount = hotspots.filter(h => h.district === chc.district).length;

      return {
        district: chc.district,
        state: chc.state,
        chcName: chc.name,
        machines: chcMachines.length,
        acresManaged: +acres.toFixed(1),
        tonsManaged: +tons.toFixed(1),
        activeFires: fireCount,
      };
    });
  }, [chcs, machines, hotspots]);

  // Daily Trend Mock Data
  const trendData = [
    { day: 'Day 1', processedTons: 180, fireEvents: 42 },
    { day: 'Day 2', processedTons: 220, fireEvents: 38 },
    { day: 'Day 3', processedTons: 310, fireEvents: 29 },
    { day: 'Day 4', processedTons: 405, fireEvents: 22 },
    { day: 'Day 5', processedTons: 490, fireEvents: 18 },
    { day: 'Day 6', processedTons: 580, fireEvents: 14 },
    { day: 'Today', processedTons: Math.round(aggregateStats.totalResidueTons + 450), fireEvents: hotspots.length },
  ];

  const COLORS = ['#059669', '#0d9488', '#0284c7', '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#84cc16'];

  return (
    <div className="space-y-6">
      {/* Target Progress Bar Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              National CRM Scheme Working Progress · In-Situ Paddy Straw Target
            </h2>
            <p className="text-xs text-slate-500">
              Department of Agriculture & Farmers Welfare seasonal target across Punjab, Haryana & Western UP
            </p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold font-mono text-emerald-700 tabular-nums">
              {aggregateStats.progressPercent}%
            </span>
            <span className="text-xs text-slate-500 block">Season Target Achieved</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
          <div
            className="bg-emerald-600 h-3 rounded-full transition-all duration-700"
            style={{ width: `${Math.min(aggregateStats.progressPercent, 100)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 mt-2 font-mono tabular-nums">
          <span>{aggregateStats.seasonCumulativeAcres.toLocaleString()} Acres Managed</span>
          <span>Target: {aggregateStats.seasonTargetAcres.toLocaleString()} Acres</span>
        </div>
      </div>

      {/* Environmental Benefits Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
            <Trees className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">CO₂ Greenhouse Gas Saved</span>
            <p className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {aggregateStats.totalCo2Tonnes} <span className="text-xs font-normal text-slate-500">Tonnes</span>
            </p>
            <p className="text-[11px] text-emerald-700 mt-0.5">Equivalent to ~18,000 car-free miles</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-teal-50 text-teal-700 rounded-xl">
            <CloudRain className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Toxic PM2.5 Prevented</span>
            <p className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {aggregateStats.pm25PreventedKg} <span className="text-xs font-normal text-slate-500">kg</span>
            </p>
            <p className="text-[11px] text-teal-700 mt-0.5">Direct Delhi/NCR air quality protection</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-rose-700 rounded-xl">
            <TrendingDown className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Stubble Fires Reduction</span>
            <p className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              -64.2%
            </p>
            <p className="text-[11px] text-rose-700 mt-0.5">Compared to historical 2021 baseline</p>
          </div>
        </div>
      </div>

      {/* Two Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Progression: Straw Processed vs Active Fire Events */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">
            Residue Managed vs Fire Hotspots Reduction
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Correlation showing rapid machine deployment dampening fire occurrences
          </p>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                <YAxis yAxisId="left" stroke="#94a3b8" fontSize={11} />
                <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.5rem',
                    fontSize: '12px',
                  }}
                />
                <Legend iconType="circle" iconSize={8} />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="processedTons"
                  name="Residue Managed (Tons)"
                  stroke="#059669"
                  fill="#d1fae5"
                />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="fireEvents"
                  name="Active Fire Anomalies"
                  stroke="#e11d48"
                  fill="#ffe4e6"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Residue Processed by Implement Type */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">
            Residue Processed by CRM Implement Type (Tons)
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Contribution of Happy Seeder, Baler, Super SMS, and Choppers
          </p>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <BarChart data={implementData} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={11} width={100} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.5rem',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="tons" fill="#059669" radius={[0, 4, 4, 0]} name="Managed (Tons)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* District Performance Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 bg-slate-50/70">
          <h3 className="text-sm font-bold text-slate-900">
            District Custom Hiring Center (CHC) Performance Matrix
          </h3>
          <p className="text-xs text-slate-500">
            Comparative performance across priority districts in Punjab, Haryana, and Uttar Pradesh
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-4 py-3">District & State</th>
                <th className="px-4 py-3">Designated CHC</th>
                <th className="px-4 py-3 text-center">Fleet Size</th>
                <th className="px-4 py-3 text-right">Area Managed Today</th>
                <th className="px-4 py-3 text-right">Residue Processed</th>
                <th className="px-4 py-3 text-center">Active Fire Hotspots</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {districtProgress.map(row => (
                <tr key={row.district} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3 font-bold text-slate-900">
                    {row.district} <span className="font-normal text-slate-500">({row.state})</span>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{row.chcName}</td>
                  <td className="px-4 py-3 text-center font-mono tabular-nums text-slate-800">
                    {row.machines} units
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-emerald-700 font-semibold">
                    {row.acresManaged} Acres
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums text-slate-800">
                    {row.tonsManaged} Tons
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`font-mono text-xs px-2 py-0.5 rounded ${
                        row.activeFires > 0
                          ? 'bg-rose-100 text-rose-800 font-bold'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {row.activeFires}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
