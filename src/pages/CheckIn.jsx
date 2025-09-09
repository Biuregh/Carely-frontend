import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { checkIn } from "../services/patients.js";

const CheckIn = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    dob: "",
    email: "",
    phone: "",
  });

  const allFilled = useMemo(
    () => Object.values(form).every((v) => String(v || "").trim()),
    [form]
  );

  const set = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!allFilled) return;
    try {
      const res = await checkIn(form);
      navigate("/checkin/success", {
        state: {
          message: res?.message || "You are checked in!",
          patientId: res?.patientId || null,
        },
        replace: true,
      });
    } catch (err) {
      alert(err.message || "Failed to check in");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-teal-600 mb-4 text-center">
          Patient Check-in
        </h2>
        <p className="text-gray-600 text-sm mb-6 text-center">
          Fill in your basic information to notify reception of your arrival.
        </p>
        <form onSubmit={submit} className="space-y-4">
          <input
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="Full Name"
            value={form.fullName}
            onChange={(e) => set("fullName", e.target.value)}
          />
          <input
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="Date of Birth (YYYY-MM-DD)"
            value={form.dob}
            onChange={(e) => set("dob", e.target.value)}
          />
          <input
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
          />
          <input
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            placeholder="Phone Number"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
          />
          <div className="bg-gray-50 text-sm text-gray-600 border rounded p-3">
            Reception will be notified immediately upon check-in, and
            you&apos;ll receive an email confirmation.
          </div>
          <button
            type="submit"
            disabled={!allFilled}
            className="w-full bg-teal-600 text-white rounded px-4 py-2 hover:bg-teal-700 transition-colors"
          >
            Check In
          </button>
          <p className="text-xs text-center text-gray-500">
            * All fields are required
          </p>
        </form>
      </div>
    </div>
  );
};

export default CheckIn;
