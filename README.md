
# MediTrack - Mobile Medication Tracker

MediTrack is a comprehensive medication management app designed for mobile devices. This frontend application connects to a Java JDBC backend with a PostgreSQL database.

## Backend Connection Setup

To connect the frontend application to your Java JDBC backend:

1. Update the API base URL in `js/config.js`:
   ```javascript
   const config = {
     API_BASE_URL: 'http://your-server-ip:port/api', // Update with your JDBC server URL
     DEFAULT_USER_ID: 1, // Default user ID for all operations
     STORAGE_PREFIX: 'meditrack_' // Prefix for localStorage keys
   };
   ```

2. Ensure your backend implements the following API endpoints with the expected request and response formats.

3. Configure CORS on your Java backend to allow requests from your frontend application's origin.

4. Start your Java JDBC server before launching the frontend application.

5. The application uses a default userId of 1 for all operations, so make sure this user exists in your database.

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

## Data Models

### Medicine Object
```json
{
  "id": "string",
  "name": "string",
  "type": "string",
  "color": "string",
  "dosage": "string",
  "startDate": "string",
  "endDate": "string",
  "frequency": "string",
  "timeSlots": ["string"],
  "days": ["string"],
  "notes": "string",
  "userId": "number"
}
```

### User Profile
```json
{
  "id": "number",
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

## Backend Implementation Requirements

1. **Database Schema**: Create tables for medicines, users, and medicine_taken records.

2. **User Management**: Since the app uses a default user (ID=1), create this user in your database.

3. **API Implementation**: Implement all the endpoints listed above in your Java JDBC backend.

4. **Error Handling**: Ensure proper error responses are sent back to the frontend.

5. **Data Validation**: Validate incoming data before storing in the database.

## Features

- View and manage all medications
- Schedule daily, weekly, or custom medication routines
- Track adherence to medication schedules
- Calendar view for medication planning
- User profile with statistics
- Search and filter medications
- Color-coded medicine tracking

## Technical Implementation

- Pure HTML, CSS, and JavaScript
- Modular JavaScript with ES modules
- API integration with fetch API
- Mobile-first responsive design
