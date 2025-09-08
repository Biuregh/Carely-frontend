import { useEffect, useState, useContext } from 'react';
import { UserContext } from '../../contexts/UserContext';
import * as appointmentService from '../../services/providerAppointmentService';
import NavBar from '../components/NavBar';

const ProviderDashboard = () => {
    const { user } = useContext(UserContext);
    const [appointments, setAppointments] = useState([]);
    const [view, setView] = useState('today');
    const today = new Date().toISOString().split('T')[0];

    const fetchProviderAppointments = async () => {
        try {
            const appointmentsData = await appointmentService.index();
            const filtered = appointmentsData.filter(
                appt => appt.provider?.name === user?.name
            );
            setAppointments(filtered);
        } catch (error) {
            console.error('Failed to fetch appointments:', error);
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await appointmentService.updateStatus(id, newStatus);
            fetchProviderAppointments();
        } catch (err) {
            console.error('Failed to update status:', err);
        }
    };


    useEffect(() => {
        if (user) {
            fetchProviderAppointments();
        }
    }, [user]);

    const filtered = appointments.filter((appt) => {
        if (view === 'completed') return appt.status === 'completed';

        const isToday = appt.date === today;
        const activeStatuses = ['scheduled', 'check in'];
        const matchesView = view === 'all' || (view === 'today' && isToday);
        return matchesView && activeStatuses.includes(appt.status);
    });

    const handleLogout = () => {
        localStorage.removeItem('token');
        setUser(null);
        navigate('/sign-in');
    };

    return (
        <div>
            <NavBar user={user} onLogout={handleLogout} />
            <h2>Welcome Dr. {user.name}</h2>
            <h3>Dashboard</h3>
            <div>
                {['today', 'all', 'completed'].map((type) => (
                    <button key={type} onClick={() => setView(type)}>
                        {type === 'today'
                            ? "Today's Appointments"
                            : type === 'all'
                                ? 'All Active Appointments'
                                : 'Completed'}
                    </button>
                ))}
            </div>


            {filtered.length === 0 ? (
                <p>No appointments to display.</p>
            ) : (
                <ul>
                    {filtered.map((appt) => (
                        <li key={appt._id}>
                            <strong>Patient:</strong> {appt.patientName} <br />
                            <strong>Date:</strong> {appt.date} <br />
                            <strong>Time:</strong> {appt.startTime} - {appt.endTime} <br />
                            <strong>Reason:</strong> {appt.reason} <br />
                            <strong>Status:</strong> {appt.status} <br />
                            {appt.status !== 'completed' && (
                                <div>
                                    {appt.status === 'check in' && (
                                        <button onClick={() => handleStatusUpdate(appt._id, 'completed')}>
                                            Update Status
                                        </button>
                                    )}
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ProviderDashboard;
