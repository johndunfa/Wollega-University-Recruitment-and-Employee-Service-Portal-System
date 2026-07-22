import json
import base64
from resume_scorer import ResumeScorer

def test_resume_scorer():
    """Test the resume scorer with sample data"""
    print("Testing Resume Scorer...")
    print("=" * 50)
    
    scorer = ResumeScorer()
    
    # Sample job description
    job_description = """
    Senior Full Stack Developer Position
    
    We are seeking a Senior Full Stack Developer to join our dynamic team. 
    
    Required Skills:
    - 5+ years of experience in web development
    - Proficiency in JavaScript, React, Node.js
    - Experience with Python and Django
    - Knowledge of databases (PostgreSQL, MongoDB)
    - Cloud experience (AWS, Azure)
    - Bachelor's degree in Computer Science or related field
    
    Responsibilities:
    - Develop and maintain web applications
    - Work with cross-functional teams
    - Implement best practices for code quality
    - Mentor junior developers
    """
    
    # Sample resume (strong match)
    strong_resume = """
    Jane Smith
    Senior Software Engineer
    
    Education:
    Bachelor of Science in Computer Science, MIT (2015)
    
    Experience:
    Senior Full Stack Developer at TechCorp (2019-2024)
    - 7 years of experience in full stack web development
    - Led development of React-based web applications
    - Built scalable backend services using Node.js and Python
    - Implemented microservices architecture on AWS
    - Mentored team of 5 junior developers
    
    Software Engineer at StartupXYZ (2017-2019)
    - Developed Django web applications
    - Worked with PostgreSQL and MongoDB databases
    - Implemented CI/CD pipelines
    
    Skills:
    JavaScript, React, Node.js, Python, Django, PostgreSQL, MongoDB, 
    AWS, Docker, Git, Agile, Scrum, Leadership, Mentoring
    """
    
    # Sample resume (weak match)
    weak_resume = """
    Bob Johnson
    Junior Developer
    
    Education:
    Associate Degree in Information Technology (2022)
    
    Experience:
    Junior Web Developer at LocalCompany (2022-2024)
    - 2 years of experience in web development
    - Basic knowledge of HTML, CSS, JavaScript
    - Worked on small WordPress projects
    - Learning React in spare time
    
    Skills:
    HTML, CSS, JavaScript, WordPress, MySQL, Git
    """
    
    # Test both resumes
    test_cases = [
        ("Strong Match Resume", strong_resume),
        ("Weak Match Resume", weak_resume)
    ]
    
    for name, resume_text in test_cases:
        print(f"\n{name}:")
        print("-" * 30)
        
        # Convert to base64 (simulating file upload)
        resume_b64 = base64.b64encode(resume_text.encode()).decode()
        
        # Score the resume
        result = scorer.score_resume(
            job_description=job_description,
            resume_content=resume_b64,
            resume_filename=f"{name.lower().replace(' ', '_')}.txt",
            resume_type="text/plain"
        )
        
        # Display results
        print(f"Overall Score: {result['score']}%")
        print(f"Skill Match: {result['skill_match']}%")
        print(f"Content Similarity: {result['content_similarity']}%")
        print(f"Matched Skills: {', '.join(result['matched_skills'][:5])}...")
        print(f"Missing Skills: {', '.join(result['missing_skills'][:3])}...")
        print(f"Education: {', '.join(result['education'])}")
        print(f"Experience: {len(result['experience'])} items found")
        print(f"Recommendations: {len(result['recommendations'])} suggestions")
        
        if result['recommendations']:
            print("Top Recommendations:")
            for i, rec in enumerate(result['recommendations'][:2], 1):
                print(f"  {i}. {rec}")

def test_skill_extraction():
    """Test skill extraction functionality"""
    print("\n" + "=" * 50)
    print("Testing Skill Extraction...")
    print("=" * 50)
    
    scorer = ResumeScorer()
    
    test_text = """
    I have experience with Python, JavaScript, React, Node.js, and AWS.
    I've worked with databases like PostgreSQL and MongoDB.
    I'm familiar with machine learning libraries like TensorFlow and scikit-learn.
    """
    
    skills = scorer.extract_skills(test_text)
    print(f"Extracted Skills: {', '.join(skills)}")

if __name__ == "__main__":
    test_resume_scorer()
    test_skill_extraction()
    
    print("\n" + "=" * 50)
    print("✅ Testing completed!")
    print("\nTo run the full system:")
    print("1. Install dependencies: python scripts/install_dependencies.py")
    print("2. Start Flask server: python scripts/flask_server.py")
    print("3. Open the frontend application")
