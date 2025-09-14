const Landing = () => {
  return (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div className="w-full max-w-2xl bg-white shadow rounded-lg p-6 md:p-8 text-center">
      <h1 className="text-2xl font-semibold text-teal-600 mb-4">
        Hello, you are on the landing page for visitors.
      </h1>
      <p className="text-gray-600 text-sm mb-6">
        Sign up now, or sign in to see your super secret dashboard!
      </p>
      <div className="flex justify-center gap-3">
        <button
          className="px-4 py-2 rounded bg-teal-600 text-white hover:bg-teal-700 transition-colors"
          onClick={() => navigate("/signup")}
        >
          Sign Up
        </button>
        <button
          className="px-4 py-2 rounded bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors"
          onClick={() => navigate("/signin")}
        >
          Sign In
        </button>
      </div>
    </div>
  </div>
);
};

export default Landing;
