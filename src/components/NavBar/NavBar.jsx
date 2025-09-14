import { useContext } from "react";
import { UserContext } from "../../contexts/UserContext";
import logo from "../../assets/logo.png";
import { NavLink } from "react-router-dom";

const linkClass = ({ isActive }) =>
  `transition-colors ${
    isActive ? "text-white" : "text-gray-700 hover:text-white"
  }`;

const NavBar = () => {
  const { user } = useContext(UserContext) || {};

   return (
  <nav className="w-full sticky top-0 z-50 flex items-center justify-between px-6
    bg-gradient-to-r from-white to-[#30887f] border-b border-[#a7cbc7]/40 shadow h-30">
    
    <div className="flex items-center gap-4">
      <img src={logo} alt="Logo" className="h-25 w-auto" />
      <span className="text-gray-600 font-medium">
        {user ? `Welcome, ${user.username}` : "Welcome, Guest"}
      </span>
    </div>

    <ul className="flex items-center gap-6">
      <li>
        <NavLink to="/staff" end className={linkClass}>
          Dashboard
        </NavLink>
      </li>
      <li>
        <NavLink to="/agenda" end className={linkClass}>
          Schedule
        </NavLink>
      </li>
      <li>
        <NavLink to="/calendar" end className={linkClass}>
          Calendar
        </NavLink>
      </li>

      {user && (user.role === "admin" || user.role === "reception") && (
        <>
          <li>
            <NavLink to="/appointments" end className={linkClass}>
              Appointment Manager
            </NavLink>
          </li>
          <li>
            <NavLink to="/profile" end className={linkClass}>
              Patient Profile
            </NavLink>
          </li>
        </>
      )}

      {user && user.role === "admin" && (
        <>
          <li>
            <NavLink to="/admin/users" end className={linkClass}>
              Admin · Users
            </NavLink>
          </li>
          <li>
            <NavLink to="/home" end className={linkClass}>
              Clinic Google
            </NavLink>
          </li>
        </>
      )}
    </ul>
  </nav>
);
};

export default NavBar;