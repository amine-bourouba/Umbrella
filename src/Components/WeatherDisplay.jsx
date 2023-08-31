import { useEffect } from 'react'

export default function WeatherDisplay({ weatherInput }) {
  
  const getCurrentWeather = async () => {
    if (weatherInput.location) {
      const lat = weatherInput.location?.lat;
      const lon = weatherInput.location?.lng;
      const date = weatherInput?.date;
      const key = '35c6a7b80591423896d1e08877064766'
      const baseUrl = 'https://api.weatherbit.io/v2.0/history/hourly';

      try {
        const response = await fetch(`${baseUrl}?lat=${lat}&lon=${lon}&start_date=${date}%3A00&end_date=${date}%3A24&key=${key}`)
        const data = await response.json();      
        console.log("🚀 ~ file: WeatherDisplay.jsx:12 ~ getCurrentWeather ~ data:", data)
      } catch (error) {
        console.error('Error fetching location suggestions:', error);
        return [];
      }
    }
  }

  useEffect(() => {
    getCurrentWeather()
  }, [weatherInput])
  return (
    <>
      <div className="mt-2 w-72">
        {weatherInput?.date}
      </div>
      <div className="mt-2 w-72">
        {weatherInput?.location?.toponymName}
      </div>
    </>
  )
}