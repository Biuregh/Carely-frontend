import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';


function CalendarPage() {
  const now = new Date();
  const in30 = new Date(now.getTime() + 30 * 60 * 1000);

  return (
    <div style={{ padding: 16 }}>
      <h2>Calendar</h2>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"                 
        height="80vh"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        events={[
          { id: 'demo-1', title: 'Hello Calendar', start: now.toISOString(), end: in30.toISOString() }
        ]}
      />
    </div>
  );
}

export default CalendarPage;
