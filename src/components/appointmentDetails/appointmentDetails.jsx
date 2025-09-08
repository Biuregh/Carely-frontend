import { useParams } from 'react-router';
const { appointmentId } = useParams();



const appointmentDetails = (appointments, doctorName) => {

  

  return (
    <>
      <h2>Appointment Details</h2>
      <dl>
        <dt>Patient Name:</dt>
        <dd>{singleAppointment.patientName}</dd>
        <dt>Patient Info:</dt>
        <dd>singleAppointment.patientInfo</dd>
      </dl>
    </>
  );
};

export default appointmentDetails;