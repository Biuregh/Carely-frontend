# Carely 🏥

![Carely Logo](https://i.imgur.com/ko0MNnd.jpeg)
A Doctor Appointment & Patient Check-In App

## Why Carely?

Every clinic, dentist, hospital, and service provider struggles with the same problem:

Managing patient check-ins and appointments smoothly.

Carely solves this by giving patients, receptionists, providers, and admins the tools they need in a single app.

	1•	Beginner-Friendly Scope: CRUD (Create, Read, Update, Delete) – easy to build step by step.

	2•	Perfect for Teamwork: 4 modules for 4 members:

	3•	Frontend – Patients: React forms + list page

	4•	Frontend – Appointments: Calendar + booking interface 

	5•	Backend – Patients API: Express + MongoDB routes

	6•	Backend – Appointments API: Check-in logic + scheduling

It’s realistic, useful, and achievable.

⸻

## MVP 

	1•  Patients can check in using name + DOB or phone

	2•	Confirmation message after check-in

	3•	Reception can:
		- Add a new patient (name, DOB, phone, email)
		- Schedule new appointments
		- View today’s appointments
		- Mark patients as checked-in
		- Reschedule/cancel appointments

	4•	Providers can:
		- View daily/weekly calendar of appointments
		- See if a patient is checked-in

	5•	Admins can:
		- Create/remove staff & provider accounts
		- Keep system secure

⸻

## User Stories

Patient
	•	Check in using phone number + DOB
	•	Update personal info during check-in
	•	View appointment status (scheduled, checked-in, completed)
	•	Receive confirmation after check-in

Receptionist
	•	Schedule new appointments
	•	Reschedule or cancel appointments
	•	View daily calendar of appointments
	•	See which patients have checked in

Provider
	•	View daily agenda (patients & times)
	•	See patient details after check-in
	•	Mark appointments as completed
	•	Get notified when patients check in

Admin
	•	Create/manage staff accounts
	•	Remove staff accounts
	•	Assign roles (receptionist, provider, admin)
	•	View reports (check-ins, no-shows, appointment volume)
	•	See activity logs

⸻

## Stretch Goals 
	•	SMS/email reminders for patients

	•	Provider agenda sync with Google Calendar

	•	Manage multiple clinic locations

	•	Insurance filters for patients booking appointments


⸻

## Main Features 
	•	Authentication & Roles

	•	Patient Management (CRUD)

	•	Patient Check-in Flow

	•	Appointment Scheduling & Status

	•	Provider Dashboard

	•	Admin Tools

	•	Testing & Review


## Entity Relationship

```
USER  {
	_id: ObjectId,
	name: String (required),
	email: String (required),
	password: String (required),
	role: { type: String, enum: ["admin","provider","reception"], required: true },
}


PATIENT {
	_id: ObjectId,
	name: String (required),
	DOB: Date (required),
	email: String (required),
	phone: String (required),
	notes: String,
	allergies: [String],
	medicatons: [String]

}


APPOINTMENT {
	_id: ObjectId,
	date: Date (required),
	startTime: Time (required),
	endTime: Time (required),
	providerId: ObjectId (ref: "USER", required),
	patientId: ObjectId (ref: "PATIENT", required),
	createdById: ObjectId (ref: "USER", required),
	status: { type: String, enum: ["scheduled","checkIn","completed", "canceled", "noShow"], required: true }
}
```


## Routes

|Action	|Route	                                         |HTTP Verb
|-------|------------------------------------------------|----------
|Index	|/users/:userId/appointments	                 |GET
|New	|/users/:userId/appointments/new	             |GET
|Create	|/users/:userId/appointments	                 |POST
|Show	|/users/:userId/appointments/:appointmentId	     |GET
|Edit	|/users/:userId/appointments/:appointmentId/edit |GET
|Update	|/users/:userId/appointments/:appointmentId	     |PUT
|Delete	|/users/:userId/appointments/:appointmentId	     |DELETE


## Patients Routes**

| Action | Route                           | HTTP Verb |
|------- |---------------------------------|-----------|
| Index  | /patients                       | GET       |
| New    | /patients/new                   | GET       |
| Create | /patients                       | POST      |
| Show   | /patients/:patientId            | GET       |
| Edit   | /patients/:patientId/edit       | GET       |
| Update | /patients/:patientId            | PUT       |
| Delete | /patients/:patientId            | DELETE    |

## Tech Stack 
	•	Frontend: React + CSS
	•	Backend: Express.js + Node.js
	•	Database: MongoDB
	•	Authentication: JWT / bcrypt
	•	Version Control: Git + GitHub


## Team Structure 
	•	Frontend – Patients: React forms + patient profile page
	•	Frontend – Appointments: Calendar view + booking form
	•	Backend – Patients API: REST endpoints + validation
	•	Backend – Appointments API: Scheduling logic + check-in

How to run

# Clone repo
git clone https://git.generalassemb.ly/marjirad/Carely.git

# Install dependencies
cd carely
npm install

# Run backend
npm run server

# Run frontend
npm run client


![Patient Check-in](https://i.imgur.com/dEt9eOZ.png)
Patient Kiosk — simple check-in by name + DOB/phone.

![Kiosk ](https://i.imgur.com/8cJUMQe.png)
ADDED caption:** Public-facing kiosk screen for quick arrivals.

![Patient Check-in Dashboard](https://i.imgur.com/qaQcpoM.png)
ADDED caption:** Reception dashboard — today’s appointments & check-in status.

![Appointment Scheduling](https://i.imgur.com/X7KY6Kf.png)
Scheduling view — create, reschedule, or cancel appointments.

Trello Link: https://trello.com/b/mub1Eztu/carely