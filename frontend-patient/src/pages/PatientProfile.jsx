
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
    <div>
      <h2>Patient Profile</h2>
      <form onSubmit={save}>
        <input placeholder="First Name" value={data.firstName} onChange={e=>set('firstName', e.target.value)} />
        <input placeholder="Last Name" value={data.lastName} onChange={e=>set('lastName', e.target.value)} />
        <input type="email" placeholder="Email" value={data.email} onChange={e=>set('email', e.target.value)} />
        <input placeholder="Phone" value={data.phone} onChange={e=>set('phone', e.target.value)} />
        <input placeholder="YYYY-MM-DD" value={data.dob} onChange={e=>set('dob', e.target.value)} />
        
        <select value={data.gender} onChange={e=>set('gender', e.target.value)}>
          <option value="">Gender</option>
          <option>Female</option>
          <option>Male</option>
          <option>Non-binary</option>
          <option>Prefer not to say</option>
        </select>

        <input placeholder="Street Address" value={data.address} onChange={e=>set('address', e.target.value)} />
        <input placeholder="City" value={data.city} onChange={e=>set('city', e.target.value)} />
        <input placeholder="State" value={data.state} onChange={e=>set('state', e.target.value)} />
        <input placeholder="ZIP" value={data.zip} onChange={e=>set('zip', e.target.value)} />

        <input placeholder="Insurance Provider" value={data.insuranceProvider} onChange={e=>set('insuranceProvider', e.target.value)} />
        <input placeholder="Member ID" value={data.memberId} onChange={e=>set('memberId', e.target.value)} />

        <textarea placeholder="Symptoms / Reason for visit" value={data.symptoms} onChange={e=>set('symptoms', e.target.value)} />
        <textarea placeholder="Current medications" value={data.medications} onChange={e=>set('medications', e.target.value)} />

        <div>
          <button type="button" onClick={()=>props.loadPatient?.()}>Reload</button>
          <button type="submit">Save Profile</button>
        </div>
      </form>
    </div>
  )
}

export default PatientProfile