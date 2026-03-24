import { useState, useEffect } from 'react';
import { weatherService } from '../services/weatherService';
import WeatherWidget from '../components/weather/WeatherWidget';
import toast from 'react-hot-toast';

export default function Weather() {
  const [weather,  setWeather]  = useState(null);
  const [wLoading, setWLoading] = useState(false);
  const [weatherCity, setWeatherCity] = useState(() => localStorage.getItem('weatherCity') || 'New Delhi');

  useEffect(() => {
    if (weatherCity) {
      handleSearch(weatherCity);
    }
  }, []);

  const handleSearch = async (city) => {
    if (!city.trim()) return;
    setWLoading(true);
    try {
      const { data } = await weatherService.getByLocation(city);
      setWeather(data);
      setWeatherCity(city);
      localStorage.setItem('weatherCity', city);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not fetch weather');
    } finally {
      setWLoading(false);
    }
  };

  const handleGeolocate = async (lat, lon) => {
    setWLoading(true);
    try {
      const { data } = await weatherService.getByCoords(lat, lon);
      setWeather(data);
      const city = data.location || 'My Location';
      setWeatherCity(city);
      localStorage.setItem('weatherCity', city);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not fetch weather for your location');
    } finally {
      setWLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Farm Weather</h1>
        <p>Check real-time weather conditions, 7-day extended forecasts, and receive smart weather alerts</p>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <WeatherWidget data={weather} loading={wLoading} onSearch={handleSearch} onGeolocate={handleGeolocate} initialCity={weatherCity} />
      </div>
    </div>
  );
}
