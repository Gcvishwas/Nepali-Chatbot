import { useState, useEffect } from "react";
import {
  fetchEarthquakes,
  fetchWeather,
  fetchNewsAlerts,
} from "../services/dataService";
import { calculateDistance } from "../utils/helper";

export const useDisasterData = (selectedLocation) => {
  const [earthquakeData, setEarthquakeData] = useState([]);
  const [weatherData, setWeatherData] = useState(null);
  const [liveAlerts, setLiveAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [earthquakes, setEarthquakes] = useState([]);
  const [weather, setWeather] = useState(null);
  const [news, setNews] = useState([]);

  const addLiveAlert = (type, data) => {
    const alertId = Date.now() + Math.random();
    const newAlert = {
      id: alertId,
      type,
      data,
      timestamp: new Date(),
      read: false,
    };

    setLiveAlerts((prev) => {
      const filteredPrev = prev.filter((alert) => !alert.isDummy);
      const exists = filteredPrev.some((alert) => {
        if (type === "news" && alert.type === "news") {
          return alert.data.title === data.title;
        }
        if (type === alert.type) {
          return JSON.stringify(alert.data) === JSON.stringify(data);
        }
        return false;
      });

      if (!exists) {
        return [newAlert, ...filteredPrev].slice(0, 50);
      }
      return filteredPrev;
    });

    setTimeout(() => {
      setLiveAlerts((prev) => prev.filter((alert) => alert.id !== alertId));
    }, 300000);
  };

  const loadEarthquakes = async () => {
    const newQuakes = await fetchEarthquakes();

    if (earthquakeData.length > 0) {
      const oldIds = earthquakeData.map((q) => q.id);
      const freshAlerts = newQuakes.filter((q) => !oldIds.includes(q.id));
      freshAlerts.forEach((quake) => addLiveAlert("earthquake", quake));
    }

    setEarthquakeData(newQuakes);
  };

  const loadWeather = async () => {
    const data = await fetchWeather(selectedLocation.lat, selectedLocation.lon);

    if (parseFloat(data.current.wind_speed_10m) > 40) {
      addLiveAlert("high_wind", {
        windSpeed: data.current.wind_speed_10m,
        location: selectedLocation.name,
      });
    }

    if (data.current.temperature_2m > 35) {
      addLiveAlert("heat_wave", {
        temperature: data.current.temperature_2m,
        location: selectedLocation.name,
      });
    }

    setWeatherData(data);
  };

  const loadNews = async () => {
    const articles = await fetchNewsAlerts();
    articles.forEach((article) => {
      addLiveAlert("news", article);
    });
  };

  const getNearbyQuakes = () => {
    return earthquakeData
      .map((quake) => ({
        ...quake,
        distance: calculateDistance(
          selectedLocation.lat,
          selectedLocation.lon,
          quake.geometry.coordinates[1],
          quake.geometry.coordinates[0]
        ),
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 10);
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      loadEarthquakes().then(setEarthquakes);
      loadWeather().then(setWeather);
      loadNews();
      setLoading(false);
    };
    loadData();

    const addDummyAlerts = () => {
      setLiveAlerts((prev) => {
        if (prev.length === 0) {
          return [
            {
              id: Date.now() + 1,
              type: "news",
              data: {
                title:
                  "काठमाडौं उपत्यकामा भूकम्पको जोखिम बढ्दो - विज्ञहरूको चेतावनी",
                description: "पूर्व तयारी आवश्यक रहेको बताइएको छ।",
                link: "#",
                source: "onlinekhabar.com",
              },
              timestamp: new Date(Date.now() - 180000),
              read: false,
              isDummy: true,
            },
            {
              id: Date.now() + 2,
              type: "flood",
              data: { location: "बागमती नदी, काठमाडौं" },
              timestamp: new Date(Date.now() - 300000),
              read: false,
              isDummy: true,
            },
            {
              id: Date.now() + 3,
              type: "landslide",
              data: { location: "सिन्धुपाल्चोक जिल्ला" },
              timestamp: new Date(Date.now() - 600000),
              read: false,
              isDummy: true,
            },
            {
              id: Date.now() + 4,
              type: "fire",
              data: { location: "ललितपुर महानगरपालिका" },
              timestamp: new Date(Date.now() - 900000),
              read: false,
              isDummy: true,
            },
          ];
        }
        return prev;
      });
    };

    const dummyTimeout = setTimeout(addDummyAlerts, 5000);

    const interval = setInterval(() => {
      loadEarthquakes();
      loadWeather();
      loadNews();
      setLastUpdate(new Date());
    }, 120000);

    return () => {
      clearInterval(interval);
      clearTimeout(dummyTimeout);
    };
  }, [selectedLocation]);

  return {
    earthquakeData,
    weatherData,
    liveAlerts,
    setLiveAlerts,
    loading,
    lastUpdate,
    getNearbyQuakes,
  };
};
