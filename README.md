# FarmFi - Predictive Agriculture & Smart Marketplace Platform

## Overview
FarmFi is an advanced AgriTech web application featuring Plant Disease Detection via Machine Learning, weather-dependent risk predictions, agro e-commerce, user-credit accounting, and worker job matching.

## Architecture

* **Frontend:** React + Vite, GSAP (animations), Lenis (smooth scrolling), Tailwind (optional styling), Axios, Context API.
* **Backend:** Flask (modular via Blueprints), PyJWT, simple memory safe TensorFlow predictions.
* **Database:** Highly normalized MySQL relational database.

## System Setup

### 1. Database Initialization
1. Ensure MySQL server is running.
2. Locate the database schema at `database/schema.sql`
3. Execute the script to scaffold the `farmfi` database and tables.

### 2. Backend Environment (Flask & AI server)
The Python application wraps your previously trained `detector_disease.keras` model safely to limit memory Out-Of-Bounds (OOM). 
1. Navigate to `backend/`
2. Activate a Python virtual environment
3. Install dependencies: `pip install -r requirements.txt` 
   *(Note: Ensure `tensorflow` matches the version used to compile your keras model, typically `tensorflow>=2.15`)*
4. Run the API: `python app.py`

### 3. Frontend Environment (React UI)
1. Navigate to `frontend/`
2. Install npm modules:
   ```bash
   npm install
   npm install axios lucide-react react-router-dom @studio-freight/lenis gsap
   ```
3. Boot the Vite server: `npm run dev`
4. The React dashboard should interact straight away with `http://127.0.0.1:5000/`

## Deployment Strategy
1. **Frontend:** Vercel / Netlify.
2. **Backend/ML:** Render Web Service. Due to TensorFlow's size, we use `tensorflow-cpu` if deploying to free tier limits to ensure container limits aren't exceeded.
3. **Database:** Create an instance on PlanetScale, Railway, or Aiven.

*FarmFi AI - Building smarter tools for modern farmers!*