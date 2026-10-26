
export enum MachineStatus {
  InUse = 'In Use',
  Idle = 'Idle',
  Maintenance = 'Maintenance',
}

export enum MachineType {
  Tractor = 'Tractor',
  Harvester = 'Harvester',
  Baler = 'Baler',
  Seeder = 'Seeder',
  Plough = 'Plough',
}

export interface Location {
  lat: number;
  lng: number;
}

export interface Machine {
  id: string;
  name: string;
  type: MachineType;
  status: MachineStatus;
  location: Location;
  chcId: number;
  lastActive: Date;
}

export interface CHC {
  id: number;
  name: string;
  location: Location;
}
