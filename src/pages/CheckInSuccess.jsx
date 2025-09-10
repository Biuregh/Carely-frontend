
import { useLocation, Link } from 'react-router-dom'

export default function CheckInSuccess(){
  const { state } = useLocation() || {}
  const msg = state?.message || 'You are checked in!'
  const pid = state?.patientId

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-3xl bg-white shadow rounded p-20">
          <h2 className="text-2xl font-semibold text-teal-600 mb-4">Check-in Complete</h2>
          <p className="sub">{msg}</p>
          {pid && <p className="note">Patient ID: {pid}</p>}
          <div className="row">
            <Link className="btn secondary" to="/">New Check-in</Link>
            <Link className="btn" to="/profile">Go to My Profile</Link>
          </div>
      </div>
    </div>
  )
}