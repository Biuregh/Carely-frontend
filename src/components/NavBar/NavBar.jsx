import { NavLink } from "react-router-dom";
import logo from "../../assets/logo.png"; // adjust path if needed

const NavBar = () => {
  return (
    <nav>
      <ul>
        <li>Welcome, {user.username}</li>
        <li>
          <Link to="/staff">Dashboard</Link>
        </li>
        <li>
          <Link to="/agenda">Schedule</Link>
        </li>
        <li>
          <Link to="/calendar">Calendar</Link>
        </li>

        {(user.role === "admin" || user.role === "reception") && (
          <>
            <li>
              <Link to="/appointments">Appointment Manager</Link>
            </li>
            <li>
              <Link to="/profile">Patient Profile</Link>
            </li>
          </>
        )}

        {user.role === "admin" && (
          <>
            <li>
              <Link to="/admin/users">Admin · Users</Link>
            </li>
            <li>
              <Link to="/home">Clinic Google</Link>
            </li>
          </>
        )}

        <li>
          <Link to="/" onClick={signOut}>
            Sign Out
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default NavBar;