

import { useState, useEffect } from 'react'
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom'
import * as patientsService from './services/patients.js'
import CheckIn from './pages/CheckIn.jsx'
import CheckInSuccess from './pages/CheckInSuccess.jsx'
import PatientProfile from './pages/PatientProfile.jsx'
import logo from './assets/logo.png'

import { Routes, Route } from "react-router";
import { useContext } from "react";

import Home from "./pages/Home.jsx";
import Connected from "./pages/Connected.jsx";
import CalendarPage from "./pages/Calendar.jsx";
import AdminUsers from "./pages/AdminUsers.jsx";
import BootstrapAdmin from "./pages/BootstrapAdmin.jsx";
import AppointmentManager from "./pages/AppointmentManager.jsx";

import NavBar from "./components/NavBar/NavBar";
import SignUpForm from "./components/SignUpForm/SignUpForm";
import SignInForm from "./components/SignInForm/SignInForm";
import Landing from "./components/Landing/Landing";
import Dashboard from "./components/Dashboard/Dashboard";
import { UserContext } from "./contexts/UserContext";
import RequireRole from "./components/RequireRole/RequireRole.jsx";





const App = () => {
  const [patient, setPatient] = useState(null)
  const [statusMsg, setStatusMsg] = useState('')
  const navigate = useNavigate()

  const { user } = useContext(UserContext);

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

      <NavBar />

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
          <Route path="/home" element={<Home />} />
          <Route path="/connected" element={<Connected />} />
          <Route path="/agenda" element={<Connected />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route
            path="/appointments"
            element={
              <RequireRole roles={["admin", "reception"]}>
                <AppointmentManager />
              </RequireRole>
            }
          />
          <Route path="/sign-up" element={<SignUpForm />} />
          <Route path="/sign-in" element={<SignInForm />} />
          <Route
            path="/admin/users"
            element={
              <RequireRole roles={["admin"]}>
                <AdminUsers />
              </RequireRole>
            }
          />
          <Route path="/bootstrap-admin" element={<BootstrapAdmin />} />
        </Routes>
      </main>
    </div>
  )
}

export default App;
