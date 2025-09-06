
const CheckInSuccess = (props) => {
  return (
    <div className="w-full max-w-xl bg-white shadow rounded p-6">
      <h2 className="text-2xl font-semibold text-teal-600 mb-2">Check-in Complete</h2>
      <p className="text-gray-700 mb-2">{props.message || 'You are checked in!'}</p>
      {props.patientId && <p className="text-sm text-gray-500">Patient ID: {props.patientId}</p>}
    </div>
  )
}

export default CheckInSuccess