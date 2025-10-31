import React, { useState, useEffect } from 'react';
import { AlertTriangle, Cloud, Activity, Droplets, Wind, MapPin, Clock, Search, Navigation, Bell, X, Crosshair, Flame, CloudRain, TrendingUp } from 'lucide-react';
import Precipitation from './Precipitation';

const ExplorePage = () => {
  const [earthquakeData, setEarthquakeData] = useState([]);
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [selectedLocation, setSelectedLocation] = useState({ name: 'Kathmandu', lat: 27.7172, lon: 85.3240 });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [liveAlerts, setLiveAlerts] = useState([]);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
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
            
            setSelectedLocation({ 
              name: locationName, 
              lat: parseFloat(lat), 
              lon: parseFloat(lon) 
            });
            setShowLocationDropdown(false);
          } catch (error) {
            setSelectedLocation({ 
              name: 'Current Location', 
              lat: parseFloat(lat), 
              lon: parseFloat(lon) 
            });
          } finally {
            setGettingLocation(false);
          }
        },
        (error) => {
          alert('Unable to get your location. Please enable location services.');
          setGettingLocation(false);
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
      setGettingLocation(false);
    }
  };

  const fetchEarthquakes = async () => {
    try {
      const response = await fetch(
        'https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2025-10-20&minmagnitude=4.0&minlatitude=26&maxlatitude=31&minlongitude=80&maxlongitude=89'
      );
      const data = await response.json();
      const newQuakes = data.features.slice(0, 20);
      
      if (earthquakeData.length > 0) {
        const newIds = newQuakes.map(q => q.id);
        const oldIds = earthquakeData.map(q => q.id);
        const freshAlerts = newQuakes.filter(q => !oldIds.includes(q.id));
        
        freshAlerts.forEach(quake => {
          addLiveAlert('earthquake', quake);
        });
      }
      
      setEarthquakeData(newQuakes);
    } catch (error) {
      console.error('Error fetching earthquake data:', error);
    }
  };

  const fetchWeather = async () => {
    try {
      const API_KEY = '7576ca584023095cd04c2d36626a9090';
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${selectedLocation.lat}&lon=${selectedLocation.lon}&appid=${API_KEY}&units=metric`
      );
      
      if (!response.ok) {
        throw new Error('API key required');
      }
      
      const data = await response.json();
      
      const formattedData = {
        current: {
          temperature_2m: data.main.temp,
          relative_humidity_2m: data.main.humidity,
          precipitation: data.rain ? (data.rain['1h'] || 0) : 0,
          wind_speed_10m: (data.wind.speed).toFixed(1), // Convert m/s to km/h
          weather_description: data.weather[0].description
        }
      };
      
      
      
      if (parseFloat(formattedData.current.wind_speed_10m) > 40) {
        addLiveAlert('high_wind', { 
          windSpeed: formattedData.current.wind_speed_10m,
          location: selectedLocation.name 
        });
      }
      
      if (formattedData.current.temperature_2m > 35) {
        addLiveAlert('heat_wave', { 
          temperature: formattedData.current.temperature_2m,
          location: selectedLocation.name 
        });
      }
      
      setWeatherData(formattedData);
    } catch (error) {
      console.error('Error fetching weather data:', error);
      //Dummy data if API fails
      setWeatherData({
        current: {
          temperature_2m: 22,
          relative_humidity_2m: 65,
          precipitation: 0,
          wind_speed_10m: 12,
          weather_description: 'partly cloudy'
        }
      });
    }
  };

  const addLiveAlert = (type, data) => {
    const alertId = Date.now() + Math.random();
    const newAlert = {
      id: alertId,
      type,
      data,
      timestamp: new Date(),
      read: false
    };
    
    setLiveAlerts(prev => {
      const exists = prev.some(alert => 
        alert.type === type && 
        JSON.stringify(alert.data) === JSON.stringify(data)
      );
      
      if (!exists) {
        return [newAlert, ...prev].slice(0, 50);
      }
      return prev;
    });
    
    setTimeout(() => {
      setLiveAlerts(prev => prev.filter(alert => alert.id !== alertId));
    }, 60000);
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchEarthquakes(), fetchWeather()]);
      setLoading(false);
      setLastUpdate(new Date());
    };

    loadData();
    
    // Add dummy alerts if no live data available
    const addDummyAlerts = () => {
  setLiveAlerts(prev => {
    // Only add dummy alerts if prev (latest state) is empty
    if (prev.length === 0) {
      const dummyAlerts = [
        {
          id: Date.now() + 1,
          type: 'flood',
          data: { location: 'बागमती नदी, काठमाडौं' },
          timestamp: new Date(Date.now() - 300000),
          read: false
        },
        {
          id: Date.now() + 2,
          type: 'landslide',
          data: { location: 'सिन्धुपाल्चोक जिल्ला' },
          timestamp: new Date(Date.now() - 600000),
          read: false
        },
        {
          id: Date.now() + 3,
          type: 'fire',
          data: { location: 'ललितपुर महानगरपालिका' },
          timestamp: new Date(Date.now() - 900000),
          read: false
        }
      ];
      return dummyAlerts;
    }
    return prev; // keep existing live alerts
  });
};

// Add dummy alerts after 5 seconds if still empty
const dummyTimeout = setTimeout(addDummyAlerts, 5000);

    
    const interval = setInterval(() => {
      fetchEarthquakes();
      fetchWeather();
      setLastUpdate(new Date());
    }, 1200);

    return () => {
      clearInterval(interval);
      clearTimeout(dummyTimeout);
    };
  }, [selectedLocation]);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const getNearbyQuakes = () => {
    return earthquakeData
      .map(quake => ({
        ...quake,
        distance: calculateDistance(
          selectedLocation.lat,
          selectedLocation.lon,
          quake.geometry.coordinates[1],
          quake.geometry.coordinates[0]
        )
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 10);
  };

  const formatTimeAgo = (timestamp) => {
    const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const selectLocation = (result) => {
    const locationName = result.address?.city || 
                        result.address?.town || 
                        result.address?.village || 
                        result.name || 
                        'Selected Location';
    
    setSelectedLocation({
      name: locationName,
      lat: parseFloat(result.lat),
      lon: parseFloat(result.lon)
    });
    setShowLocationDropdown(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const getAlertIcon = (type) => {
    switch(type) {
      case 'earthquake': return <Activity className="w-5 h-5" />;
      case 'heavy_rain': return <CloudRain className="w-5 h-5" />;
      case 'high_wind': return <Wind className="w-5 h-5" />;
      case 'heat_wave': return <Flame className="w-5 h-5" />;
      case 'flood': return <Droplets className="w-5 h-5" />;
      case 'landslide': return <AlertTriangle className="w-5 h-5" />;
      case 'fire': return <Flame className="w-5 h-5" />;
      default: return <AlertTriangle className="w-5 h-5" />;
    }
  };

  const getAlertColor = (type) => {
    switch(type) {
      case 'earthquake': return 'from-red-600 to-orange-600';
      case 'heavy_rain': return 'from-blue-600 to-cyan-600';
      case 'high_wind': return 'from-purple-600 to-pink-600';
      case 'heat_wave': return 'from-orange-600 to-yellow-600';
      case 'flood': return 'from-blue-700 to-blue-500';
      case 'landslide': return 'from-amber-700 to-yellow-600';
      case 'fire': return 'from-red-700 to-orange-500';
      default: return 'from-gray-600 to-gray-700';
    }
  };

  const getAlertMessage = (alert) => {
    switch(alert.type) {
      case 'earthquake':
        return `M${alert.data.properties.mag.toFixed(1)} भूकम्प - ${alert.data.properties.place}`;
      case 'heavy_rain':
        return `भारी वर्षा चेतावनी - ${alert.data.precipitation.toFixed(1)}mm/h ${alert.data.location} मा`;
      case 'high_wind':
        return `तेज हावा चेतावनी - ${alert.data.windSpeed} km/h ${alert.data.location} मा`;
      case 'heat_wave':
        return `गर्मी लहर चेतावनी - ${alert.data.temperature.toFixed(1)}°C ${alert.data.location} मा`;
      case 'flood':
        return `बाढी चेतावनी - ${alert.data.location} क्षेत्रमा`;
      case 'landslide':
        return `पहिरो जोखिम - ${alert.data.location} मा`;
      case 'fire':
        return `आगलागी - ${alert.data.location} मा`;
      default:
        return 'आपत्कालीन सूचना';
    }
  };

  const getSeverityColor = (magnitude) => {
    if (magnitude >= 7) return 'bg-red-600';
    if (magnitude >= 6) return 'bg-orange-500';
    if (magnitude >= 5) return 'bg-yellow-500';
    return 'bg-green-500';
  };

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
    <div className="min-h-screen ">
      {/* Header */}
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
            
            {/* Location Selector */}
            <div className="relative">
              <button
                onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                className="w-full bg-white bg-opacity-10 backdrop-blur-md border border-white border-opacity-20 rounded-lg px-3 py-2 text-white flex items-center justify-between hover:bg-opacity-20 transition"
              >
                <div className="flex items-center space-x-2 overflow-hidden">
                  <Navigation className="w-4 h-4 text-blue-300 flex-shrink-0" />
                  <span className="text-sm font-medium truncate">{selectedLocation.name}</span>
                </div>
                <Search className="w-4 h-4 flex-shrink-0" />
              </button>
              
              {showLocationDropdown && (
                <div className="absolute top-full mt-2 w-full bg-slate-800 rounded-lg shadow-2xl border border-white border-opacity-20 max-h-80 overflow-hidden z-50">
                  <div className="p-3 border-b border-white border-opacity-10">
                    <input
                      type="text"
                      placeholder="Search location..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      autoFocus
                    />
                    <button
                      onClick={getCurrentLocation}
                      disabled={gettingLocation}
                      className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm flex items-center justify-center space-x-2 transition disabled:opacity-50"
                    >
                      <Crosshair className={`w-4 h-4 ${gettingLocation ? 'animate-spin' : ''}`} />
                      <span>{gettingLocation ? 'Getting...' : 'Use My Location'}</span>
                    </button>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {isSearching ? (
                      <div className="p-4 text-center text-gray-400">
                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-blue-400 mx-auto mb-2"></div>
                        <p className="text-xs">Searching...</p>
                      </div>
                    ) : searchResults.length > 0 ? (
                      searchResults.map((result, index) => (
                        <button
                          key={index}
                          onClick={() => selectLocation(result)}
                          className="w-full px-3 py-2 text-left hover:bg-white hover:bg-opacity-10 transition border-b border-white border-opacity-5"
                        >
                          <p className="text-white text-sm font-medium truncate">
                            {result.address?.city || result.address?.town || result.address?.village || result.name}
                          </p>
                          <p className="text-gray-400 text-xs truncate">{result.display_name.split(',').slice(0, 2).join(',')}</p>
                        </button>
                      ))
                    ) : searchQuery.length >= 2 ? (
                      <div className="p-4 text-center text-gray-400 text-sm">No locations found</div>
                    ) : (
                      <div className="p-4 text-center text-gray-400 text-xs">Search for any place in Nepal</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Weather Card */}
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
                      <span className="text-xs">Humidity-आर्द्रता</span>
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
                      {weatherData.current.wind_speed_10m} m/s
                    </p>
                  </div>
                  
                  <Precipitation lat={selectedLocation.lat} lon={selectedLocation.lon} locationName={selectedLocation.name} addLiveAlert={addLiveAlert} />
                  
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

            {/* Earthquakes Table */}
            <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-4 sm:p-6 border border-white border-opacity-20">
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center mb-4">
                <Activity className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-yellow-300" />
                Recent Earthquakes
              </h2>
              
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <div className="inline-block min-w-full align-middle">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-white border-opacity-20">
                        <th className="text-left py-2 px-2 text-xs sm:text-sm font-semibold text-gray-300">भूकम्पको परिमाण-Magnitude</th>
                        <th className="text-left py-2 px-2 text-xs sm:text-sm font-semibold text-gray-300">स्थान</th>
                        <th className="text-left py-2 px-2 text-xs sm:text-sm font-semibold text-gray-300 hidden sm:table-cell">दूरी</th>
                        <th className="text-left py-2 px-2 text-xs sm:text-sm font-semibold text-gray-300">समय</th>
                      </tr>
                    </thead>
                    <tbody>
                      {nearbyQuakes.map((quake, index) => (
                        <tr key={index} className="border-b border-white border-opacity-10 hover:bg-white hover:bg-opacity-5">
                          <td className="py-2 px-2">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-white font-bold text-xs ${getSeverityColor(quake.properties.mag)}`}>
                              {quake.properties.mag.toFixed(1)}
                            </span>
                          </td>
                          <td className="py-2 px-2 text-xs sm:text-sm text-gray-200">
                            <div className="max-w-xs truncate">{quake.properties.place}</div>
                          </td>
                          <td className="py-2 px-2 text-xs sm:text-sm text-gray-300 hidden sm:table-cell">
                            {quake.distance.toFixed(0)} km
                          </td>
                          <td className="py-2 px-2 text-xs text-gray-300">
                            {formatTimeAgo(quake.properties.time)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Live Alerts Panel */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-red-900 to-orange-900 bg-opacity-20 backdrop-blur-md rounded-xl p-4 sm:p-6 border-2 border-red-500 border-opacity-50 lg:sticky lg:top-24">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-bold text-white flex items-center">
                  <Bell className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-yellow-300" />
                  Live Alerts
                </h2>
                {liveAlerts.length > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {liveAlerts.length}
                  </span>
                )}
              </div>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {liveAlerts.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">सक्रिय सूचनाहरू छैनन्</p>
                    <p className="text-xs mt-1">आपदाहरूको निगरानी गर्दै...</p>
                  </div>
                ) : (
                  liveAlerts.map((alert, index) => (
                    <div
                      key={alert.id}
                      className={`bg-gradient-to-r ${getAlertColor(alert.type)} rounded-lg p-3 border border-white border-opacity-20 animate-slideIn`}
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2 text-white">
                          {getAlertIcon(alert.type)}
                          <span className="text-xs font-bold uppercase">{alert.type === 'earthquake' ? 'भूकम्प' : alert.type === 'heavy_rain' ? 'भारी वर्षा' : alert.type === 'high_wind' ? 'तेज हावा' : alert.type === 'heat_wave' ? 'गर्मी लहर' : alert.type === 'flood' ? 'बाढी' : alert.type === 'landslide' ? 'पहिरो' : alert.type === 'fire' ? 'आगलागी' : 'सूचना'}</span>
                        </div>
                        <button
                          onClick={() => setLiveAlerts(prev => prev.filter(a => a.id !== alert.id))}
                          className="text-white hover:text-gray-200"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <p className="text-white text-sm mb-2">{getAlertMessage(alert)}</p>
                      
                      <div className="flex justify-between items-center text-xs text-gray-200">
                        <span>{formatTimeAgo(alert.timestamp)}</span>
                        {alert.type === 'earthquake' && alert.data.geometry && (
                          <span>{calculateDistance(
                            selectedLocation.lat,
                            selectedLocation.lon,
                            alert.data.geometry.coordinates[1],
                            alert.data.geometry.coordinates[0]
                          ).toFixed(0)} km टाढा</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <div className="mt-4 text-xs text-gray-400 text-center flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Updates every 2 minutes</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExplorePage;