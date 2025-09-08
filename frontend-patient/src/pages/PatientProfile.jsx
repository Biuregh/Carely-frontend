
import { useEffect, useState } from 'react'

const PatientProfile = (props) => {
  const [data, setData] = useState({
    firstName:'', lastName:'', email:'', phone:'', dob:'', gender:'',
    address:'', city:'', state:'', zip:'',
    insuranceProvider:'', memberId:'',
    symptoms:'', medications:'',
  })

  useEffect(() => {
    if (!props.patient) {
      props.loadPatient?.()
    } else {
      setData(d => ({ ...d, ...props.patient }))
    }
  }, [props.patient])

  const set = (k, v) => setData(s => ({ ...s, [k]: v }))

  const save = async (e) => {
    e.preventDefault()
    await props.savePatient?.(data)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-3xl bg-white shadow rounded p-20">
        <h2 className="text-2xl font-semibold text-teal-600 mb-4">Patient Profile</h2>
        <form onSubmit={save} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input className="border rounded px-3 py-2" placeholder="First Name" value={data.firstName} onChange={e=>set('firstName', e.target.value)} />
          <input className="border rounded px-3 py-2" placeholder="Last Name" value={data.lastName} onChange={e=>set('lastName', e.target.value)} />
          <input className="border rounded px-3 py-2" type="email" placeholder="Email" value={data.email} onChange={e=>set('email', e.target.value)} />
          <input className="border rounded px-3 py-2" placeholder="Phone" value={data.phone} onChange={e=>set('phone', e.target.value)} />
          <input className="border rounded px-3 py-2" placeholder="YYYY-MM-DD" value={data.dob} onChange={e=>set('dob', e.target.value)} />

          <select
            className={`border rounded px-3 py-2 ${data.gender ? 'text-gray-900' : 'text-gray-400'}`}
            value={data.gender}
            onChange={e => set('gender', e.target.value)}
          >
            <option value="" disabled hidden>Gender</option>
            <option>Female</option>
            <option>Male</option>
            <option>Non-binary</option>
            <option>Prefer not to say</option>
          </select>

          <input className="border rounded px-3 py-2 md:col-span-2" placeholder="Street Address" value={data.address} onChange={e=>set('address', e.target.value)} />
          <input className="border rounded px-3 py-2" placeholder="City" value={data.city} onChange={e=>set('city', e.target.value)} />
          <input className="border rounded px-3 py-2" placeholder="State" value={data.state} onChange={e=>set('state', e.target.value)} />
          <input className="border rounded px-3 py-2" placeholder="ZIP" value={data.zip} onChange={e=>set('zip', e.target.value)} />

          <input className="border rounded px-3 py-2" placeholder="Insurance Provider" value={data.insuranceProvider} onChange={e=>set('insuranceProvider', e.target.value)} />
          <input className="border rounded px-3 py-2" placeholder="Member ID" value={data.memberId} onChange={e=>set('memberId', e.target.value)} />

          <textarea className="border rounded px-3 py-2 md:col-span-2" placeholder="Symptoms / Reason for visit" value={data.symptoms} onChange={e=>set('symptoms', e.target.value)} />
          <textarea className="border rounded px-3 py-2 md:col-span-2" placeholder="Current medications" value={data.medications} onChange={e=>set('medications', e.target.value)} />

          <div className="md:col-span-2 flex justify-end gap-2 mt-2">
            <button
              type="button"
              className="bg-teal-600 text-white rounded px-4 py-2 hover:bg-teal-700 transition-colors"
              onClick={() => props.loadPatient?.()}
            >
              Reload
            </button>
            <button
              className="bg-teal-600 text-white rounded px-4 py-2 hover:bg-teal-700 transition-colors"
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>  
    </div>
)
}

export default PatientProfile