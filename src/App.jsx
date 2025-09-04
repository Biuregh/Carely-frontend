import { Routes, Route } from "react-router";
import { useContext } from "react";

import Home from "./pages/Home.jsx";
import Connected from "./pages/Connected.jsx";
import CalendarPage from "./pages/Calendar.jsx";

import NavBar from "./components/NavBar/NavBar";
import SignUpForm from "./components/SignUpForm/SignUpForm";
import SignInForm from "./components/SignInForm/SignInForm";
import Landing from "./components/Landing/Landing";
import Dashboard from "./components/Dashboard/Dashboard";
import { UserContext } from "./contexts/UserContext";

function App() {
  const { user } = useContext(UserContext);

  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={user ? <Dashboard /> : <Landing />} />
        <Route path="/home" element={<Home />} />
        <Route path="/connected" element={<Connected />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/sign-up" element={<SignUpForm />} />
        <Route path="/sign-in" element={<SignInForm />} />
      </Routes>
    </>
  );
}

export default App;
