
import React, { useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useGeolocation } from '../../hooks/useGeolocation';

const LocationDisplay: React.FC = () => {
  const { getCurrentLocation, latitude, longitude, loading, error } = useGeolocation();
  const [addressText, setAddressText] = useState<string>('Getting your location...');

  useEffect(() => {
    // Get location when component mounts
    getCurrentLocation();
  }, [getCurrentLocation]);

  useEffect(() => {
    if (latitude && longitude) {
      convertCoordinatesToAddress(latitude, longitude);
    } else if (error) {
      setAddressText('Unable to get your location. Please enable location services.');
    } else if (loading) {
      setAddressText('Getting your location...');
    }
  }, [latitude, longitude, loading, error]);

  const convertCoordinatesToAddress = async (lat: number, lng: number) => {
    try {
      // Using a free reverse geocoding service
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
      );
      const data = await response.json();
      
      if (data && data.display_name) {
        setAddressText(data.display_name);
      } else if (data && data.locality && data.principalSubdivision) {
        setAddressText(`${data.locality}, ${data.principalSubdivision}`);
      } else {
        setAddressText(`Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      }
    } catch (error) {
      console.error('Failed to convert coordinates to address:', error);
      setAddressText(`Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    }
  };

  return (
    <Card className="mb-4 sm:mb-6">
      <CardHeader className="pb-3 sm:pb-4">
        <CardTitle className="text-base sm:text-lg">Clock-Out Location</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-start space-x-3 sm:space-x-4">
          <div className="w-20 h-16 sm:w-24 sm:h-20 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
            <MapPin className={`w-6 h-6 sm:w-8 sm:h-8 ${loading ? 'text-blue-500 animate-pulse' : error ? 'text-red-400' : 'text-green-500'}`} />
          </div>
          <div className="flex-1">
            <p className="text-sm sm:text-base text-gray-900 font-medium">
              {addressText}
            </p>
            {latitude && longitude && (
              <div>
                <p className="text-xs text-gray-500 mt-1">
                  Your current location will be recorded for clock-out verification
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Coordinates: {latitude.toFixed(6)}, {longitude.toFixed(6)}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LocationDisplay;
