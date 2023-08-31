import { useState } from 'react'
import { format } from 'date-fns';
import LocationInput from "./Components/LocationInput.jsx";
import DateInput from "./Components/DateInput.jsx";
import WeatherDisplay from "./Components/WeatherDisplay.jsx";
import "./App.css"

export default function App() {
  const [weatherInput, setWeatherInput] = useState({
    location: null,
    date: format(new Date(), 'yyyy-MM-d')
  });

  const onDateUpdated = (date) => {
    console.log("🚀 ~ file: App.jsx:6 ~ onDateUpdated ~ date:", date)
    setWeatherInput( weatherInput => ({...weatherInput, ...{date: date}}) );
  };
  const onLocationUpdated = (location) => {
    console.log("🚀 ~ file: App.jsx:6 ~ onChangelocation ~ location:", location)
    setWeatherInput( weatherInput => ({...weatherInput, ...{location: location} }) );
  };
  return (
    <>
      <div className="text-3xl font-bold text-teal-500 mb-2">
        Umbrella
      </div>
      <LocationInput onLocationUpdated={onLocationUpdated}/>
      <DateInput onDateUpdated={onDateUpdated}/>
      <WeatherDisplay weatherInput={weatherInput}/>
    </>
  )
}
