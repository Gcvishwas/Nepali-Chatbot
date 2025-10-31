// Precipitation.js
import React, { useState, useEffect } from 'react';
import { CloudRain } from 'lucide-react';

const Precipitation = ({ lat, lon, locationName, addLiveAlert }) => {
  const [precipitation, setPrecipitation] = useState(0);

  const fetchPrecipitation = async () => {
    try {
      const hourlyResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=precipitation&timezone=Asia/Kathmandu`
      );
      const hourlyData = await hourlyResponse.json();

      const now = new Date();
      const currentHourISO = now.toISOString().slice(0, 13) + ":00";
      const index = hourlyData.hourly.time.findIndex(t => t === currentHourISO);

      const currentPrecip = index >= 0 ? hourlyData.hourly.precipitation[index] : 0;
      setPrecipitation(currentPrecip);

      // Trigger alert if precipitation exceeds 10 mm
      if (currentPrecip > 10 && addLiveAlert) {
        addLiveAlert('heavy_rain', {
          precipitation: currentPrecip,
          location: locationName
        });
      }
    } catch (error) {
      console.error('Error fetching precipitation:', error);
      setPrecipitation(0);
    }
  };

  useEffect(() => {
    fetchPrecipitation();
    const interval = setInterval(fetchPrecipitation, 10 * 60 * 1000); // update every 10 min
    return () => clearInterval(interval);
  }, [lat, lon]);

  return (
    <div className="bg-black bg-opacity-20 rounded-lg p-3 sm:p-4">
      <div className="flex items-center text-gray-300 mb-1">
        <CloudRain className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
        <span className="text-xs">वर्षा</span>
      </div>
      <p className="text-xl sm:text-2xl font-bold text-white">
        {precipitation.toFixed(1)} mm
      </p>
    </div>
  );
};

export default Precipitation;
