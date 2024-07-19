# Agora Voice and Video Calling and Live Streaming

This project simulates voice calling, video calling, and live streaming via Agora services.

## How to Run the Project

### Backend (FastAPI)

#### Prerequisites (My Versions)
- Python version: 3.10.11
- Pip version: 23.0.1
- Node version: v18.20.2
- Npm version : 10.5.0

#### Windows
1. Install `virtualenv` if not already installed (Needed for First time use only) :
    ```sh
    pip install virtualenv
    ```
2. Navigate to the `backend` directory:
    ```sh
    cd backend
    ```
3. Create a virtual environment (Needed for First time use only) :
    ```sh
    python -m venv venv
    ```
4. Activate the virtual environment:
    ```sh
    .\venv\Scripts\activate
    ```
5. Install dependencies (Needed for First time use only) :
    ```sh
    pip install -r requirements.txt
    ```
6. Run the backend server:
    ```sh
    python run.py
    ```

#### Ubuntu/Mac
1. Install `virtualenv` if not already installed (Needed for First time use only) :
    ```sh
    pip install virtualenv
    ```
2. Navigate to the `backend` directory:
    ```sh
    cd backend
    ```
3. Create a virtual environment (Needed for First time use only) :
    ```sh
    python -m venv venv
    ```
4. Activate the virtual environment:
    ```sh
    source venv/bin/activate
    ```
5. Install dependencies (Needed for First time use only) :
    ```sh
    pip install -r requirements.txt
    ```
6. Run the backend server:
    ```sh
    python run.py
    ```

### Frontend (React)

#### Prerequisites
- Node.js and npm

#### Windows, Linux, Mac

1. Navigate to the `frontend` directory:
    ```sh
    cd frontend
    ```
2. Install dependencies (Needed for First time use only):
    ```sh
    npm install
    ```
3. Start the frontend server:
    ```sh
    npm start
    ```

#### Additional Commands

1. To start the development server with a build version `npm run build` ; Run till Step 2 from above, then :
    ```sh
    npm run build
    ```

2. To install the `serve` package globally for serving the production build:
    ```sh
    npm install -g serve
    ```

3. To serve the production build on port 3000:
    ```sh
    serve -s build -l 3000
    ```

## Environment Setup

Copy the `.env.example` file to `.env` and use the correct Agora tokens.

## Project Structure

### Backend

#### API

- `backend/app/api/agoraTokenGeneration.py`: Defines the Agora API for token generation; the main function is in `utils`.
- `backend/app/api/meetingRoom.py`: Manages meeting rooms.

#### Models

- `backend/app/models/agoraModels.py`: Pydantic models for FastAPI related to Agora.
- `backend/app/models/meetingMgmtDB.py`: SQLAlchemy database initialization and table definitions.
- `backend/app/models/meetingModels.py`: Pydantic models for FastAPI meeting management.

#### Utils

- `backend/app/utils/src`: Code directly copied from the official Agora repository, as the Python package is deprecated.
- `backend/app/utils/agoraUtils.py`: Function to generate Agora tokens.
- `backend/app/utils/database.py`: Handles all interactions with the database.

The backend is responsible for generating Agora verified tokens based on the username and channel name.

### Frontend

#### Components

- `frontend/src/components/AgoraAudioCallFunctions.js`: Main function for handling Agora SDK audio, joining, publishing, etc.
- `frontend/src/components/AudioCallRoom.js`: Contains backend API and meeting management logic, and uses Agora SDK functions from `AgoraAudioCallFunctions.js`.

#### Utils

- `frontend/src/utils/api.js`: Lists all imported APIs from the backend server.

#### Pages

- `frontend/src/pages/Home.js`: Home page for creating meetings, joining meetings, and setting the user ID (user authentication not configured).

#### root

- `frontend/src/App.js`: Defines the routes for the pages.

## Project Purpose

This project is created to simulate voice calling, video calling, and live streaming using Agora services.

## Logs

- `dev_logs_DO_NOT_DELETE`: Contains development logs, errors faced, and notes for updates.

## Notes

- Ensure to set the correct Agora tokens in the `.env` file.
