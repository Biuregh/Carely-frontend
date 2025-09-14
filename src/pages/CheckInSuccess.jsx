import { useEffect } from "react";
import { useLocation, Link } from "react-router";

const CheckInSuccess = () => {
  const { state } = useLocation() || {};
  const msg = state?.message || "You are checked in!";
  const pid = state?.patientId;

  useEffect(() => {
    if (pid) {
      try {
        localStorage.setItem("patientId", String(pid));
      } catch {}
    }
  }, [pid]);

 return (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div className="w-full max-w-md bg-white shadow rounded-lg p-6 text-center">
      <h2 className="text-2xl font-semibold text-teal-600 mb-3">
        Check-in Complete
      </h2>

      <p className="text-gray-600 text-sm mb-4">
        {msg}
      </p>

      {pid && (
        <p className="text-xs text-gray-500 italic mb-6">
          Patient ID: {pid}
        </p>
      )}

      <div className="flex justify-center gap-3">
        <Link
          to="/"
          className="px-4 py-2 rounded border border-teal-600 text-teal-700 hover:bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
        >
          New Check-in
        </Link>

        <Link
          to="/profile"
          className="px-4 py-2 rounded bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors"
        >
          Go to My Profile
        </Link>
      </div>
    </div>
  </div>
);
};

export default CheckInSuccess;
