import LocationInput from "./Components/LocationInput.jsx";
import DateInput from "./Components/DateInput.jsx";
import "./App.css"
export default function App() {
  const onDateUpdated = (date) => {
    console.log("🚀 ~ file: App.jsx:6 ~ onDateUpdated ~ date:", date)
  };
  const onLocationUpdated = (location) => {
    console.log("🚀 ~ file: App.jsx:6 ~ onChangelocation ~ location:", location)
  };
  return (
    <>
      <div className="text-3xl font-bold text-teal-500 mb-2">
        Umbrella
      </div>
      <LocationInput onLocationUpdated={onLocationUpdated}/>
      <DateInput onDateUpdated={onDateUpdated}/>
    </>
  )
}
