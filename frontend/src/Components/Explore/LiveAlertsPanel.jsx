import React from 'react';
import { Bell, X, Activity, CloudRain, Wind, Flame, Droplets, AlertTriangle, Newspaper } from 'lucide-react';
import { calculateDistance, formatTimeAgo } from '../../utils/helper'

const LiveAlertsPanel = ({ liveAlerts, setLiveAlerts, selectedLocation }) => {
  const getAlertIcon = (type) => {
    switch(type) {
      case 'earthquake': return <Activity className="w-5 h-5" />;
      case 'heavy_rain': return <CloudRain className="w-5 h-5" />;
      case 'high_wind': return <Wind className="w-5 h-5" />;
      case 'heat_wave': return <Flame className="w-5 h-5" />;
      case 'flood': return <Droplets className="w-5 h-5" />;
      case 'landslide': return <AlertTriangle className="w-5 h-5" />;
      case 'fire': return <Flame className="w-5 h-5" />;
      case 'news': return <Newspaper className="w-5 h-5" />;
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
      case 'news': return 'from-indigo-600 to-purple-600';
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
      case 'news':
        return alert.data.title;
      default:
        return 'आपत्कालीन सूचना';
    }
  };

  return (
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
              className={`bg-gradient-to-r ${getAlertColor(alert.type)} rounded-lg p-3 border border-white border-opacity-20`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2 text-white">
                  {getAlertIcon(alert.type)}
                  <span className="text-xs font-bold uppercase">
                    {alert.type === 'earthquake' ? 'भूकम्प' : 
                     alert.type === 'heavy_rain' ? 'भारी वर्षा' : 
                     alert.type === 'high_wind' ? 'तेज हावा' : 
                     alert.type === 'heat_wave' ? 'गर्मी लहर' : 
                     alert.type === 'flood' ? 'बाढी' : 
                     alert.type === 'landslide' ? 'पहिरो' : 
                     alert.type === 'fire' ? 'आगलागी' : 
                     alert.type === 'news' ? 'समाचार' : 
                     'सूचना'}
                  </span>
                </div>
                <button
                  onClick={() => setLiveAlerts(prev => prev.filter(a => a.id !== alert.id))}
                  className="text-white hover:text-gray-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <p className="text-white text-sm mb-2">{getAlertMessage(alert)}</p>
              
              {alert.type === 'news' && alert.data.description && (
                <p className="text-gray-200 text-xs mb-2 line-clamp-2">{alert.data.description}</p>
              )}
              
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
                {alert.type === 'news' && (
                  <a 
                    href={alert.data.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-white hover:underline flex items-center gap-1"
                  >
                    पढ्नुहोस्
                  </a>
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
  );
};

export default LiveAlertsPanel;