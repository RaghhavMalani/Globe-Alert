
# GlobalAlert Backend Server

This is the backend server for the GlobalAlert application, which provides real-time global incident tracking.

## Setup

1. Ensure you have MongoDB installed and running locally or provide a connection string in `.env`.

2. Install dependencies:
   ```
   cd server
   npm install
   ```

3. Create a `.env` file in the server directory with the following variables:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/geosphere-war-alert
   ```

## Running the Server

1. Start the server:
   ```
   npm start
   ```

2. For development with auto-restart:
   ```
   npm run dev
   ```

## API Endpoints

- `GET /api/events` - Get all events (supports filtering)
- `GET /api/events/:id` - Get a specific event by ID
- `POST /api/events` - Create a new event
- `PUT /api/events/:id` - Update an event
- `DELETE /api/events/:id` - Delete an event

### Query Parameters for Filtering Events

- `types` - Comma-separated list of event types (e.g., `war,terrorism,natural`)
- `timeRange` - Time range filter (`day`, `week`, `month`, `year`, or `all`)
- `severity` - Comma-separated list of severity levels (e.g., `1,2,3`)

## Database

The server will automatically seed the database with sample events if no data exists.
