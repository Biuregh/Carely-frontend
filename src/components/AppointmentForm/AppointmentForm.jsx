import { useEffect, useState } from "react";
import { providersList, availableSlots, createAppointment } from "../../services/appointments";

const TYPES = [
    { id: "consult", label: "Consultation" },
    { id: "followup", label: "Follow-up" },
    { id: "other", label: "Other" },
];

const AppointmentForm = ({ patient }) => {
    const [type, setType] = useState("");
    const [providers, setProviders] = useState([]);
    const [providerId, setProviderId] = useState("");
    const [date, setDate] = useState("");
    const [slots, setSlots] = useState([]);
    const [slot, setSlot] = useState("");
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        providersList().then(setProviders).catch(() => setProviders([]))
    }, []);

    useEffect(() => {
        const load = async () => {
            setSlots([]);
            setSlot("");
            if (!providerId || !date) return;
            setLoadingSlots(true);
            try {
                const { slots } = await availableSlots({ providerId, date });
                setSlots(slots || []);
            } catch {
                setSlots([]);
            } finally {
                setLoadingSlots(false)
            }
        };
        load()
    }, [providerId, date]);

    const canSchedule = !!(patient && type && providerId && date && slot)

    const onSchedule = async () => {
        if (!canSchedule) return;
        setSaving(true);
        setMessage("");
        try {
            await createAppointment({
                patiendId: patient._id,
                providerId,
                date,
                time: slot,
                type
            });
            setMessage("Appointment scheduled sucessfully");
            setType("");
            setDate("");
            setProviderId("");
            setSlot("");
            setSlots("");
        } catch {
            setMessage("Failed to schedule appointment. Try again!")
        } finally {
            setSaving(false)
        }
    }
    return (
        <div className="box">
            <h3 className="title">Appointment Details</h3>
            {!patient && <p className="hint">Please search for a patient first</p>}

            <label className="label">Type</label>
            <select
                className="input"
                value={type}
                onChange={(e) => setType(e.target.value)}
            >
                <option value="">Select type</option>
                {TYPES.map((t) => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                ))}
            </select>

            <label className="label">Doctor</label>
            <select
                className="input"
                value={providerId}
                onChange={(e) => setProviderId(e.target.value)}
            >
                <option value="">Choose doctor</option>
                {providers.map((p) => (
                    <option key={p._id} value={p._id}>{p.name}</option>
                ))}
            </select>

            <label className="label">Date</label>
            <input
                className="input"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
            />

            <p className="subhead">Available Slots</p>
            {loadingSlots ? (
                <p className="hint">Loading...</p>
            ) : slots.length ? (
                <div className="rowWrap">
                    {slots.map((t) => (
                        <button
                            key={t}
                            onClick={() => setSlot(t)}
                            className={`slotbtn${slot === t ? " slotbtnActive" : ""}`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            ) : (
                <p className="hint">No slots</p>
            )}

            <button
                className="btnPrimary"
                disabled={!canSchedule || saving}
                onClick={onSchedule}
            >
                {saving ? "Scheduling..." : "Schedule Appointment"}
            </button>

            {message && <p className="hint">{message}</p>}

        </div>
    );
}
export default AppointmentForm;