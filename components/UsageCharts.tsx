import React, { useMemo } from 'react';
import { Machine, MachineStatus, MachineType } from '../types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

interface UsageChartsProps {
  machines: Machine[];
}

const UsageCharts: React.FC<UsageChartsProps> = ({ machines }) => {
  const data = useMemo(() => {
    const typeUsage = new Map<MachineType, { 'In Use': number; Idle: number; Maintenance: number }>();

    Object.values(MachineType).forEach(type => {
      typeUsage.set(type, { 'In Use': 0, Idle: 0, Maintenance: 0 });
    });

    machines.forEach(machine => {
      const usage = typeUsage.get(machine.type);
      if (usage) {
        usage[machine.status]++;
      }
    });

    return Array.from(typeUsage.entries()).map(([name, values]) => ({
      name,
      ...values,
      total: values['In Use'] + values.Idle + values.Maintenance,
    }));
  }, [machines]);

  return (
    <div style={{ width: '100%', height: 320 }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 25 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis
            dataKey="name"
            stroke="#64748b"
            fontSize={10}
            angle={-20}
            textAnchor="end"
            interval={0}
          />
          <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
          <Tooltip
            cursor={{ fill: 'rgba(241, 245, 249, 0.6)' }}
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: '0.5rem',
              fontSize: '12px',
            }}
          />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ paddingBottom: '12px', fontSize: '12px' }}
          />
          <Bar dataKey="In Use" fill="#059669" name="In Field" radius={[3, 3, 0, 0]} stackId="a" />
          <Bar dataKey="Idle" fill="#d97706" name="Standby / Ready" radius={[3, 3, 0, 0]} stackId="a" />
          <Bar dataKey="Maintenance" fill="#e11d48" name="Maintenance" radius={[3, 3, 0, 0]} stackId="a" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default UsageCharts;
