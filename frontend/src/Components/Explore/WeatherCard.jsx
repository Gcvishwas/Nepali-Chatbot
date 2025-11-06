import React from 'react';
import { Cloud, Droplets, Wind, TrendingUp } from 'lucide-react';
import Precipitation from '../../routes/Explore/Precipitation';
import LiveAlertsPanel from "../../Components/Explore/LiveAlertsPanel";
import { useDisasterData } from '../../hooks/useDisasterData';
const WeatherCard = ({ weatherData, selectedLocation }) => {
  const liveAlerts=useDisasterData(selectedLocation);
  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-4 sm:p-6 border border-white border-opacity-20">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg sm:text-xl font-bold text-white flex items-center">
          <Cloud className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-blue-300" />
          <span className="hidden sm:inline">मौसम - {selectedLocation.name}</span>
          <span className="sm:hidden">मौसम</span>
        </h2>
        <span className="text-xs bg-green-500 bg-opacity-20 px-2 py-1 rounded-full border border-green-400 flex items-center text-white">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1 animate-pulse"></span>
          Live
        </span>
      </div>
      
      {weatherData && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-black bg-opacity-20 rounded-lg p-4 transform hover:scale-105 transition">
            <div className="flex items-center text-gray-300 mb-2">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span className="text-xs">तापक्रम</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-white">
              {weatherData.current.temperature_2m}°C
            </p>
          </div>
          
          <div className="bg-black bg-opacity-20 rounded-lg p-3 sm:p-4">
            <div className="flex items-center text-gray-300 mb-1">
              <Droplets className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              <span className="text-xs">Humidity</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-white">
              {weatherData.current.relative_humidity_2m}%
            </p>
          </div>
          
          <div className="bg-black bg-opacity-20 rounded-lg p-3 sm:p-4">
            <div className="flex items-center text-gray-300 mb-1">
              <Wind className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              <span className="text-xs">Wind</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-white">
              {(weatherData.current.wind_speed_10m*3.6).toFixed(2)} km/hr
            </p>
          </div>
          <Precipitation  lat={selectedLocation.lat} 
  lon={selectedLocation.lon} 
  locationName={selectedLocation.name}
  addLiveAlert={liveAlerts}/>
          <div className="bg-black bg-opacity-20 rounded-lg p-4 transform hover:scale-105 transition">
            <div className="flex items-center text-gray-300 mb-2">
              <Cloud className="w-4 h-4 mr-1" />
              <span className="text-xs">हाल अवस्था</span>
            </div>
            <p className="text-sm font-semibold text-white">
              {weatherData.current.weather_description}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherCard;
