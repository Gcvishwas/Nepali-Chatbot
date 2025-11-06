import React, { useState } from 'react';
import Header from "../../Components/Explore/Header"
import WeatherCard from "../../Components/Explore/WeatherCard"
import EarthquakesTable from "../../Components/Explore/EarthquakesTable"
import LiveAlertsPanel from "../../Components/Explore/LiveAlertsPanel"
import { useDisasterData } from "../../hooks/useDisasterData"

const ExplorePage = () => {
  const [selectedLocation, setSelectedLocation] = useState({ 
    name: 'Kathmandu', 
    lat: 27.7172, 
    lon: 85.3240 
  });

  const {
    weatherData,
    liveAlerts,
    setLiveAlerts,
    loading,
    lastUpdate,
    getNearbyQuakes
  } = useDisasterData(selectedLocation);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-400 border-solid mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading live data...</p>
        </div>
      </div>
    );
  }

  const nearbyQuakes = getNearbyQuakes();

  return (
    <div className="min-h-screen">
      <Header 
        lastUpdate={lastUpdate}
        selectedLocation={selectedLocation}
        onLocationChange={setSelectedLocation}
      />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <WeatherCard 
              weatherData={weatherData}
              selectedLocation={selectedLocation}
            />
            <EarthquakesTable nearbyQuakes={nearbyQuakes} />
          </div>

          <div className="lg:col-span-1">
            <LiveAlertsPanel 
              liveAlerts={liveAlerts}
              setLiveAlerts={setLiveAlerts}
              selectedLocation={selectedLocation}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExplorePage;