import { useContext } from "react";
import { Link } from "react-router";
import { UserContext } from "../../contexts/UserContext";

function NavBar() {
  const { user, setUser } = useContext(UserContext);

  function signOut() {
    localStorage.removeItem("token");
    setUser(null);
  }

  if (!user) {
    return (
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/sign-in">Sign In</Link>
          </li>
          <li>
            <Link to="/sign-up">Sign Up</Link>
          </li>
        </ul>
      </nav>
    );
  }

  return (
    <nav>
      <ul>
        <li>Welcome, {user.username}</li>
        <li>
          <Link to="/">Dashboard</Link>
        </li>
        <li>
          <Link to="/agenda">Schedule</Link>
        </li>
        <li>
          <Link to="/calendar">Calendar</Link>
        </li>
        {(user.role === "admin" || user.role === "reception") && (
          <li>
            <Link to="/appointments">Appointment Manager</Link>
          </li>
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
}

export default NavBar;
