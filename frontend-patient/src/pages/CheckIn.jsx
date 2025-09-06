import { useState } from 'react'

const CheckIn = (props) => {
  const [form, setForm] = useState({ fullName:'', dob:'', email:'', phone:'' })
  const set = (k, v) => setForm(s => ({ ...s, [k]: v }))

  const submit = async (e) => {
    e.preventDefault()
    await props.onCheckIn(form)
  }

  return (
    <div>
      <h2>Kiosk Check-in</h2>
      <form onSubmit={submit}>
        <input placeholder="Full Name" value={form.fullName} onChange={e=>set('fullName', e.target.value)} />
        <input placeholder="YYYY-MM-DD" value={form.dob} onChange={e=>set('dob', e.target.value)} />
        <input type="email" placeholder="Email" value={form.email} onChange={e=>set('email', e.target.value)} />
        <input placeholder="Phone" value={form.phone} onChange={e=>set('phone', e.target.value)} />
        <button>Check In</button>
      </form>
    </div>
  )
}

export default CheckIn