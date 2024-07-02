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
1. Install `virtualenv` if not already installed:
    ```sh
    pip install virtualenv
    ```
2. Navigate to the `backend` directory:
    ```sh
    cd backend
    ```
3. Create a virtual environment:
    ```sh
    python -m venv venv
    ```
4. Activate the virtual environment:
    ```sh
    .\venv\Scripts\activate
    ```
5. Install dependencies:
    ```sh
    pip install -r requirements.txt
    ```
6. Run the backend server:
    ```sh
    python run.py
    ```

#### Ubuntu/Mac
1. Install `virtualenv` if not already installed:
    ```sh
    pip install virtualenv
    ```
2. Navigate to the `backend` directory:
    ```sh
    cd backend
    ```
3. Create a virtual environment:
    ```sh
    python -m venv venv
    ```
4. Activate the virtual environment:
    ```sh
    source venv/bin/activate
    ```
5. Install dependencies:
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
2. Install dependencies:
    ```sh
    npm install
    ```
3. Start the frontend server:
    ```sh
    npm start
    ```

## Environment Setup

Copy the `.env.example` file to `.env` and use the correct Agora tokens.

## Project Structure

### Backend

- `api/agora.py`: Contains the routes for generating Agora tokens.
- `models/agora_models.py`: Contains Pydantic models for request validation.
- `utils/agora_utils.py`: Contains the function to generate Agora tokens.
- `utils/src`: Contains raw code from the Agora Python package (pip install agora-token-builder is deprecated).

The backend is responsible for generating Agora verified tokens based on the username and channel name.

### Frontend

- `src/components`: Contains individual logic components.
- `src/pages`: Contains components for displaying pages.
- `src/utils`: Contains functions for API calls and other utilities.

The frontend is written in React. Currently, all the code is in `src/pages/AudioCallPage.js`. The `App.js` file is used for routing.

## Project Purpose

This project is created to simulate voice calling, video calling, and live streaming using Agora services.

## Logs

- `dev_logs_DO_NOT_DELETE`: Contains development logs, errors faced, and notes for updates.

## Notes

- Ensure to set the correct Agora tokens in the `.env` file.
