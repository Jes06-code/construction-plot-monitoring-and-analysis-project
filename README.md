# An Intelligent Monitoring Framework for Detecting Non-Compliance in Industrial Plot Utilization

## Overview

An Intelligent Monitoring Framework for Detecting Non-Compliance in Industrial Plot Utilization is an AI-powered web platform designed to improve industrial project monitoring through real-time analytics, automated compliance tracking, budget monitoring, and AI-based construction progress analysis.

The system replaces traditional manual monitoring methods with an intelligent digital platform that combines project management, financial tracking, and computer vision-based progress verification to enhance transparency, accountability, and decision-making.

---

## Problem Statement

Traditional industrial project monitoring relies heavily on manual inspections and progress reports, which are often subjective, time-consuming, and prone to errors. Financial tracking is usually separated from physical project progress, leading to budget overruns, delayed decisions, and reduced transparency.

This project addresses these challenges by providing an integrated platform that continuously monitors project progress, tracks expenditure, and detects potential non-compliance using AI-driven analytics.

---

## Key Features

### Secure Authentication
- Role-based login system
- Access control for different stakeholders
- Secure user authorization

### Interactive Dashboard
- Real-time project monitoring
- Budget vs Progress visualization
- Compliance indicators
- Project status tracking

### AI Analytics
- Construction stage detection using image analysis
- Project completion estimation
- Risk and delay identification
- Progress verification through uploaded site images

### Reporting System
- Automated report generation
- PDF export support
- Excel export support
- Compliance and performance summaries

---

## Technology Stack

### Frontend
- React.js (v19)
- Tailwind CSS
- Recharts

### Backend
- Python
- FastAPI

### Database
- Supabase

### AI & Analytics
- Computer Vision
- Image Analysis
- Progress Prediction

---

## System Modules

### 1. Authentication Module
Provides secure login functionality with role-based access for:
- Industrial Authorities
- Government Officials
- Contractors

### 2. Dashboard Module
Displays:
- Project Progress
- Budget Utilization
- Compliance Status
- Project Deadlines
- Risk Indicators

### 3. AI Analytics Module
Analyzes uploaded construction images to:
- Detect construction stages
- Estimate completion percentage
- Identify delays and risks
- Compare expected vs actual progress

### 4. Reporting Module
Generates:
- Monthly Progress Reports
- Compliance Reports
- Performance Analysis Reports
- PDF and Excel Exports

---

## Advantages

- Reduced manual monitoring effort
- Real-time project tracking
- Improved transparency
- Automated report generation
- Better budget management
- AI-assisted decision making
- Enhanced compliance monitoring

---

## Future Enhancements

- Mobile Application Integration
- IoT-Based Site Monitoring
- GIS and Interactive Map Integration
- Multi-Language Support

---

## Project Architecture

```text
Frontend (React + Tailwind)
        |
        v
 FastAPI Backend Services
        |
        v
     Supabase
        |
        v
 AI Analytics Engine
```

---

## Installation

### Clone Repository

```bash
git clone https://github.com/JeswanthKumar/Construction-Plot-Monitoring.git
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### Environment Configuration

Configure:
- Supabase URL
- Supabase API Key
- AI Service Configuration

inside the environment configuration file.

---

## Project Outcome

The system provides a centralized digital platform that enables real-time monitoring, automated reporting, AI-driven construction analysis, and budget tracking. It helps authorities make faster decisions, improve project transparency, and detect non-compliance efficiently.

---

## Academic Information

**Project Title:** An Intelligent Monitoring Framework for Detecting Non-Compliance in Industrial Plot Utilization

**Department:** Computer Science and Business Systems

**Institution:** PSNA College of Engineering and Technology

**Academic Year:** 2025–2026

---

## Team Members

- Jeswanth Kumar S
- Dharoon M

---

## Author

**Jeswanth Kumar**

GitHub: https://github.com/JeswanthKumar