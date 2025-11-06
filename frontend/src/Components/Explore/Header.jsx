import React from 'react';
import { AlertTriangle, Clock } from 'lucide-react';
import LocationSelector from './LocationSelector';

const Header = ({ lastUpdate, selectedLocation, onLocationChange }) => {
  return (
    <header className="bg-black bg-opacity-30 backdrop-blur-md border-b border-white border-opacity-10 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-red-400" />
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-white">Disaster Explorer</h1>
                <p className="text-xs sm:text-sm text-gray-300 hidden sm:block">Real-time Nepal monitoring</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-gray-300 text-xs sm:text-sm">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>{lastUpdate.toLocaleTimeString()}</span>
            </div>
          </div>
          
          <LocationSelector 
            selectedLocation={selectedLocation}
            onLocationChange={onLocationChange}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;