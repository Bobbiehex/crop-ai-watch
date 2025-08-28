import React, { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MapPin } from 'lucide-react';

// Extend Window interface for Google Maps
declare global {
  interface Window {
    google: any;
  }
}

interface WeatherMapProps {
  onLocationChange: (lat: number, lon: number, location: string) => void;
}

const WeatherMap = ({ onLocationChange }: WeatherMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const marker = useRef<any>(null);
  const [searchInput, setSearchInput] = useState('');
  const [googleApiKey, setGoogleApiKey] = useState('');

  // Google Maps initialization
  useEffect(() => {
    if (!googleApiKey) return;

    const initializeMap = () => {
      if (!mapContainer.current || !window.google) return;

      map.current = new window.google.maps.Map(mapContainer.current, {
        center: { lat: 0, lng: 20 },
        zoom: 2,
        mapTypeId: 'satellite'
      });

      // Add click handler for location selection
      map.current.addListener('click', async (e: any) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();

        // Remove existing marker
        if (marker.current) {
          marker.current.setMap(null);
        }

        // Add new marker
        marker.current = new window.google.maps.Marker({
          position: { lat, lng },
          map: map.current,
          title: 'Selected Location'
        });

        // Get location name from coordinates using reverse geocoding
        try {
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
            if (status === 'OK' && results[0]) {
              const locationName = results[0].formatted_address;
              onLocationChange(lat, lng, locationName);
            } else {
              onLocationChange(lat, lng, `${lat.toFixed(2)}, ${lng.toFixed(2)}`);
            }
          });
        } catch (error) {
          console.error('Error getting location name:', error);
          onLocationChange(lat, lng, `${lat.toFixed(2)}, ${lng.toFixed(2)}`);
        }
      });
    };

    // Load Google Maps API
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${googleApiKey}&libraries=geometry`;
      script.onload = initializeMap;
      document.head.appendChild(script);
    } else {
      initializeMap();
    }
  }, [googleApiKey, onLocationChange]);

  const handleSearch = async () => {
    if (!searchInput || !window.google) return;

    try {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: searchInput }, (results: any, status: any) => {
        if (status === 'OK' && results[0]) {
          const location = results[0].geometry.location;
          const lat = location.lat();
          const lng = location.lng();
          const locationName = results[0].formatted_address;

          // Move map to location
          map.current?.setCenter({ lat, lng });
          map.current?.setZoom(10);

          // Remove existing marker
          if (marker.current) {
            marker.current.setMap(null);
          }

          // Add new marker
          marker.current = new window.google.maps.Marker({
            position: { lat, lng },
            map: map.current,
            title: locationName
          });

          onLocationChange(lat, lng, locationName);
        }
      });
    } catch (error) {
      console.error('Error searching location:', error);
    }
  };

  // Show simple location selector without Google Maps if no API key
  if (!googleApiKey) {
    return (
      <div className="bg-gradient-subtle h-96 rounded-lg flex flex-col items-center justify-center p-6">
        <h3 className="text-lg font-semibold mb-4">Location Weather</h3>
        <p className="text-muted-foreground mb-4 text-center">
          Click the button below to use your current location for weather data
        </p>
        <Button 
          onClick={() => {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  const { latitude, longitude } = position.coords;
                  onLocationChange(latitude, longitude, "Current Location");
                },
                (error) => {
                  console.error('Error getting location:', error);
                  // Default to London if location access is denied
                  onLocationChange(51.5074, -0.1278, "London, UK");
                }
              );
            } else {
              // Default to London if geolocation not supported
              onLocationChange(51.5074, -0.1278, "London, UK");
            }
          }}
          className="mb-4"
        >
          <MapPin className="h-4 w-4 mr-2" />
          Use My Location
        </Button>
        <div className="grid grid-cols-2 gap-2 w-full max-w-md">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onLocationChange(40.7128, -74.0060, "New York, USA")}
          >
            New York
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onLocationChange(51.5074, -0.1278, "London, UK")}
          >
            London
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onLocationChange(35.6762, 139.6503, "Tokyo, Japan")}
          >
            Tokyo
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onLocationChange(-33.8688, 151.2093, "Sydney, Australia")}
          >
            Sydney
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Search for a location..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Button onClick={handleSearch} size="sm">
          <Search className="h-4 w-4" />
        </Button>
      </div>
      <div ref={mapContainer} className="h-96 rounded-lg" />
      <p className="text-xs text-muted-foreground text-center">
        Click on the map to select a location for weather data
      </p>
    </div>
  );
};

export default WeatherMap;