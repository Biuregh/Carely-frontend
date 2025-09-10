function Home() {
  const connectClinic = async () => {
    const API = import.meta.env.VITE_API_BASE;
    const token = localStorage.getItem("token") || "";
    try {
      const res = await fetch(`${API}/oauth/google/app/url`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      if (!res.ok) {
        const text = await res.text();
        alert(`Failed to start Google connect: ${text || res.statusText}`);
        return;
      }
      const { url } = await res.json();
      window.location.href = url; 
    } catch (e) {
      alert(`Network error: ${e.message || e}`);
    }
  };

  return (
     <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-3xl bg-white shadow rounded p-20">
        <h2 className="text-2xl font-semibold text-teal-600 mb-4">Clinic Google Connection</h2>
        <button
              type="button"
              className="bg-teal-600 text-white rounded px-4 py-2 hover:bg-teal-700 transition-colors"
              onClick={() => props.loadPatient?.()}
            >Connect Clinic Google</button>
      </div>
    </div>
  );
}

export default Home;
