import { useState } from 'react'
import { format } from 'date-fns';
import PropTypes from 'prop-types';

DateInput.propTypes = {
  onDateUpdated: PropTypes.func
}

export default function DateInput({ onDateUpdated }) {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-d'));

  const onChangeDate = (date) =>  {
    setSelectedDate(date?.target?.value)
    onDateUpdated(date?.target?.value)
  }
  return (
    <>
      <div className="mt-2 text-sm font-medium text-gray-900">Select a date</div>
      <div className="mt-2 w-72">
        <input
          type="date"
          className="w-full rounded-md border-0 bg-white py-1.5 pl-3 pr-1 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
          value={selectedDate}
          onChange={onChangeDate}
        />
      </div>
    </>
  )
}