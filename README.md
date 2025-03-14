
# MediTrack - Mobile Medication Tracker

MediTrack is a comprehensive medication management app designed for mobile devices. This frontend application connects to a Java JDBC backend with a PostgreSQL database.

## API Endpoints

The app uses the following API endpoints for communication with the backend:

| Endpoint | Method | Description | Request Body | Response |
|----------|--------|-------------|--------------|----------|
| `/api/medicines` | GET | Get all medicines | - | Array of medicine objects |
| `/api/medicines` | POST | Add a new medicine | Medicine object | Created medicine with ID |
| `/api/medicines/:id` | GET | Get a single medicine by ID | - | Medicine object |
| `/api/medicines/:id` | PUT | Update a medicine | Updated medicine object | Updated medicine |
| `/api/medicines/:id` | DELETE | Delete a medicine | - | Success message |
| `/api/medicines/taken` | POST | Mark medicine as taken | `{ medicineId, date, timeSlot }` | Success message |
| `/api/adherence` | GET | Get adherence statistics | - | `{ adherenceRate, activeMedicines }` |
| `/api/users/profile` | GET | Get user profile data | - | User profile object |
| `/api/auth/login` | POST | Login user | `{ email, password }` | User with auth token |
| `/api/auth/register` | POST | Register new user | User registration data | Created user |

## Data Models

### Medicine Object
```json
{
  "id": "string",
  "name": "string",
  "type": "string",
  "dosage": "string",
  "frequency": "string",
  "timeSlots": ["string"],
  "days": ["string"],
  "duration": "string",
  "notes": "string"
}
```

### User Profile
```json
{
  "name": "string",
  "email": "string"
}
```

### Adherence Stats
```json
{
  "adherenceRate": "number",
  "activeMedicines": "number"
}
```

## Offline Support

The application has built-in offline support, storing data locally when the backend server is unavailable. Changes are synchronized when the connection is restored.

## Features

- View and manage all medications
- Schedule daily, weekly, or custom medication routines
- Track adherence to medication schedules
- Calendar view for medication planning
- User profile with statistics
- Search and filter medications
- Offline functionality

## Technical Implementation

- Pure HTML, CSS, and JavaScript
- Modular JavaScript with ES modules
- API integration with fetch API
- Local storage fallback for offline use
- Mobile-first responsive design
