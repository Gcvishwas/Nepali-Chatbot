import React, { useState, useEffect } from 'react';
import LocationDropdown from './LocationDropdown';

const LocationSelector = ({ selectedLocation, onLocationChange }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  useEffect(() => {
    const searchLocation = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=np&limit=8&addressdetails=1`
        );
        const data = await response.json();
        setSearchResults(data);
      } catch (error) {
        console.error('Error searching location:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(searchLocation, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const getCurrentLocation = () => {
    setGettingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`
            );
            const data = await response.json();
            const locationName = data.address?.city || 
                                data.address?.town || 
                                data.address?.village || 
                                'Current Location';
            
            onLocationChange({ 
              name: locationName, 
              lat: parseFloat(lat), 
              lon: parseFloat(lon) 
            });
            setShowDropdown(false);
          } catch (error) {
            onLocationChange({ 
              name: 'Current Location', 
              lat: parseFloat(lat), 
              lon: parseFloat(lon) 
            });
          } finally {
            setGettingLocation(false);
          }
        },
        () => {
          alert('Unable to get your location. Please enable location services.');
          setGettingLocation(false);
        }
      );
    }
  };

  const selectLocation = (result) => {
    const locationName = result.address?.city || 
                        result.address?.town || 
                        result.address?.village || 
                        result.name || 
                        'Selected Location';
    
    onLocationChange({
      name: locationName,
      lat: parseFloat(result.lat),
      lon: parseFloat(result.lon)
    });
    setShowDropdown(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="w-full bg-white bg-opacity-10 backdrop-blur-md border border-white border-opacity-20 rounded-lg px-3 py-2 text-white flex items-center justify-between hover:bg-opacity-20 transition"
      >
        <div className="flex items-center space-x-2 overflow-hidden">
          <span className="text-sm font-medium truncate">{selectedLocation.name}</span>
        </div>
      </button>
      
      {showDropdown && (
        <LocationDropdown
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchResults={searchResults}
          isSearching={isSearching}
          gettingLocation={gettingLocation}
          getCurrentLocation={getCurrentLocation}
          selectLocation={selectLocation}
        />
      )}
    </div>
  );
};

export default LocationSelector;