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
    <div style={{ padding: 16 }}>
      <h1>Clinic Google Connection</h1>
      <button onClick={connectClinic}>Connect Clinic Google</button>
    </div>
  );
}

export default Home;
