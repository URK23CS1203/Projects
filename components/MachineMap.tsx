
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Machine } from '../types';
import { MachineStatus } from '../types';

interface MachineMapProps {
  machines: Machine[];
}

const createIcon = (color: string) => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24px" height="24px">
      <circle cx="12" cy="12" r="10" fill="${color}" stroke="white" stroke-width="2"/>
    </svg>`;
  return L.divIcon({
    html: svg,
    className: 'leaflet-marker-icon-custom',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

const icons = {
  [MachineStatus.InUse]: createIcon('#16a34a'), // green-600
  [MachineStatus.Idle]: createIcon('#f59e0b'), // amber-500
  [MachineStatus.Maintenance]: createIcon('#dc2626'), // red-600
};

const MachineMap: React.FC<MachineMapProps> = ({ machines }) => {
  const center: [number, number] = [29.0, 78.0];

  return (
    <div className="h-full w-full rounded-lg overflow-hidden">
      <MapContainer center={center} zoom={6} scrollWheelZoom={true} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        {machines.map(machine => (
          <Marker
            key={machine.id}
            position={[machine.location.lat, machine.location.lng]}
            icon={icons[machine.status]}
          >
            <Popup>
               <div className="font-sans text-sm text-gray-800">
                <p className="font-bold text-base">{machine.name}</p>
                <p><strong>ID:</strong> {machine.id}</p>
                <p><strong>Type:</strong> {machine.type}</p>
                <p>
                    <strong>Status:</strong> 
                    <span className={
                        machine.status === MachineStatus.InUse ? 'text-green-600 font-semibold' :
                        machine.status === MachineStatus.Idle ? 'text-yellow-600 font-semibold' : 'text-red-600 font-semibold'
                    }>
                    {' '}{machine.status}
                    </span>
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MachineMap;
