import { Routes, Route, Navigate } from "react-router-dom";
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
import RequireRole from "./components/RequireRole/RequireRole.jsx";

import CheckIn from "./pages/CheckIn.jsx";
import CheckInSuccess from "./pages/CheckInSuccess.jsx";
import PatientProfile from "./pages/PatientProfile.jsx";
import StaffDashboard from "./pages/StaffDashboard.jsx";

import { UserContext } from "./contexts/UserContext";

export default function App() {
  const { user } = useContext(UserContext);

  return (
    <div className="min-h-screen bg-gray-50">
     
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-gray-200">
        <NavBar />
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <Routes>
          <Route path="/" element={<CheckIn />} />
          <Route path="/checkin/success" element={<CheckInSuccess />} />
          <Route path="/profile" element={<PatientProfile />} />

          <Route
            path="/staff"
            element={
              <RequireRole roles={["admin", "reception"]}>
                <StaffDashboard />
              </RequireRole>
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

          <Route
            path="*"
            element={<Navigate to={user ? "/staff" : "/"} replace />}
          />
        </Routes>
      </main>

      <footer className="mt-10 mb-6 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} Carely
      </footer>
    </div>
  );
}
