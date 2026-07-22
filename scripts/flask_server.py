from flask import Flask, request, jsonify
from flask_cors import CORS
from resume_scorer import ResumeScorer
import json

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize the resume scorer
scorer = ResumeScorer()

@app.route('/score-resume', methods=['POST'])
def score_resume():
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        job_description = data.get('job_description')
        resume_content = data.get('resume_content')
        resume_filename = data.get('resume_filename')
        resume_type = data.get('resume_type')
        
        if not all([job_description, resume_content, resume_filename]):
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Score the resume
        result = scorer.score_resume(
            job_description=job_description,
            resume_content=resume_content,
            resume_filename=resume_filename,
            resume_type=resume_type or 'text/plain'
        )
        
        return jsonify(result)
        
    except Exception as e:
        print(f"Error in score_resume endpoint: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'message': 'Resume scorer service is running'})

@app.route('/batch-score', methods=['POST'])
def batch_score():
    """Score multiple resumes against a single job description"""
    try:
        data = request.get_json()
        
        job_description = data.get('job_description')
        resumes = data.get('resumes', [])
        
        if not job_description or not resumes:
            return jsonify({'error': 'Job description and resumes are required'}), 400
        
        results = {}
        
        for resume_data in resumes:
            filename = resume_data.get('filename')
            content = resume_data.get('content')
            file_type = resume_data.get('type', 'text/plain')
            
            if filename and content:
                result = scorer.score_resume(
                    job_description=job_description,
                    resume_content=content,
                    resume_filename=filename,
                    resume_type=file_type
                )
                results[filename] = result
        
        return jsonify(results)
        
    except Exception as e:
        print(f"Error in batch_score endpoint: {e}")
        return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    print("Starting Resume Scorer Flask Server...")
    print("Server will be available at: http://localhost:8000")
    print("Endpoints:")
    print("  POST /score-resume - Score a single resume")
    print("  POST /batch-score - Score multiple resumes")
    print("  GET /health - Health check")
    
    app.run(host='0.0.0.0', port=8000, debug=True)
