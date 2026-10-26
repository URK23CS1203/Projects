import {
  Machine,
  MachineStatus,
  MachineType,
  CHC,
  Location,
  StubbleHotspot,
  FarmerBooking,
} from '../types';

export const CHCS: CHC[] = [
  {
    id: 1,
    name: 'Karnal Agri Cooperative CHC',
    location: { lat: 29.6857, lng: 76.9905 },
    district: 'Karnal',
    state: 'Haryana',
    contactPerson: 'Harpreet Singh',
    phone: '+91 98721-43210',
    totalMachines: 24,
    subsidySanctioned: '₹28.4 Lakhs',
  },
  {
    id: 2,
    name: 'Ludhiana Central Farm Hub',
    location: { lat: 30.9010, lng: 75.8573 },
    district: 'Ludhiana',
    state: 'Punjab',
    contactPerson: 'Gurinder Dhillon',
    phone: '+91 98140-54321',
    totalMachines: 32,
    subsidySanctioned: '₹37.8 Lakhs',
  },
  {
    id: 3,
    name: 'Sangrur Agro Services Society',
    location: { lat: 30.2458, lng: 75.8421 },
    district: 'Sangrur',
    state: 'Punjab',
    contactPerson: 'Baldev Mann',
    phone: '+91 94172-88190',
    totalMachines: 28,
    subsidySanctioned: '₹32.5 Lakhs',
  },
  {
    id: 4,
    name: 'Kaithal Krishi Vikas Kendra',
    location: { lat: 29.8015, lng: 76.3996 },
    district: 'Kaithal',
    state: 'Haryana',
    contactPerson: 'Rajesh Sharma',
    phone: '+91 98960-12899',
    totalMachines: 20,
    subsidySanctioned: '₹24.0 Lakhs',
  },
  {
    id: 5,
    name: 'Patiala Kisan Seva CHC',
    location: { lat: 30.3398, lng: 76.3869 },
    district: 'Patiala',
    state: 'Punjab',
    contactPerson: 'Amrik Sandhu',
    phone: '+91 98765-43219',
    totalMachines: 22,
    subsidySanctioned: '₹26.2 Lakhs',
  },
  {
    id: 6,
    name: 'Meerut Krishak Kalyan Hub',
    location: { lat: 28.9845, lng: 77.7064 },
    district: 'Meerut',
    state: 'Uttar Pradesh',
    contactPerson: 'Chandra Prakash',
    phone: '+91 94120-65432',
    totalMachines: 18,
    subsidySanctioned: '₹21.5 Lakhs',
  },
];

const operatorNames = [
  'Manpreet Singh', 'Jasvir Gill', 'Kuldeep Yadav', 'Sukhdev Cheema',
  'Ravinder Malik', 'Davinder Brar', 'Satpal Verma', 'Joginder Randhawa',
  'Naresh Kumar', 'Pritam Singh', 'Balwant Toor', 'Ramesh Pal'
];

const machineTypes = Object.values(MachineType);

const getRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const generateRandomLocation = (center: Location, radius: number): Location => {
  return {
    lat: +(center.lat + (Math.random() - 0.5) * radius * 2).toFixed(5),
    lng: +(center.lng + (Math.random() - 0.5) * radius * 2).toFixed(5),
  };
};

export const generateInitialMachines = (): Machine[] => {
  const machines: Machine[] = [];
  const typeCounters: Record<string, number> = {};

  for (let i = 1; i <= 64; i++) {
    const chc = getRandom(CHCS);
    const type = getRandom(machineTypes);
    typeCounters[type] = (typeCounters[type] || 0) + 1;
    const count = typeCounters[type];

    const rand = Math.random();
    let status = MachineStatus.Idle;
    let speed = 0;
    if (rand < 0.45) {
      status = MachineStatus.InUse;
      speed = Math.floor(Math.random() * 8) + 4; // 4 to 12 km/h
    } else if (rand < 0.85) {
      status = MachineStatus.Idle;
      speed = 0;
    } else {
      status = MachineStatus.Maintenance;
      speed = 0;
    }

    const baseLoc = generateRandomLocation(chc.location, 0.18);
    // Generate a mini breadcrumb trail of recent coordinates
    const pathTrail: Location[] = [
      { lat: +(baseLoc.lat - 0.003).toFixed(5), lng: +(baseLoc.lng - 0.002).toFixed(5) },
      { lat: +(baseLoc.lat - 0.0015).toFixed(5), lng: +(baseLoc.lng - 0.001).toFixed(5) },
      baseLoc,
    ];

    const acres = status === MachineStatus.InUse ? +(Math.random() * 8 + 4).toFixed(1) : +(Math.random() * 3).toFixed(1);
    const tons = +(acres * 2.2).toFixed(1); // avg ~2-2.5 tons paddy residue per acre
    const co2Saved = Math.round(tons * 1450); // ~1.45 tons CO2 eq saved per ton unburnt straw

    machines.push({
      id: `CRM-2024-${String(1000 + i).slice(1)}`,
      schemeRegNo: `DAFW/CRM/${chc.state.slice(0, 2).toUpperCase()}/${2024}/${String(100 + i)}`,
      name: `${type} #${count}`,
      type,
      status,
      location: baseLoc,
      chcId: chc.id,
      lastActive: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 12),
      pathTrail,
      telemetry: {
        speedKmH: speed,
        fuelPercent: Math.floor(Math.random() * 55) + 40,
        engineHours: Math.floor(Math.random() * 450) + 120,
        acresCoveredToday: acres,
        tonsResidueManaged: tons,
        co2SavedKg: co2Saved,
        operatorName: getRandom(operatorNames),
        operatorPhone: `+91 98${Math.floor(Math.random() * 89999999 + 10000000)}`,
        gpsSignal: Math.random() > 0.1 ? 'Strong' : 'Moderate',
        batteryPercent: Math.floor(Math.random() * 20) + 80,
        tempCelsius: Math.floor(Math.random() * 18) + 68,
      },
    });
  }

  return machines;
};

export const generateInitialHotspots = (): StubbleHotspot[] => {
  return [
    {
      id: 'FIRMS-2024-082',
      location: { lat: 30.825, lng: 75.782 },
      village: 'Samrala Khurd',
      district: 'Ludhiana',
      state: 'Punjab',
      confidence: 'Critical',
      detectedAt: new Date(Date.now() - 1000 * 60 * 24),
      acresAtRisk: 22,
      dispatchStatus: 'Unassigned',
    },
    {
      id: 'FIRMS-2024-083',
      location: { lat: 30.182, lng: 75.912 },
      village: 'Sunam Kalan',
      district: 'Sangrur',
      state: 'Punjab',
      confidence: 'High',
      detectedAt: new Date(Date.now() - 1000 * 60 * 48),
      acresAtRisk: 16,
      dispatchStatus: 'Dispatched',
      assignedMachineId: 'CRM-2024-004',
    },
    {
      id: 'FIRMS-2024-084',
      location: { lat: 29.742, lng: 76.921 },
      village: 'Gharaunda Dehat',
      district: 'Karnal',
      state: 'Haryana',
      confidence: 'High',
      detectedAt: new Date(Date.now() - 1000 * 60 * 95),
      acresAtRisk: 12,
      dispatchStatus: 'On Site',
      assignedMachineId: 'CRM-2024-001',
    },
    {
      id: 'FIRMS-2024-085',
      location: { lat: 29.892, lng: 76.321 },
      village: 'Kalayat Rural',
      district: 'Kaithal',
      state: 'Haryana',
      confidence: 'Critical',
      detectedAt: new Date(Date.now() - 1000 * 60 * 12),
      acresAtRisk: 28,
      dispatchStatus: 'Unassigned',
    },
    {
      id: 'FIRMS-2024-086',
      location: { lat: 30.412, lng: 76.452 },
      village: 'Nabhadur',
      district: 'Patiala',
      state: 'Punjab',
      confidence: 'Medium',
      detectedAt: new Date(Date.now() - 1000 * 60 * 140),
      acresAtRisk: 9,
      dispatchStatus: 'Extinguished',
      assignedMachineId: 'CRM-2024-012',
    },
    {
      id: 'FIRMS-2024-087',
      location: { lat: 28.912, lng: 77.625 },
      village: 'Sardhana Majra',
      district: 'Meerut',
      state: 'Uttar Pradesh',
      confidence: 'High',
      detectedAt: new Date(Date.now() - 1000 * 60 * 62),
      acresAtRisk: 14,
      dispatchStatus: 'Unassigned',
    },
  ];
};

export const generateInitialBookings = (): FarmerBooking[] => {
  return [
    {
      id: 'BK-2024-101',
      farmerName: 'Surjit Singh Grewal',
      village: 'Baddowal',
      district: 'Ludhiana',
      state: 'Punjab',
      phone: '+91 98141-99882',
      farmSizeAcres: 18,
      cropType: 'Paddy (Basmati)',
      requiredMachineType: MachineType.HappySeeder,
      urgency: 'Immediate (<24h)',
      bookingDate: new Date(Date.now() - 1000 * 60 * 60 * 3),
      status: 'In Progress',
      assignedMachineId: 'CRM-2024-003',
      assignedChcId: 2,
    },
    {
      id: 'BK-2024-102',
      farmerName: 'Rajbir Singh Dhindsa',
      village: 'Bhawanigarh',
      district: 'Sangrur',
      state: 'Punjab',
      phone: '+91 94170-44331',
      farmSizeAcres: 25,
      cropType: 'Paddy (Non-Basmati PR-126)',
      requiredMachineType: MachineType.Baler,
      urgency: 'Immediate (<24h)',
      bookingDate: new Date(Date.now() - 1000 * 60 * 60 * 5),
      status: 'Dispatched',
      assignedMachineId: 'CRM-2024-008',
      assignedChcId: 3,
    },
    {
      id: 'BK-2024-103',
      farmerName: 'Satish Kumar Kamboj',
      village: 'Nilokheri',
      district: 'Karnal',
      state: 'Haryana',
      phone: '+91 98962-77610',
      farmSizeAcres: 14,
      cropType: 'Paddy (Pusa-44)',
      requiredMachineType: MachineType.SuperSMS,
      urgency: 'Scheduled (2-3 days)',
      bookingDate: new Date(Date.now() - 1000 * 60 * 60 * 8),
      status: 'Approved',
      assignedChcId: 1,
    },
    {
      id: 'BK-2024-104',
      farmerName: 'Baljinder Kaur',
      village: 'Samana',
      district: 'Patiala',
      state: 'Punjab',
      phone: '+91 98762-11099',
      farmSizeAcres: 32,
      cropType: 'Paddy (Basmati 1509)',
      requiredMachineType: MachineType.PaddyStrawChopper,
      urgency: 'Immediate (<24h)',
      bookingDate: new Date(Date.now() - 1000 * 60 * 60 * 1),
      status: 'Pending',
      assignedChcId: 5,
    },
    {
      id: 'BK-2024-105',
      farmerName: 'Vinod Tyagi',
      village: 'Daurala',
      district: 'Meerut',
      state: 'Uttar Pradesh',
      phone: '+91 94121-88334',
      farmSizeAcres: 12,
      cropType: 'Sugarcane & Paddy',
      requiredMachineType: MachineType.Mulcher,
      urgency: 'Flexible',
      bookingDate: new Date(Date.now() - 1000 * 60 * 60 * 14),
      status: 'Completed',
      assignedMachineId: 'CRM-2024-022',
      assignedChcId: 6,
    },
    {
      id: 'BK-2024-106',
      farmerName: 'Pardeep Kundu',
      village: 'Pundri',
      district: 'Kaithal',
      state: 'Haryana',
      phone: '+91 98964-33211',
      farmSizeAcres: 20,
      cropType: 'Paddy (Non-Basmati)',
      requiredMachineType: MachineType.SmartSeeder,
      urgency: 'Immediate (<24h)',
      bookingDate: new Date(Date.now() - 1000 * 60 * 45),
      status: 'Pending',
      assignedChcId: 4,
    },
  ];
};
