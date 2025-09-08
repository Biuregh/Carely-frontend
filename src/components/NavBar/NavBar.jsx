import { useNavigate } from 'react-router-dom';

const NavBar = () => {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();

   const handleLogout = () => {
        localStorage.removeItem('token');
        setUser(null);
        navigate('/sign-in');
    };
  return (
    <nav>
      {user ? (
        <ul>
          <li>Welcome, {user.username}</li>
          <li><Link to='/'>Home</Link></li>
          <li><button onClick={handleLogout}>Sign Out</button></li>
          <li><Link to='/appointments'>Appointments</Link></li>
        </ul>
      ) : (
        <ul>
          <li><Link to='/'>Home</Link></li>
          <li><Link to='/sign-in'>Sign In</Link></li>
          <li><Link to='/sign-up'>Sign Up</Link></li>
        </ul>
      )}
    </nav>
  );
};

export default NavBar;
