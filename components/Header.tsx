
import React from 'react';
import { Tractor, RefreshCw, User } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 p-4 flex justify-between items-center">
      <div className="flex items-center space-x-3">
        <div className="bg-green-100 p-2 rounded-lg">
          <Tractor className="h-6 w-6 text-green-600" />
        </div>
        <h1 className="text-xl font-bold text-gray-800">
          CRM Machine Tracker
          <span className="block text-xs font-normal text-gray-500">Real-time Monitoring for Crop Residue Management</span>
        </h1>
      </div>
      <div className="flex items-center space-x-4">
        <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
            <User className="h-5 w-5" />
            <span>Device</span>
        </button>
        <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full">
            <RefreshCw className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
};

export default Header;
