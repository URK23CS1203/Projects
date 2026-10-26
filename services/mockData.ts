
import { Machine, MachineStatus, MachineType, CHC, Location } from '../types';

export const CHCS: CHC[] = [
  { id: 1, name: 'Haryana Farm Solutions', location: { lat: 29.96, lng: 76.80 } },
  { id: 2, name: 'Green Fields CHC', location: { lat: 30.90, lng: 75.85 } },
  { id: 3, name: 'UP Agri-Tech Hub', location: { lat: 26.84, lng: 80.94 } },
  { id: 4, name: 'Punjab Agro Center', location: { lat: 30.33, lng: 76.38 } },
];

const machineTypes = Object.values(MachineType);

const getRandomElement = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const generateRandomLocation = (center: Location, radius: number): Location => {
  return {
    lat: center.lat + (Math.random() - 0.5) * radius * 2,
    lng: center.lng + (Math.random() - 0.5) * radius * 2,
  };
};

export const generateInitialMachines = (): Machine[] => {
  const machines: Machine[] = [];
  const typeCounters: Record<string, number> = {};

  for (let i = 1; i <= 100; i++) {
    const chc = getRandomElement(CHCS);
    const type = getRandomElement(machineTypes);
    
    typeCounters[type] = (typeCounters[type] || 0) + 1;
    const machineNumber = typeCounters[type];

    let status: MachineStatus;
    const rand = Math.random();
    if (rand < 0.33) {
        status = MachineStatus.Maintenance;
    } else if (rand < 0.67) {
        status = MachineStatus.InUse;
    } else {
        status = MachineStatus.Idle;
    }

    machines.push({
      id: `CRM-2024-${String(1000 + i).slice(1)}`,
      name: `${type} #${machineNumber}`,
      type: type,
      status: status,
      location: generateRandomLocation(chc.location, 0.2),
      chcId: chc.id,
      lastActive: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 7), // last active within a week
    });
  }
  return machines;
};
