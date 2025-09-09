
import { useLocation, Link } from 'react-router-dom'

export default function CheckInSuccess(){
  const { state } = useLocation() || {}
  const msg = state?.message || 'You are checked in!'
  const pid = state?.patientId

  return (
    <div className="card">
      <h2>Check-in Complete</h2>
      <p className="sub">{msg}</p>
      {pid && <p className="note">Patient ID: {pid}</p>}
      <div className="row">
        <Link className="btn secondary" to="/">New Check-in</Link>
        <Link className="btn" to="/profile">Go to My Profile</Link>
      </div>
    </div>
  )
}