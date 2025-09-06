function Home() {
  const connect = () => {
    window.location.href = `${import.meta.env.VITE_API_BASE}/oauth/google`;
  };

  return (
    <div style={{ padding: 16 }}>
      <h1>Carely — Google Calendar</h1>
      <button onClick={connect}>Connect Google Calendar</button>
    </div>
  );
}

export default Home;
