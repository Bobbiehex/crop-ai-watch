import Layout from "../components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Cloud, 
  Sun, 
  CloudRain, 
  Wind, 
  Thermometer,
  Droplets,
  Eye
} from "lucide-react";

const Weather = () => {
  // Mock weather data
  const currentWeather = {
    temperature: 24,
    humidity: 65,
    windSpeed: 12,
    condition: "Partly Cloudy",
    visibility: 10
  };

  const forecast = [
    { day: "Today", temp: "24°", condition: "Partly Cloudy", rain: 20, icon: Cloud },
    { day: "Tomorrow", temp: "26°", condition: "Sunny", rain: 5, icon: Sun },
    { day: "Wednesday", temp: "22°", condition: "Light Rain", rain: 80, icon: CloudRain },
    { day: "Thursday", temp: "25°", condition: "Sunny", rain: 10, icon: Sun },
    { day: "Friday", temp: "23°", condition: "Cloudy", rain: 30, icon: Cloud },
    { day: "Saturday", temp: "27°", condition: "Sunny", rain: 0, icon: Sun },
    { day: "Sunday", temp: "25°", condition: "Partly Cloudy", rain: 15, icon: Cloud },
  ];

  const getRainColor = (percentage: number) => {
    if (percentage > 60) return "destructive";
    if (percentage > 30) return "warning";
    return "success";
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Weather <span className="bg-gradient-primary bg-clip-text text-transparent">Forecast</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Stay informed with accurate weather predictions to make better farming decisions 
            and optimize your crop management strategies.
          </p>
        </div>

        {/* Current Weather */}
        <Card className="shadow-soft mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Current Conditions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-5 gap-6 text-center">
              <div className="space-y-2">
                <Thermometer className="h-8 w-8 mx-auto text-primary" />
                <div className="text-2xl font-bold">{currentWeather.temperature}°C</div>
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
                <Cloud className="h-8 w-8 mx-auto text-muted-foreground" />
                <div className="text-xl font-bold">{currentWeather.condition}</div>
                <div className="text-sm text-muted-foreground">Condition</div>
              </div>

              <div className="space-y-2">
                <Eye className="h-8 w-8 mx-auto text-success" />
                <div className="text-2xl font-bold">{currentWeather.visibility} km</div>
                <div className="text-sm text-muted-foreground">Visibility</div>
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
              {forecast.map((day, index) => (
                <div key={index} className="text-center p-4 border border-border rounded-lg">
                  <div className="font-medium mb-2">{day.day}</div>
                  <day.icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <div className="text-xl font-bold mb-1">{day.temp}</div>
                  <div className="text-sm text-muted-foreground mb-2">{day.condition}</div>
                  <Badge variant={getRainColor(day.rain) as any} className="text-xs">
                    {day.rain}% rain
                  </Badge>
                </div>
              ))}
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
                  <div className="w-2 h-2 bg-success rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium">Irrigation</h4>
                    <p className="text-sm text-muted-foreground">
                      Good conditions for irrigation. Low wind and moderate humidity ideal for water retention.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-warning rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium">Spraying</h4>
                    <p className="text-sm text-muted-foreground">
                      Moderate wind conditions. Consider timing spray applications for early morning or evening.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-success rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium">Field Work</h4>
                    <p className="text-sm text-muted-foreground">
                      Excellent conditions for field operations. Good visibility and stable weather.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-success rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium">Harvesting</h4>
                    <p className="text-sm text-muted-foreground">
                      Optimal conditions for harvesting activities. Low precipitation risk.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Weather;