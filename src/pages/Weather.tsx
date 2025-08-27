import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import WeatherMap from "../components/WeatherMap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Cloud, 
  Sun, 
  CloudRain, 
  Wind, 
  Thermometer,
  Droplets,
  Eye,
  MapPin,
  RefreshCw
} from "lucide-react";

interface WeatherData {
  location: string;
  country: string;
  forecast: Array<{
    date: string;
    temperature: {
      day: number;
      night: number;
      min: number;
      max: number;
    };
    humidity: number;
    windSpeed: number;
    description: string;
    precipitation: number;
  }>;
}

const Weather = () => {
  const { toast } = useToast();
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<string>("");
  const [coordinates, setCoordinates] = useState<{ lat: number; lon: number } | null>(null);

  // Get user's current location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCoordinates({ lat: latitude, lon: longitude });
          fetchWeatherData(latitude, longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
          // Default to New York if location access is denied
          setCoordinates({ lat: 40.7128, lon: -74.0060 });
          fetchWeatherData(40.7128, -74.0060, "New York, NY, USA");
        }
      );
    }
  }, []);

  const fetchWeatherData = async (lat: number, lon: number, location?: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-weather', {
        body: { lat, lon, location }
      });

      if (error) throw error;

      setWeatherData(data.data);
      setCurrentLocation(location || data.data.location);
    } catch (error: any) {
      console.error('Weather fetch error:', error);
      toast({
        title: "Weather Error",
        description: error.message || "Failed to fetch weather data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLocationChange = (lat: number, lon: number, location: string) => {
    setCoordinates({ lat, lon });
    setCurrentLocation(location);
    fetchWeatherData(lat, lon, location);
  };

  const refreshWeather = () => {
    if (coordinates) {
      fetchWeatherData(coordinates.lat, coordinates.lon, currentLocation);
    }
  };

  const getRainColor = (percentage: number) => {
    if (percentage > 60) return "destructive";
    if (percentage > 30) return "warning";
    return "success";
  };

  const getWeatherIcon = (description: string) => {
    const desc = description.toLowerCase();
    if (desc.includes('rain')) return CloudRain;
    if (desc.includes('cloud')) return Cloud;
    return Sun;
  };

  const currentWeather = weatherData?.forecast[0];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Weather <span className="bg-gradient-primary bg-clip-text text-transparent">Forecast</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Real-time weather data and forecasts to make better farming decisions 
            and optimize your crop management strategies.
          </p>
        </div>

        {/* Location and Refresh */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <span className="text-lg font-medium">
              {currentLocation || "Loading location..."}
            </span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshWeather}
            disabled={loading || !coordinates}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Interactive Map */}
        <Card className="shadow-soft mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Interactive Weather Map</CardTitle>
          </CardHeader>
          <CardContent>
            <WeatherMap onLocationChange={handleLocationChange} />
          </CardContent>
        </Card>

        {weatherData && currentWeather ? (
          <>
            {/* Current Weather */}
            <Card className="shadow-soft mb-8">
              <CardHeader>
                <CardTitle className="text-2xl text-center">Current Conditions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-5 gap-6 text-center">
                  <div className="space-y-2">
                    <Thermometer className="h-8 w-8 mx-auto text-primary" />
                    <div className="text-2xl font-bold">{currentWeather.temperature.day}°C</div>
                    <div className="text-sm text-muted-foreground">Temperature</div>
                  </div>
                  
                  <div className="space-y-2">
                    <Droplets className="h-8 w-8 mx-auto text-accent" />
                    <div className="text-2xl font-bold">{currentWeather.humidity}%</div>
                    <div className="text-sm text-muted-foreground">Humidity</div>
                  </div>

                  <div className="space-y-2">
                    <Wind className="h-8 w-8 mx-auto text-earth" />
                    <div className="text-2xl font-bold">{currentWeather.windSpeed} km/h</div>
                    <div className="text-sm text-muted-foreground">Wind Speed</div>
                  </div>

                  <div className="space-y-2">
                    {(() => {
                      const WeatherIcon = getWeatherIcon(currentWeather.description);
                      return <WeatherIcon className="h-8 w-8 mx-auto text-muted-foreground" />;
                    })()}
                    <div className="text-xl font-bold capitalize">{currentWeather.description}</div>
                    <div className="text-sm text-muted-foreground">Condition</div>
                  </div>

                  <div className="space-y-2">
                    <Eye className="h-8 w-8 mx-auto text-success" />
                    <div className="text-2xl font-bold">{currentWeather.precipitation} mm</div>
                    <div className="text-sm text-muted-foreground">Precipitation</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 7-Day Forecast */}
            <Card className="shadow-soft mb-8">
              <CardHeader>
                <CardTitle className="text-2xl">7-Day Forecast</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                  {weatherData.forecast.map((day, index) => {
                    const WeatherIcon = getWeatherIcon(day.description);
                    const rainChance = Math.round(day.precipitation * 10); // Convert mm to percentage estimate
                    
                    return (
                      <div key={index} className="text-center p-4 border border-border rounded-lg">
                        <div className="font-medium mb-2">
                          {index === 0 ? 'Today' : new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                        </div>
                        <WeatherIcon className="h-8 w-8 mx-auto mb-2 text-primary" />
                        <div className="text-xl font-bold mb-1">{day.temperature.day}°C</div>
                        <div className="text-sm text-muted-foreground mb-2 capitalize">{day.description}</div>
                        <Badge variant={getRainColor(rainChance) as any} className="text-xs">
                          {day.precipitation}mm
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Farming Recommendations */}
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="text-2xl">Today's Farming Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${currentWeather.precipitation < 0.5 ? 'bg-success' : 'bg-warning'}`}></div>
                      <div>
                        <h4 className="font-medium">Irrigation</h4>
                        <p className="text-sm text-muted-foreground">
                          {currentWeather.precipitation < 0.5 
                            ? "Good conditions for irrigation. Low precipitation and optimal humidity for water retention."
                            : "Consider delaying irrigation due to expected precipitation."
                          }
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${currentWeather.windSpeed < 15 ? 'bg-success' : 'bg-warning'}`}></div>
                      <div>
                        <h4 className="font-medium">Spraying</h4>
                        <p className="text-sm text-muted-foreground">
                          {currentWeather.windSpeed < 15
                            ? "Excellent conditions for spraying applications. Low wind reduces drift risk."
                            : "High wind conditions. Consider timing spray applications for calmer periods."
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${currentWeather.precipitation < 1 ? 'bg-success' : 'bg-destructive'}`}></div>
                      <div>
                        <h4 className="font-medium">Field Work</h4>
                        <p className="text-sm text-muted-foreground">
                          {currentWeather.precipitation < 1
                            ? "Good conditions for field operations. Low precipitation risk and stable weather."
                            : "Avoid heavy field work due to wet conditions. Wait for drier weather."
                          }
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${currentWeather.precipitation < 0.5 && currentWeather.humidity < 80 ? 'bg-success' : 'bg-warning'}`}></div>
                      <div>
                        <h4 className="font-medium">Harvesting</h4>
                        <p className="text-sm text-muted-foreground">
                          {currentWeather.precipitation < 0.5 && currentWeather.humidity < 80
                            ? "Optimal conditions for harvesting activities. Low precipitation and humidity."
                            : "Monitor conditions closely. High humidity or precipitation may affect harvest quality."
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        ) : loading ? (
          <Card className="shadow-soft">
            <CardContent className="text-center py-12">
              <RefreshCw className="h-12 w-12 mx-auto animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Loading weather data...</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-soft">
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">No weather data available. Please try refreshing or select a location on the map.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Weather;