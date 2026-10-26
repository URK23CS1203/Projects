
import React, { useState, useEffect, useMemo } from 'react';
import { Machine, CHC } from './types';
import { generateInitialMachines, CHCS } from './services/mockData';
import Header from './components/Header';
import DashboardMetrics from './components/DashboardMetrics';
import MachineMap from './components/MachineMap';
import UsageCharts from './components/UsageCharts';
import MachineList from './components/MachineList';
import { MachineStatus } from './types';

const CHCPerformance: React.FC<{ machines: Machine[]; chcs: CHC[] }> = ({ machines, chcs }) => {
  
  const performanceData = useMemo(() => {
    return chcs.map(chc => {
      const chcMachines = machines.filter(m => m.chcId === chc.id);
      const inUseCount = chcMachines.filter(m => m.status === MachineStatus.InUse).length;
      const totalCount = chcMachines.length;
      const utilization = totalCount > 0 ? Math.round((inUseCount / totalCount) * 100) : 0;
      return {
        ...chc,
        machineCount: totalCount,
        utilization: utilization,
      };
    }).sort((a, b) => b.utilization - a.utilization);
  }, [machines, chcs]);

  return (
    <div className="space-y-4">
        <div className="grid grid-cols-12 px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <div className="col-span-6">CHC Name</div>
            <div className="col-span-3 text-center">Machines</div>
            <div className="col-span-3 text-center">Utilization</div>
        </div>
        <ul className="space-y-2">
            {performanceData.map(chc => (
                <li key={chc.id} className="grid grid-cols-12 items-center px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="col-span-6 font-medium text-gray-800">{chc.name}</div>
                    <div className="col-span-3 text-center text-gray-600">{chc.machineCount}</div>
                    <div className="col-span-3">
                        <div className="flex items-center justify-between">
                            <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${chc.utilization}%` }}></div>
                            </div>
                            <span className="text-sm font-semibold text-gray-700 w-10 text-right">{chc.utilization}%</span>
                        </div>
                    </div>
                </li>
            ))}
        </ul>
    </div>
  );
};


const App: React.FC = () => {
  const [machines, setMachines] = useState<Machine[]>([]);

  useEffect(() => {
    setMachines(generateInitialMachines());
  }, []);

  useEffect(() => {
    const simulationInterval = setInterval(() => {
      setMachines(prevMachines =>
        prevMachines.map(machine => {
          // Maintenance machines don't change status automatically
          if (machine.status === MachineStatus.Maintenance) {
            if (Math.random() < 0.01) { // Occasionally finish maintenance
                return { ...machine, status: MachineStatus.Idle };
            }
            return machine;
          }

          // FIX: Explicitly type `newStatus` to avoid incorrect type inference by TypeScript.
          let newStatus: MachineStatus = machine.status;
          let newLocation = machine.location;
          let newLastActive = machine.lastActive;

          if (machine.status === MachineStatus.InUse) {
            // Occasionally change status of an in-use machine to idle
            if (Math.random() < 0.05) {
              newStatus = MachineStatus.Idle;
            } else if (Math.random() < 0.005) { // Very rarely go into maintenance
              newStatus = MachineStatus.Maintenance;
            } else {
              // Simulate movement for machines in use
              newLocation = {
                lat: machine.location.lat + (Math.random() - 0.5) * 0.001,
                lng: machine.location.lng + (Math.random() - 0.5) * 0.001,
              };
              newLastActive = new Date(); // Update last active when moving
            }
          }
          
          if (machine.status === MachineStatus.Idle) {
            // Occasionally change status of an idle machine to in-use
            if (Math.random() < 0.02) {
              newStatus = MachineStatus.InUse;
              newLastActive = new Date(); // Update last active when starting use
            }
          }

          return { ...machine, status: newStatus, location: newLocation, lastActive: newLastActive };
        })
      );
    }, 2000); // Update every 2 seconds

    return () => clearInterval(simulationInterval);
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen font-sans">
      <Header />
      <main className="p-4 sm:p-6 lg:p-8">
        <DashboardMetrics machines={machines} />
        
        <div className="mt-8 grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="xl:col-span-2 space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-md h-[450px]">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Machine Locations</h2>
              <MachineMap machines={machines} />
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
               <h2 className="text-xl font-semibold text-gray-800 mb-4">CHC Performance</h2>
               <CHCPerformance machines={machines} chcs={CHCS} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="xl:col-span-1 space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Daily Usage by Type</h2>
              <UsageCharts machines={machines} />
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-4">
                 <h2 className="text-xl font-semibold text-gray-800">Machine Fleet</h2>
              </div>
              <MachineList machines={machines} chcs={CHCS} />
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;
