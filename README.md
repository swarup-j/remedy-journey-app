
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
| `/api/medicines/taken` | POST | Mark medicine as taken | `{ medicineId, date, timeSlot, userId }` | Success message |
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

1. **Database Schema**:
   - Create a `medicines` table with columns for all medicine fields (id, name, type, color, dosage, startDate, endDate, frequency, notes, userId)
   - Create a `medicine_timeslots` table to store time slots for each medicine (medicine_id, time_slot)
   - Create a `medicine_days` table to store days for each medicine (medicine_id, day)
   - Create a `users` table with columns for user information (id, name, email)
   - Create a `medicine_taken` table to log when medicines are taken (id, medicine_id, date, time_slot, user_id)

2. **Java JDBC Implementation**:
   - Create DAO (Data Access Object) classes for each entity
   - Implement CRUD operations for medicines
   - Implement user profile retrieval
   - Add methods to mark medicines as taken
   - Create API endpoints that return JSON responses

3. **SQL Schema Example**:
   ```sql
   CREATE TABLE users (
     id SERIAL PRIMARY KEY,
     name VARCHAR(100) NOT NULL,
     email VARCHAR(100)
   );

   CREATE TABLE medicines (
     id SERIAL PRIMARY KEY,
     name VARCHAR(100) NOT NULL,
     type VARCHAR(50) NOT NULL,
     color VARCHAR(20) NOT NULL,
     dosage VARCHAR(50),
     start_date DATE NOT NULL,
     end_date DATE NOT NULL,
     frequency VARCHAR(20),
     notes TEXT,
     user_id INTEGER REFERENCES users(id)
   );

   CREATE TABLE medicine_timeslots (
     id SERIAL PRIMARY KEY,
     medicine_id INTEGER REFERENCES medicines(id) ON DELETE CASCADE,
     time_slot TIME NOT NULL
   );

   CREATE TABLE medicine_days (
     id SERIAL PRIMARY KEY,
     medicine_id INTEGER REFERENCES medicines(id) ON DELETE CASCADE,
     day VARCHAR(10) NOT NULL
   );

   CREATE TABLE medicine_taken (
     id SERIAL PRIMARY KEY,
     medicine_id INTEGER REFERENCES medicines(id) ON DELETE CASCADE,
     date DATE NOT NULL,
     time_slot TIME NOT NULL,
     user_id INTEGER REFERENCES users(id)
   );
   ```

4. **Error Handling**:
   - Return appropriate HTTP status codes
   - Include error messages in the response body
   - Handle database connection errors gracefully

5. **API Response Format**:
   - Return JSON responses with appropriate content-type headers
   - Use consistent response formats across all endpoints
   - Include status and message fields in the response

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
