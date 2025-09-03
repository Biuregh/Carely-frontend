import { Routes, Route, Link } from 'react-router';
import Home from './pages/Home.jsx';
import Connected from './pages/Connected.jsx';
import CalendarPage from './pages/Calendar.jsx';

function App() {
  return (
    <>
      <nav style={{ padding: 12, display: 'flex', gap: 12 }}>
        <Link to="/">Home</Link>
        <Link to="/connected">Connected</Link>
        <Link to="/calendar">Calendar</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/connected" element={<Connected />} />
        <Route path="/calendar" element={<CalendarPage />} />
      </Routes>
    </>
  );
}

export default App;