import { useState, useEffect } from 'react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'
import { Combobox } from '@headlessui/react'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function LocationInput({ onLocationUpdated }) {
  let [input, setInput] = useState('');
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null)

  const handleInputChange = async (event) => {
    const newInput = event.target.value;
    setInput(newInput);
    
    if (newInput.length > 2) {
      const locations = await fetchLocationSuggestions(newInput);
      setLocations(locations);
    } else {
      setLocations([]);
    }
  };

  const fetchLocationSuggestions = async (input) => {
    const username = 'weatherea';
    const baseUrl = 'http://api.geonames.org/searchJSON';

    try {
      const response = await fetch(`${baseUrl}?q=${input}&maxRows=5&username=${username}`);
      const data = await response.json();
      
      return data.geonames;
    } catch (error) {
      console.error('Error fetching location suggestions:', error);
      return [];
    }
  };

  useEffect(() => {
    setInput(selectedLocation?.toponymName);
    onLocationUpdated(selectedLocation);
  }, [selectedLocation])
  
  return (
    <>
      <Combobox value={selectedLocation} onChange={setSelectedLocation}>
        <Combobox.Label className="block text-sm font-medium text-gray-900">Type a location</Combobox.Label>
        <div className="relative mt-2 w-72">
          <Combobox.Input
            className="w-full rounded-md border-0 bg-white py-1.5 pl-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
            value={input}
            onChange={handleInputChange}
          />
          <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md pr-1 focus:outline-none">
            <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </Combobox.Button>

          {locations.length > 0 && (
            <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              {locations.map((location) => (
                <Combobox.Option
                  key={location.geonameId}
                  value={location}
                  className={({ active }) =>
                    classNames(
                      'relative cursor-default select-none py-2 pl-8 pr-4',
                      active ? 'bg-indigo-600 text-white' : 'text-gray-900'
                    )
                  }
                >
                  {({ active, selected }) => (
                    <>
                      <span className={classNames('block truncate', selected && 'font-semibold')}>{location.toponymName}</span>

                      {selected && (
                        <span
                          className={classNames(
                            'absolute inset-y-0 left-0 flex items-center pl-1.5',
                            active ? 'text-white' : 'text-indigo-600'
                          )}
                        >
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      )}
                    </>
                  )}
                </Combobox.Option>
              ))}
            </Combobox.Options>
          )}
        </div>
      </Combobox>
    </>
  )
}