import { NavLink } from "react-router-dom";
import logo from "../../assets/logo.png"; // adjust path if needed

const NavBar = () => {
  return (
    <nav className="w-full shadow">
      {/* teal on the RIGHT → white on the LEFT */}
      <div className="flex items-center justify-between px-6 py-3 bg-gradient-to-l from-teal-600 to-white">
        {/* Left: Logo + Home */}
        <div className="flex items-center gap-3">
          <img src={logo} alt="Logo" className="h-20 w-20 object-contain" />
          <NavLink
            to="/"
            className="text-teal-700 font-semibold hover:text-teal-900 transition text-lg"
          >
            Home
          </NavLink>
        </div>

        {/* Right: links */}
        <div className="flex items-center gap-6">
          <NavLink
            to="/sign-in"
            className={({ isActive }) =>
              `transition hover:text-teal-300 ${
                isActive ? "text-teal-700 font-semibold" : "text-gray-700"
              }`
            }
          >
            Sign In
          </NavLink>
          <NavLink
            to="/sign-up"
            className={({ isActive }) =>
              `transition hover:text-teal-300 ${
                isActive ? "text-teal-700 font-semibold" : "text-gray-700"
              }`
            }
          >
            Sign Up
          </NavLink>
          <NavLink
            to="/calendar"
            className={({ isActive }) =>
              `transition hover:text-teal-300 ${
                isActive ? "text-teal-700 font-semibold" : "text-gray-700"
              }`
            }
          >
            Calendar
          </NavLink>
          {/* NEW: Patient Profile link */}
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `transition hover:text-teal-300 ${
                isActive ? "text-teal-700 font-semibold" : "text-gray-700"
              }`
            }
          >
            Patient Profile
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;