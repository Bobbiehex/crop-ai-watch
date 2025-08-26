import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lat, lon, location } = await req.json();
    console.log('Weather request for:', { lat, lon, location });

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openWeatherApiKey = Deno.env.get('OPENWEATHER_API_KEY');

    if (!openWeatherApiKey) {
      console.error('OpenWeather API key not found');
      return new Response(
        JSON.stringify({ error: 'Weather service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check cache first
    const cacheKey = location || `${lat},${lon}`;
    console.log('Checking cache for:', cacheKey);
    
    const { data: cachedData } = await supabase
      .from('weather_cache')
      .select('*')
      .eq('location', cacheKey)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (cachedData) {
      console.log('Returning cached weather data');
      return new Response(
        JSON.stringify({
          data: cachedData.weather_data,
          cached: true
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch fresh data from OpenWeather API
    console.log('Fetching fresh weather data from OpenWeather API');
    const weatherUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${openWeatherApiKey}&units=metric`;
    
    const weatherResponse = await fetch(weatherUrl);
    
    if (!weatherResponse.ok) {
      const errorText = await weatherResponse.text();
      console.error('OpenWeather API error:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch weather data' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const weatherData = await weatherResponse.json();
    console.log('Received weather data from OpenWeather API');

    // Process the weather data to get 7-day forecast
    const processed = {
      location: weatherData.city.name,
      country: weatherData.city.country,
      forecast: weatherData.list.filter((_: any, index: number) => index % 8 === 0).slice(0, 7).map((item: any) => ({
        date: item.dt_txt.split(' ')[0],
        temperature: {
          day: Math.round(item.main.temp),
          night: Math.round(item.main.temp_min),
          min: Math.round(item.main.temp_min),
          max: Math.round(item.main.temp_max)
        },
        humidity: item.main.humidity,
        windSpeed: Math.round(item.wind.speed * 3.6), // Convert m/s to km/h
        description: item.weather[0].description,
        icon: item.weather[0].icon,
        precipitation: Math.round((item.rain?.['3h'] || 0) * 100) / 100
      }))
    };

    // Cache the processed data
    console.log('Caching weather data');
    await supabase
      .from('weather_cache')
      .upsert({
        location: cacheKey,
        weather_data: processed,
        expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hour from now
      });

    console.log('Returning fresh weather data');
    return new Response(
      JSON.stringify({
        data: processed,
        cached: false
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in get-weather function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});