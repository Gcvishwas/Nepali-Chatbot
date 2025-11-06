import { isDisasterRelated } from "../utils/helper";

export const fetchEarthquakes = async () => {
  try {
    const startTime = new Date(Date.now() - 3*24 * 60 * 60 * 1000).toISOString();
    const response = await fetch(
      `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=${startTime}&minmagnitude=4.0&minlatitude=26&maxlatitude=31&minlongitude=80&maxlongitude=89`
    );
    const data = await response.json();
    return data.features.slice(0, 20);
  } catch (error) {
    console.error('Error fetching earthquake data:', error);
    return [];
  }
};

export const fetchWeather = async (lat, lon) => {
  try {
    const API_KEY = '7576ca584023095cd04c2d36626a9090';
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );
    
    if (!response.ok) throw new Error('API key required');
    
    const data = await response.json();
    
    return {
      current: {
        temperature_2m: data.main.temp,
        relative_humidity_2m: data.main.humidity,
        precipitation: data.rain ? (data.rain['1h'] || 0) : 0,
        wind_speed_10m: (data.wind.speed).toFixed(1),
        weather_description: data.weather[0].description
      }
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return {
      current: {
        temperature_2m: 22,
        relative_humidity_2m: 65,
        precipitation: 0,
        wind_speed_10m: 12,
        weather_description: 'partly cloudy'
      }
    };
  }
};

export const parseRSSFeed = async (url) => {
  try {
    const proxyUrl = 'https://api.allorigins.win/get?url=';
    const response = await fetch(proxyUrl + encodeURIComponent(url));
    const data = await response.json();
    
    const parser = new DOMParser();
    const xml = parser.parseFromString(data.contents, 'text/xml');
    
    const items = xml.querySelectorAll('item');
    const articles = [];

    items.forEach((item, index) => {
      if (index >= 5) return;
      
      const title = item.querySelector('title')?.textContent || '';
      const description = item.querySelector('description')?.textContent || '';
      const link = item.querySelector('link')?.textContent || '';
      const pubDate = item.querySelector('pubDate')?.textContent || '';
      
      
        if (isDisasterRelated(title + ' ' + description)) {
        articles.push({
          title: title.trim(),
          description: description.replace(/<[^>]*>/g, '').trim().substring(0, 150),
          link,
          pubDate: new Date(pubDate),
          source: new URL(url).hostname
        });
      }
    });

    return articles;
  } catch (error) {
    console.error('Error fetching RSS feed:', url, error);
    return [];
  }
};

export const fetchNewsAlerts = async () => {
  const rssSources = [
    'https://www.setopati.com/feed',
  ];
  
  try {
    const allArticles = [];
    
    for (const source of rssSources) {
      const articles = await parseRSSFeed(source);
      allArticles.push(...articles);
    }

    allArticles.sort((a, b) => b.pubDate - a.pubDate);

    const uniqueArticles = [];
    allArticles.forEach(article => {
      const isDuplicate = uniqueArticles.some(existing => 
        existing.title.substring(0, 30) === article.title.substring(0, 30)
      );
      if (!isDuplicate) {
        uniqueArticles.push(article);
      }
    });

    return uniqueArticles.slice(0, 10);
  } catch (error) {
    console.error('Error fetching news alerts:', error);
    return [];
  }
};
