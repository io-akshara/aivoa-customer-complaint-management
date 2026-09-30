# AIVOA - AI-Powered Customer Complaint Management System

## Overview

AIVOA is an AI-powered Customer Complaint Management System designed
for pharmaceutical manufacturing environments.

The system helps users capture customer complaints, extract structured
information from complaint text or PDF documents, perform completeness
checking, generate an initial AI risk assessment, and interact with an
AI Copilot.

## Features

- Customer complaint management
- AI-powered complaint information extraction
- PDF complaint analysis
- Complaint completeness checking
- AI risk assessment
- AI Copilot
- Complaint history
- PostgreSQL database storage
- Redux state management
- LangGraph-based AI workflow

## Tech Stack

### Frontend
- React
- Redux Toolkit
- Vite

### Backend
- Python
- FastAPI

### AI
- LangGraph
- Groq
- Gemma 2 9B

### Database
- PostgreSQL

### Document Processing
- pypdf

## Architecture

User
→
React
→
Redux
→
FastAPI
→
LangGraph
→
Groq / Gemma
→
PostgreSQL

## Project Structure

AIVOA/
├── frontend/
├── backend/
├── .gitignore
├── .env.example
└── README.md

## Setup

### 1. Clone the repository

git clone YOUR_GITHUB_REPOSITORY_URL

### 2. Frontend

cd frontend
npm install
npm run dev

### 3. Backend

cd backend

Create a virtual environment:

python -m venv venv

Activate it:

Windows:

venv\Scripts\activate

Install dependencies:

pip install -r requirements.txt

### 4. Environment Variables

Create a `.env` file inside `backend/`:

GROQ_API_KEY=your_actual_groq_api_key

### 5. Start FastAPI

uvicorn main:app --reload

## Workflow

1. User enters a complaint or uploads a PDF.
2. Backend extracts complaint information.
3. LangGraph processes the complaint.
4. AI checks complaint completeness.
5. AI generates an initial risk assessment.
6. Extracted information is displayed in the complaint form.
7. User reviews and edits the information.
8. Complaint is stored in PostgreSQL.
9. User can view complaint history.
10. User can interact with AIVOA Copilot.

## Future Improvements

- Duplicate complaint detection
- CAPA recommendation
- Root cause recommendation
- Complaint summarization
- Advanced document processing
