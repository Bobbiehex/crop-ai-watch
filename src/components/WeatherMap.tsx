import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

interface WeatherMapProps {
  onLocationChange: (lat: number, lon: number, location: string) => void;
}

const WeatherMap = ({ onLocationChange }: WeatherMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [mapboxToken, setMapboxToken] = useState('');

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      zoom: 2,
      center: [0, 20],
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add click handler for location selection
    map.current.on('click', async (e) => {
      const { lng, lat } = e.lngLat;
      
      // Remove existing marker
      if (marker.current) {
        marker.current.remove();
      }
      
      // Add new marker
      marker.current = new mapboxgl.Marker()
        .setLngLat([lng, lat])
        .addTo(map.current!);
        
      // Get location name from coordinates
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxToken}`
        );
        const data = await response.json();
        const locationName = data.features[0]?.place_name || `${lat.toFixed(2)}, ${lng.toFixed(2)}`;
        
        onLocationChange(lat, lng, locationName);
      } catch (error) {
        console.error('Error getting location name:', error);
        onLocationChange(lat, lng, `${lat.toFixed(2)}, ${lng.toFixed(2)}`);
      }
    });

    return () => {
      map.current?.remove();
    };
  }, [mapboxToken, onLocationChange]);

  const handleSearch = async () => {
    if (!searchInput || !mapboxToken) return;

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchInput)}.json?access_token=${mapboxToken}`
      );
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        const locationName = data.features[0].place_name;
        
        // Fly to location
        map.current?.flyTo({
          center: [lng, lat],
          zoom: 10,
          essential: true
        });
        
        // Remove existing marker
        if (marker.current) {
          marker.current.remove();
        }
        
        // Add new marker
        marker.current = new mapboxgl.Marker()
          .setLngLat([lng, lat])
          .addTo(map.current!);
          
        onLocationChange(lat, lng, locationName);
      }
    } catch (error) {
      console.error('Error searching location:', error);
    }
  };

  // If no Mapbox token, show input field
  if (!mapboxToken) {
    return (
      <div className="bg-gradient-subtle h-96 rounded-lg flex flex-col items-center justify-center p-6">
        <h3 className="text-lg font-semibold mb-4">Interactive Weather Map</h3>
        <p className="text-muted-foreground mb-4 text-center">
          Enter your Mapbox public token to enable the interactive map feature
        </p>
        <div className="flex gap-2 w-full max-w-md">
          <Input
            type="password"
            placeholder="Enter Mapbox public token"
            value={mapboxToken}
            onChange={(e) => setMapboxToken(e.target.value)}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Get your token at{' '}
          <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="text-primary">
            mapbox.com
          </a>
        </p>
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