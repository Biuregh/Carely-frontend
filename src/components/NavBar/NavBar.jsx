import { useContext } from "react";
import { Link } from "react-router";
import { UserContext } from "../../contexts/UserContext";

const NavBar = () => {
  const { user, setUser } = useContext(UserContext);

  const handleSignOut = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <nav>
      {user ? (
        <ul>
          <li>Welcome, {user.username}</li>
          <li>
            <Link to="/">Dashboard</Link>
          </li>
          <li>
            <Link to="/" onClick={handleSignOut}>
              Sign Out
            </Link>
          </li>
          <li>
            <Link to="/home">Google Connect</Link>
          </li>
          <li>
            <Link to="/connected">Connected</Link>
          </li>
          <li>
            <Link to="/calendar">Calendar</Link>
          </li>
          {user.role === "admin" && (
            <li>
              <Link to="/admin/users">Admin · Users</Link>
            </li>
          )}
        </ul>
      ) : (
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
          <li>
            <Link to="/home">Google Connect</Link>
          </li>
          <li>
            <Link to="/connected">Connected</Link>
          </li>
          <li>
            <Link to="/calendar">Calendar</Link>
          </li>
        </ul>
      )}
    </nav>
  );
};

export default NavBar;
