import { useContext, useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import * as appointmentService from './src/services/appointmentService.js';
import ProviderDashboard from './components/providerDashboard/providerDashboard.js';
import { UserContext } from './contexts/UserContext';
import NavBar from './src/components/NavBar/NavBar.jsx';
import Dashboard from './components/Dashboard';
import Landing from './components/Landing';
import SignUpForm from './components/SignUpForm';
import SignInForm from './components/SignInForm';

import './App.css';

   const handleLogout = () => {
        localStorage.removeItem('token');
        setUser(null);
        navigate('/sign-in');
    };
  
const App = () => {
  const { user } = useContext(UserContext);
  const [appointmentsList, setAppointmentsList] = useState([]);

  useEffect(() => {
    const fetchAllAppointments = async () => {
      try {
        const appointmentsData = await appointmentService.index();
        setAppointmentsList(appointmentsData); 
      } catch (error) {
        console.error('Failed to fetch appointments:', error);
      }
    };

    if (user) {
      fetchAllAppointments();
    }
  }, [user]);

  return (
    <>
      <h1>Welcome to Carely</h1>
   <NavBar user={user} onLogout={handleLogout} />.

      <Routes>
        <Route path="/" element={user ? <Dashboard /> : <Landing />} />

        {user ? (
          <>

            <Route path="*" element={<h2>Whoops, wrong page!</h2>} />
            <Route
              path="/appointments"
              element={user?.role === 'provider' ? <ProviderDashboard /> : <Navigate to="/" />}
            />
          </>
        ) : (
          <>
            <Route path="/sign-up" element={<SignUpForm />} />
            <Route path="/sign-in" element={<SignInForm />} />
          </>
        )}
      </Routes>
    </>
  );
};

export default App;