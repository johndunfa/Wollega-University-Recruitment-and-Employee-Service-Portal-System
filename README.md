# MiNT Jobs - Resume Scoring System

## Overview

This project is a job listing and application platform for the Ministry of Innovation and Technology (MiNT). It includes a machine learning-based resume scoring system that analyzes applicant resumes and provides a relevance score based on the job description.

## Features

- Job listing and application submission
- Resume upload and storage
- ML-based resume scoring against job descriptions
- Detailed analysis of applicant skills, education, and experience
- Visual representation of applicant match scores

## Architecture

The system consists of two main components:

1. **Next.js Application**: Handles the frontend UI, job listings, application submission, and applicant viewing.
2. **Python Flask Service**: Provides the ML-based resume scoring functionality using NLP techniques.

## Getting Started

### Prerequisites

- Node.js 18 or higher
- Python 3.8 or higher
- MongoDB database
- Docker and Docker Compose (optional, for containerized deployment)

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```
MONGODB_URI=your_mongodb_connection_string
```

### Installation

#### Option 1: Manual Setup

1. Install Next.js application dependencies:
   ```bash
   npm install
   ```

2. Install Python service dependencies:
   ```bash
   cd python_service
   pip install -r requirements.txt
   python -m spacy download en_core_web_sm
   ```

3. Start the Python service:
   ```bash
   cd python_service
   python app.py
   ```

4. In a separate terminal, start the Next.js application:
   ```bash
   npm run dev
   ```

#### Option 2: Docker Compose

Run both services using Docker Compose:

```bash
docker-compose up --build
```

## How the Resume Scoring Works

1. When a user applies for a job, they upload their resume (PDF or DOCX).
2. The resume is stored in the MongoDB database as a base64-encoded string.
3. When an HR user views applicants for a job, the system:
   - Extracts text from the resume
   - Sends the resume text and job description to the Python service
   - The Python service analyzes the content using NLP techniques:
     - TF-IDF vectorization and cosine similarity for content matching
     - Keyword extraction for skill matching
     - Entity recognition for education and experience detection
   - Returns a relevance score and detailed analysis
4. The UI displays the score with a visual indicator and provides detailed analysis when clicked

## Using the Resume Scoring Feature

1. Log in as an HR user
2. Navigate to the HR dashboard
3. Click "View Candidates" for a specific job posting
4. The system will automatically score all applicants based on their resume content
5. Click on an applicant's score to view detailed analysis including:
   - Overall match score
   - Skill match percentage
   - Matched and missing skills
   - Content similarity
   - Detected education and experience

## Customizing the Scoring Algorithm

The scoring algorithm can be customized by modifying the `calculate_score` function in `python_service/app.py`. The current implementation uses:

- 40% weight for content similarity
- 30% weight for skill matching
- 15% weight for education detection
- 15% weight for experience detection

You can adjust these weights or add additional factors to better suit your specific requirements.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!
