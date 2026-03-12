export const getCoordinatesFromAddress = async (address: string) => {
  try {
    const encodedAddress = encodeURIComponent(address);
    // Using OpenStreetMap Nominatim API (Free, but has strict usage policy: 1 request/sec max, do not bulk scrape)
    // User-Agent is required.
    const url = `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&limit=1`;
    
    // We must pass a custom User-Agent to comply with Nominatim policy
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'UmrahTravellerApp/1.0',
        'Accept-Language': 'en'
      }
    });
    
    const data = await response.json();
    console.log(`Nominatim response for ${address}:`, data);
    
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
        displayName: data[0].display_name
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching coordinates:', error);
    return null;
  }
};

// Haversine formula to calculate distance in km
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
};

export const calculateBearing = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const phi1 = deg2rad(lat1);
  const phi2 = deg2rad(lat2);
  const deltaLambda = deg2rad(lon2 - lon1);

  const y = Math.sin(deltaLambda) * Math.cos(phi2);
  const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);
  const theta = Math.atan2(y, x);
  const bearing = (rad2deg(theta) + 360) % 360; // range [0, 360]
  return bearing;
};

const rad2deg = (rad: number) => {
  return rad * (180 / Math.PI);
};

const deg2rad = (deg: number) => {
  return deg * (Math.PI / 180);
};

export const formatDistance = (distanceKm: number) => {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000).toLocaleString('en-US')} M`;
  }
  return `${distanceKm.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} KM`;
};
