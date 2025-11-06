import React from 'react';
import { Activity } from 'lucide-react';
import { formatTimeAgo } from '../../utils/helper';
const EarthquakesTable = ({ nearbyQuakes }) => {
  const getSeverityColor = (magnitude) => {
    if (magnitude >= 7) return 'bg-red-600';
    if (magnitude >= 6) return 'bg-orange-500';
    if (magnitude >= 5) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
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
                <th className="text-left py-2 px-2 text-xs sm:text-sm font-semibold text-gray-300">Magnitude</th>
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
  );
};

export default EarthquakesTable;
