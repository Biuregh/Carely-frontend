

import { useState, useEffect } from 'react'
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom'
import * as patientsService from './services/patients.js'
import CheckIn from './pages/CheckIn.jsx'
import CheckInSuccess from './pages/CheckInSuccess.jsx'
import PatientProfile from './pages/PatientProfile.jsx'
import logo from './assets/logo.png'  



const App = () => {
  const [patient, setPatient] = useState(null)
  const [statusMsg, setStatusMsg] = useState('')
  const navigate = useNavigate()

  const currentId = () => localStorage.getItem('patientId')

  const handleCheckIn = async (payload) => {
    const data = await patientsService.checkIn(payload)
    if (data?.patientId) {
      localStorage.setItem('patientId', data.patientId)
      setPatient({ id: data.patientId, ...payload })
    }
    setStatusMsg(data?.message || 'You are checked in!')
    navigate('/checkin/success')
  }

  const handleLoadPatient = async (id) => {
    const pid = id || currentId()
    if (!pid) return
    const p = await patientsService.getPatient(pid)
    setPatient(p)
  }

  const handleSavePatient = async (update) => {
    const pid = currentId()
    if (!pid) return
    const updated = await patientsService.updatePatient(pid, update)
    setPatient(updated || { ...(patient || {}), ...update })
  }

  useEffect(() => {
    if (currentId()) handleLoadPatient()
  }, [])

  return (
    <div>
      <header>
  
          <img src={logo} alt="Carely logo" width="120" />
       
        <nav>
          <NavLink to="/" end>Check-in</NavLink>
          <NavLink to="/profile">My Profile</NavLink>
        </nav>
      </header>

      <main>
        <Routes>
          <Route
            path="/"
            element={<CheckIn onCheckIn={handleCheckIn} />}
          />
          <Route
            path="/checkin/success"
            element={<CheckInSuccess message={statusMsg} patientId={patient?.id} />}
          />
          <Route
            path="/profile"
            element={
              <PatientProfile
                patient={patient}
                loadPatient={handleLoadPatient}
                savePatient={handleSavePatient}
              />
            }
          />
        </Routes>
      </main>
    </div>
  )
}

export default App