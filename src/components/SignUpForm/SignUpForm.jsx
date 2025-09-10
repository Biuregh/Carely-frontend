import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";

import { signUp } from "../../services/authService";
import { UserContext } from "../../contexts/UserContext";

const SignUpForm = () => {
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    passwordConf: "",
  });

  const { username, password, passwordConf } = formData;

  const handleChange = (evt) => {
    setMessage("");
    const { name, value } = evt.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    try {
      const payload = {
        username: username.trim(),
        password,
        passwordConf,
      };
      const newUser = await signUp(payload);
      setUser(newUser);
      navigate("/");
    } catch (err) {
      setMessage(err.message);
    }
  };

  const isFormInvalid = () => {
    return !(username && password && password === passwordConf);
  };

return (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
   <div className="w-full max-w-md bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-semibold text-teal-600 mb-4 text-center">
        Sign Up
      </h2>
      <p className="text-gray-600 text-sm mb-6 text-center">
        Create an account to get started.
      </p>

      {message && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3 text-center">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
          type="email"
          placeholder="Email"
          value={username}
          name="username"
          onChange={handleChange}
          required
        />
        <input
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
          type="password"
          placeholder="Password"
          value={password}
          name="password"
          onChange={handleChange}
          required
        />
        <input
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
          type="password"
          placeholder="Confirm Password"
          value={passwordConf}
          name="passwordConf"
          onChange={handleChange}
          required
        />

        <div className="bg-gray-50 text-sm text-gray-600 border rounded p-3">
          By signing up, you agree to our terms of service and privacy policy.
        </div>

        <button
          type="submit"
          disabled={isFormInvalid()}
          className={`w-full text-white rounded px-4 py-2 transition-colors 
            ${isFormInvalid()
              ? "bg-teal-400 cursor-not-allowed"
              : "bg-teal-600 hover:bg-teal-700"}`}
        >
          Sign Up
        </button>

        <button
          type="button"
          onClick={() => navigate("/")}
          className="w-full bg-gray-100 text-gray-800 rounded px-4 py-2 hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>

        <p className="text-xs text-center text-gray-500">
          * All fields are required
        </p>
      </form>
    </div>
  </div>
);
};

export default SignUpForm;
