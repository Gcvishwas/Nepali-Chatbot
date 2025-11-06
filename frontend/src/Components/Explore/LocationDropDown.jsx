import React from 'react';

const LocationDropDown = ({ 
  searchQuery, 
  setSearchQuery, 
  searchResults, 
  isSearching, 
  gettingLocation, 
  getCurrentLocation, 
  selectLocation 
}) => {
  return (
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
  );
};

export default LocationDropDown;