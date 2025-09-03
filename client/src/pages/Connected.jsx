import CreateEvent from '../components/CreateEvent.jsx';
import Agenda from '../components/Agenda.jsx';

function Connected() {
  return (
    <div style={{ padding: 16 }}>
      <h2>Google Calendar connected</h2>
      <CreateEvent />
      <Agenda />
    </div>
  );
}

export default Connected;