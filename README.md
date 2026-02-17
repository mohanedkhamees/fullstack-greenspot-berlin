# GreenSpot Berlin

GreenSpot Berlin is a fullstack web application for reporting and documenting unsustainable urban infrastructure in Berlin.

Users can report problematic locations, attach images, and raise awareness for potential improvements in urban sustainability.

---

## Tech Stack

### Frontend

- React
- Vite
- JavaScript (ES6+)
- Responsive UI

### Backend

- Node.js
- Express
- RESTful API
- MongoDB
- Cloudinary (image uploads)

### Tools

- Git & GitHub
- npm
- concurrently
- dotenv

---

## Key Features

- Create and view location-based reports
- Upload images for reported locations
- REST API for frontend-backend communication
- Clean separation of frontend and backend
- Environment-based configuration using `.env`

---

## Project Structure

─ backend/ # Node.js / Express REST API
─ frontend/ # React + Vite application
─ package.json # Shared dev tools (e.g. concurrently)
─ README.md

## Installation

The project consists of three npm projects:

- `backend/` – Node.js / Express server
- `frontend/` – React / Vite application
- Project root – shared development tools (e.g. concurrently)

### One-time Setup

```bash

## Backend

cd backend
npm install

# Frontend

cd ../frontend
npm install

## Root (dev tools)

cd ..
npm install

```

## Environment Variables

Copy backend/.env.example to backend/.env

Configure MongoDB connection

Configure Cloudinary credentials for image uploads:

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

## Running the Project (Development)

From the project root:

npm run dev

This will start both frontend and backend concurrently.

## Notes

This project was developed in an academic context and demonstrates:

Fullstack application architecture

REST API design

Frontend-backend integration

Clean project structure

Git-based development workflow.
