export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const formatTimeAgo = (timestamp) => {
  const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};

export const disasterKeywords = {
  earthquake: ["भूकम्प", "भुकम्प", "earthquake", "tremor", "seismic"],
  flood: ["बाढी", "बाढि", "flood", "flooding", "inundation", "डुबान"],
  landslide: ["पहिरो", "landslide", "mudslide", "भूस्खलन"],
  storm: ["आँधी", "आंधी", "बेहरी", "storm", "cyclone", "hurricane", "तूफान"],
  fire: ["आगलागी", "आगो", "fire", "blaze", "दहन"],
  general: [
    "प्रकोप",
    "विपद",
    "disaster",
    "emergency",
    "संकट",
    "क्षति",
    "damage",
  ],
};

export const isDisasterRelated = (text) => {
  const lowerText = text.toLowerCase();
  return Object.values(disasterKeywords)
    .flat()
    .some((keyword) => lowerText.includes(keyword.toLowerCase()));
};
