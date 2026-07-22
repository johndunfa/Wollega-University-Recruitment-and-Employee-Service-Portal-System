import json
import base64
import re
import os
from typing import Dict, List, Any
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize, sent_tokenize
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import PyPDF2
import docx
from io import BytesIO
import numpy as np

# Download required NLTK data
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')

class ResumeScorer:
    def __init__(self):
        self.stop_words = set(stopwords.words('english'))
        self.skill_keywords = [
            # Programming Languages
            'python', 'javascript', 'java', 'c++', 'c#', 'php', 'ruby', 'go', 'rust', 'swift',
            'kotlin', 'typescript', 'scala', 'r', 'matlab', 'sql', 'html', 'css',
            
            # Frameworks & Libraries
            'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask', 'spring',
            'laravel', 'rails', 'asp.net', 'jquery', 'bootstrap', 'tailwind',
            
            # Databases
            'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'oracle', 'sqlite',
            'cassandra', 'dynamodb', 'firebase',
            
            # Cloud & DevOps
            'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'git', 'github',
            'gitlab', 'ci/cd', 'terraform', 'ansible',
            
            # Data Science & ML
            'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'scikit-learn',
            'pandas', 'numpy', 'matplotlib', 'seaborn', 'jupyter', 'data analysis',
            'statistics', 'nlp', 'computer vision',
            
            # Other Technical Skills
            'api', 'rest', 'graphql', 'microservices', 'agile', 'scrum', 'testing',
            'unit testing', 'integration testing', 'debugging', 'optimization'
        ]
        
        self.education_patterns = [
            r'bachelor[\'s]?\s+(?:of\s+)?(?:science|arts|engineering|computer science|information technology)',
            r'master[\'s]?\s+(?:of\s+)?(?:science|arts|engineering|computer science|information technology)',
            r'phd|doctorate|doctoral',
            r'associate[\'s]?\s+degree',
            r'diploma\s+in',
            r'certificate\s+in',
            r'b\.?s\.?|b\.?a\.?|m\.?s\.?|m\.?a\.?|ph\.?d\.?'
        ]
        
        self.experience_patterns = [
            r'(\d+)[\+\-\s]*years?\s+(?:of\s+)?experience',
            r'(\d+)[\+\-\s]*years?\s+(?:working\s+)?(?:in|with|as)',
            r'experience[:\s]+(\d+)[\+\-\s]*years?',
            r'(\d+)[\+\-\s]*years?\s+(?:professional\s+)?(?:experience|background)'
        ]

    def extract_text_from_file(self, file_content: str, filename: str, file_type: str) -> str:
        """Extract text from different file formats"""
        try:
            # Decode base64 content
            file_bytes = base64.b64decode(file_content)
            
            if file_type == 'application/pdf' or filename.lower().endswith('.pdf'):
                return self._extract_from_pdf(file_bytes)
            elif file_type in ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
                              'application/msword'] or filename.lower().endswith(('.docx', '.doc')):
                return self._extract_from_docx(file_bytes)
            else:
                # Assume text file
                return file_bytes.decode('utf-8', errors='ignore')
        except Exception as e:
            print(f"Error extracting text from {filename}: {e}")
            return ""

    def _extract_from_pdf(self, file_bytes: bytes) -> str:
        """Extract text from PDF"""
        try:
            pdf_file = BytesIO(file_bytes)
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
            return text
        except Exception as e:
            print(f"Error reading PDF: {e}")
            return ""

    def _extract_from_docx(self, file_bytes: bytes) -> str:
        """Extract text from DOCX"""
        try:
            doc_file = BytesIO(file_bytes)
            doc = docx.Document(doc_file)
            text = ""
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
            return text
        except Exception as e:
            print(f"Error reading DOCX: {e}")
            return ""

    def preprocess_text(self, text: str) -> str:
        """Clean and preprocess text"""
        # Convert to lowercase
        text = text.lower()
        # Remove special characters but keep spaces
        text = re.sub(r'[^\w\s]', ' ', text)
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        return text

    def extract_skills(self, text: str) -> List[str]:
        """Extract skills from text"""
        text_lower = text.lower()
        found_skills = []
        
        for skill in self.skill_keywords:
            if skill.lower() in text_lower:
                found_skills.append(skill.title())
        
        return list(set(found_skills))

    def extract_education(self, text: str) -> List[str]:
        """Extract education information"""
        education = []
        text_lower = text.lower()
        
        for pattern in self.education_patterns:
            matches = re.findall(pattern, text_lower, re.IGNORECASE)
            for match in matches:
                if isinstance(match, tuple):
                    education.extend([m.title() for m in match if m])
                else:
                    education.append(match.title())
        
        # Look for specific degree mentions
        degree_mentions = re.findall(r'(bachelor|master|phd|doctorate|diploma|certificate)[\w\s]*(?:in|of)[\w\s]*(?:computer science|engineering|information technology|business|management)', text_lower, re.IGNORECASE)
        for mention in degree_mentions:
            education.append(mention.title())
        
        return list(set(education))

    def extract_experience(self, text: str) -> List[str]:
        """Extract experience information"""
        experience = []
        
        for pattern in self.experience_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                if isinstance(match, tuple):
                    years = [m for m in match if m.isdigit()]
                    if years:
                        experience.append(f"{years[0]}+ years of experience")
                else:
                    experience.append(f"{match}+ years of experience")
        
        # Look for job titles and companies
        job_patterns = [
            r'(?:worked\s+as|position\s+as|role\s+as|experience\s+as)\s+([^.]+)',
            r'(?:software engineer|developer|programmer|analyst|manager|director|lead|senior|junior)\s+(?:at\s+)?([^.]+)',
        ]
        
        for pattern in job_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                if len(match.strip()) > 3 and len(match.strip()) < 100:
                    experience.append(match.strip().title())
        
        return list(set(experience))

    def calculate_content_similarity(self, job_desc: str, resume_text: str) -> float:
        """Calculate content similarity using TF-IDF and cosine similarity"""
        try:
            # Preprocess texts
            job_desc_clean = self.preprocess_text(job_desc)
            resume_clean = self.preprocess_text(resume_text)
            
            # Create TF-IDF vectors
            vectorizer = TfidfVectorizer(stop_words='english', max_features=1000)
            tfidf_matrix = vectorizer.fit_transform([job_desc_clean, resume_clean])
            
            # Calculate cosine similarity
            similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
            
            return min(100, max(0, similarity * 100))
        except Exception as e:
            print(f"Error calculating content similarity: {e}")
            return 0.0

    def calculate_skill_match(self, job_skills: List[str], resume_skills: List[str]) -> Dict[str, Any]:
        """Calculate skill match percentage and identify matched/missing skills"""
        if not job_skills:
            return {
                'percentage': 0,
                'matched_skills': [],
                'missing_skills': []
            }
        
        job_skills_lower = [skill.lower() for skill in job_skills]
        resume_skills_lower = [skill.lower() for skill in resume_skills]
        
        matched_skills = []
        for skill in job_skills:
            if skill.lower() in resume_skills_lower:
                matched_skills.append(skill)
        
        missing_skills = []
        for skill in job_skills:
            if skill.lower() not in resume_skills_lower:
                missing_skills.append(skill)
        
        percentage = (len(matched_skills) / len(job_skills)) * 100 if job_skills else 0
        
        return {
            'percentage': min(100, max(0, percentage)),
            'matched_skills': matched_skills,
            'missing_skills': missing_skills
        }

    def generate_recommendations(self, skill_match_result: Dict[str, Any], 
                               content_similarity: float, 
                               education: List[str], 
                               experience: List[str]) -> List[str]:
        """Generate recommendations based on analysis"""
        recommendations = []
        
        # Skill-based recommendations
        if skill_match_result['percentage'] < 70:
            if skill_match_result['missing_skills']:
                top_missing = skill_match_result['missing_skills'][:3]
                recommendations.append(f"Consider learning: {', '.join(top_missing)}")
        
        # Content similarity recommendations
        if content_similarity < 60:
            recommendations.append("Tailor your resume to better match the job description keywords")
        
        # Education recommendations
        if not education:
            recommendations.append("Consider adding your educational background")
        
        # Experience recommendations
        if not experience:
            recommendations.append("Highlight your relevant work experience more clearly")
        elif len(experience) < 2:
            recommendations.append("Consider adding more details about your professional experience")
        
        # General recommendations
        if skill_match_result['percentage'] > 80 and content_similarity > 80:
            recommendations.append("Excellent match! Consider applying for this position")
        elif skill_match_result['percentage'] > 60:
            recommendations.append("Good skill match. Focus on highlighting relevant experience")
        
        return recommendations

    def score_resume(self, job_description: str, resume_content: str, 
                    resume_filename: str, resume_type: str) -> Dict[str, Any]:
        """Main function to score a resume against a job description"""
        
        # Extract text from resume
        resume_text = self.extract_text_from_file(resume_content, resume_filename, resume_type)
        
        if not resume_text.strip():
            return {
                'score': 0,
                'skill_match': 0,
                'content_similarity': 0,
                'matched_skills': [],
                'missing_skills': [],
                'education': [],
                'experience': [],
                'recommendations': ['Unable to extract text from resume']
            }
        
        # Extract information
        job_skills = self.extract_skills(job_description)
        resume_skills = self.extract_skills(resume_text)
        education = self.extract_education(resume_text)
        experience = self.extract_experience(resume_text)
        
        # Calculate metrics
        skill_match_result = self.calculate_skill_match(job_skills, resume_skills)
        content_similarity = self.calculate_content_similarity(job_description, resume_text)
        
        # Calculate overall score (weighted average)
        skill_weight = 0.6
        content_weight = 0.4
        overall_score = (skill_match_result['percentage'] * skill_weight + 
                        content_similarity * content_weight)
        
        # Generate recommendations
        recommendations = self.generate_recommendations(
            skill_match_result, content_similarity, education, experience
        )
        
        return {
            'score': round(overall_score, 1),
            'skill_match': round(skill_match_result['percentage'], 1),
            'content_similarity': round(content_similarity, 1),
            'matched_skills': skill_match_result['matched_skills'],
            'missing_skills': skill_match_result['missing_skills'],
            'education': education,
            'experience': experience,
            'recommendations': recommendations
        }

# Example usage and testing
if __name__ == "__main__":
    scorer = ResumeScorer()
    
    # Test with sample data
    sample_job_desc = """
    We are looking for a Senior Software Engineer with experience in:
    - Python programming
    - Machine Learning and Data Science
    - React and JavaScript
    - AWS cloud services
    - Bachelor's degree in Computer Science
    - 5+ years of experience
    """
    
    sample_resume = """
    John Doe
    Software Engineer
    
    Education:
    Bachelor of Science in Computer Science, XYZ University
    
    Experience:
    - 6 years of experience as a Software Engineer
    - Proficient in Python, JavaScript, and React
    - Experience with AWS and cloud deployment
    - Worked on machine learning projects
    
    Skills:
    Python, JavaScript, React, AWS, Machine Learning, Git, SQL
    """
    
    # Convert sample resume to base64 (simulating file upload)
    sample_resume_b64 = base64.b64encode(sample_resume.encode()).decode()
    
    result = scorer.score_resume(sample_job_desc, sample_resume_b64, "sample_resume.txt", "text/plain")
    
    print("Resume Scoring Result:")
    print(json.dumps(result, indent=2))
