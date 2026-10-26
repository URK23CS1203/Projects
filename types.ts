export enum MachineStatus {
  InUse = 'In Use',
  Idle = 'Idle',
  Maintenance = 'Maintenance',
}

export enum MachineType {
  HappySeeder = 'Happy Seeder',
  SuperSMS = 'Super SMS',
  PaddyStrawChopper = 'Paddy Straw Chopper',
  ReversibleMBPlough = 'Reversible MB Plough',
  ZeroTillDrill = 'Zero Till Drill',
  Baler = 'Baler & Rake',
  Mulcher = 'Mulcher / Shredder',
  SmartSeeder = 'Smart Seeder',
  Tractor = 'Tractor (50+ HP)',
}

export interface Location {
  lat: number;
  lng: number;
}

export interface Telemetry {
  speedKmH: number;
  fuelPercent: number;
  engineHours: number;
  acresCoveredToday: number;
  tonsResidueManaged: number;
  co2SavedKg: number;
  operatorName: string;
  operatorPhone: string;
  gpsSignal: 'Strong' | 'Moderate' | 'Weak';
  batteryPercent: number;
  tempCelsius: number;
}

export interface Machine {
  id: string;
  schemeRegNo: string;
  name: string;
  type: MachineType;
  status: MachineStatus;
  location: Location;
  chcId: number;
  lastActive: Date;
  telemetry: Telemetry;
  pathTrail: Location[];
  assignedHotspotId?: string;
  assignedBookingId?: string;
}

export interface CHC {
  id: number;
  name: string;
  location: Location;
  district: string;
  state: string;
  contactPerson: string;
  phone: string;
  totalMachines: number;
  subsidySanctioned: string;
}

export type FireConfidence = 'High' | 'Medium' | 'Critical';
export type HotspotDispatchStatus = 'Unassigned' | 'Dispatched' | 'On Site' | 'Extinguished';

export interface StubbleHotspot {
  id: string;
  location: Location;
  village: string;
  district: string;
  state: string;
  confidence: FireConfidence;
  detectedAt: Date;
  acresAtRisk: number;
  dispatchStatus: HotspotDispatchStatus;
  assignedMachineId?: string;
}

export type BookingStatus = 'Pending' | 'Approved' | 'Dispatched' | 'In Progress' | 'Completed';

export interface FarmerBooking {
  id: string;
  farmerName: string;
  village: string;
  district: string;
  state: string;
  phone: string;
  farmSizeAcres: number;
  cropType: string;
  requiredMachineType: MachineType;
  urgency: 'Immediate (<24h)' | 'Scheduled (2-3 days)' | 'Flexible';
  bookingDate: Date;
  status: BookingStatus;
  assignedMachineId?: string;
  assignedChcId: number;
}

export type ActiveNavTab = 'operations' | 'hotspots' | 'bookings' | 'analytics' | 'fleet';
