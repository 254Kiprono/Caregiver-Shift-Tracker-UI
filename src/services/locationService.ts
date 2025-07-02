
export interface LocationResult {
  address: string;
  coordinates: string;
}

export const convertCoordinatesToAddress = async (
  latitude: number, 
  longitude: number
): Promise<LocationResult> => {
  try {
    // Using BigDataCloud's free reverse geocoding API
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch address');
    }
    
    const data = await response.json();
    
    let address = '';
    
    if (data && data.display_name) {
      address = data.display_name;
    } else if (data && data.locality && data.principalSubdivision) {
      address = `${data.locality}, ${data.principalSubdivision}`;
    } else if (data && data.city && data.countryName) {
      address = `${data.city}, ${data.countryName}`;
    } else {
      // Fallback to coordinates if no readable address found
      address = `Location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    }
    
    return {
      address,
      coordinates: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
    };
  } catch (error) {
    console.error('Failed to convert coordinates to address:', error);
    
    // Return coordinates as fallback
    return {
      address: `Location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
      coordinates: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
    };
  }
};

export const validateLocationProximity = (
  userLat: number,
  userLng: number,
  clientLat: number,
  clientLng: number,
  maxDistanceKm: number = 0.5
): boolean => {
  // Calculate distance between two coordinates using Haversine formula
  const R = 6371; // Earth's radius in kilometers
  const dLat = (clientLat - userLat) * Math.PI / 180;
  const dLng = (clientLng - userLng) * Math.PI / 180;
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(userLat * Math.PI / 180) * Math.cos(clientLat * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance <= maxDistanceKm;
};
