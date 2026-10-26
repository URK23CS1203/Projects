
import React, { useMemo } from 'react';
import { Machine } from '../types';
import { MachineStatus } from '../types';
import { Tractor, Power, PowerOff, Wrench } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: number | string;
  icon: React.ElementType;
  iconBgColor: string;
  iconColor: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon: Icon, iconBgColor, iconColor }) => (
  <div className="bg-white p-4 rounded-lg shadow-md flex items-center space-x-4">
    <div className={`p-3 rounded-lg ${iconBgColor}`}>
      <Icon className={`h-6 w-6 ${iconColor}`} />
    </div>
    <div>
      <p className="text-gray-500 text-sm font-medium">{title}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);


const DashboardMetrics: React.FC<{ machines: Machine[] }> = ({ machines }) => {
  const metrics = useMemo(() => {
    const totalMachines = machines.length;
    const inUse = machines.filter(m => m.status === MachineStatus.InUse).length;
    const idle = machines.filter(m => m.status === MachineStatus.Idle).length;
    const maintenance = machines.filter(m => m.status === MachineStatus.Maintenance).length;
    return { totalMachines, inUse, idle, maintenance };
  }, [machines]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard title="Total Machines" value={metrics.totalMachines} icon={Tractor} iconBgColor="bg-blue-100" iconColor="text-blue-600" />
      <MetricCard title="In Use" value={metrics.inUse} icon={Power} iconBgColor="bg-green-100" iconColor="text-green-600" />
      <MetricCard title="Idle" value={metrics.idle} icon={PowerOff} iconBgColor="bg-yellow-100" iconColor="text-yellow-600" />
      <MetricCard title="Maintenance" value={metrics.maintenance} icon={Wrench} iconBgColor="bg-red-100" iconColor="text-red-600" />
    </div>
  );
};

export default DashboardMetrics;
