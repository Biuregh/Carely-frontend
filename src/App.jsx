import { Routes, Route, Navigate, useNavigate } from "react-router";
import { useContext, useEffect, useState } from "react";

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
import RequireRole from "./components/RequireRole/RequireRole.jsx";

import CheckIn from "./pages/CheckIn.jsx";
import CheckInSuccess from "./pages/CheckInSuccess.jsx";
import PatientProfile from "./pages/PatientProfile.jsx";

import { UserContext } from "./contexts/UserContext";

export default function App() {
  const { user } = useContext(UserContext);

  return (
    <div>
      <NavBar />
      <main>
        <Routes>
          {/* Public check-in flow */}
          <Route path="/" element={<CheckIn />} />
          <Route path="/checkin/success" element={<CheckInSuccess />} />
          <Route path="/profile" element={<PatientProfile />} />

          {/* App core */}
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
  );
}
