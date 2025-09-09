import { useEffect } from "react";
import { useLocation, Link } from "react-router";

const CheckInSuccess = () => {
  const { state } = useLocation() || {};
  const msg = state?.message || "You are checked in!";
  const pid = state?.patientId;

  // Persist patient id so /profile can load even after refresh
  useEffect(() => {
    if (pid) {
      try {
        localStorage.setItem("patientId", String(pid));
      } catch {}
    }
  }, [pid]);

  return (
    <div className="card">
      <h2>Check-in Complete</h2>
      <p className="sub">{msg}</p>
      {pid && <p className="note">Patient ID: {pid}</p>}
      <div className="row">
        <Link className="btn secondary" to="/">
          New Check-in
        </Link>
        <Link className="btn" to="/profile">
          Go to My Profile
        </Link>
      </div>
    </div>
  );
};

export default CheckInSuccess;
