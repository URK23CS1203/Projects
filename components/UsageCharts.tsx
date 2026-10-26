
import React, { useMemo } from 'react';
import { Machine, MachineStatus, MachineType } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';

const UsageCharts: React.FC<{ machines: Machine[] }> = ({ machines }) => {
    const data = useMemo(() => {
        const typeUsage = new Map<MachineType, { 'In Use': number, 'Idle': number }>();

        // Initialize map for all machine types
        Object.values(MachineType).forEach(type => {
            typeUsage.set(type, { 'In Use': 0, 'Idle': 0 });
        });
        
        machines.forEach(machine => {
            if (machine.status === MachineStatus.InUse || machine.status === MachineStatus.Idle) {
                const usage = typeUsage.get(machine.type)!;
                usage[machine.status]++;
            }
        });

        return Array.from(typeUsage.entries()).map(([name, values]) => ({
            name,
            ...values,
        }));
    }, [machines]);

    return (
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <Tooltip
                        cursor={{ fill: 'rgba(209, 213, 219, 0.5)' }}
                        contentStyle={{
                            backgroundColor: '#fff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '0.5rem',
                        }}
                    />
                    <Legend iconType="circle" iconSize={8} />
                    <Bar dataKey="Idle" fill="#f59e0b" name="Idle" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="In Use" fill="#16a34a" name="In Use" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default UsageCharts;
