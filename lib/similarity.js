import cosineSimilarity from 'cosine-similarity';

class ContentScorer {
  constructor(jobDescription) {
    this.jobDescription = jobDescription.toLowerCase();
    this.requiredSkills = this.extractSkills(jobDescription);
    this.requiredExperience = this.extractExperience(jobDescription);
    this.certificationKeywords = this.extractCertificationKeywords(jobDescription);
  }

  extractSkills(text) {
    const skillPattern = /(?:requirements|skills|qualifications):?([^.]+)/i;
    const match = text.match(skillPattern);
    return match ? match[1].split(/[,;]| and | or /)
      .map(skill => skill.trim().toLowerCase())
      .filter(skill => skill.length > 0) : [];
  }

  extractExperience(text) {
    const expPattern = /(\d+)\+? years? of experience/i;
    const match = text.match(expPattern);
    return match ? parseInt(match[1]) : 0;
  }

  extractCertificationKeywords(text) {
    const certPattern = /(?:certifications?:|must have) ([^.]+)/i;
    const match = text.match(certPattern);
    return match ? match[1].split(/[,;]| and | or /)
      .map(cert => cert.trim().toLowerCase())
      .filter(cert => cert.length > 0) : [];
  }

  scoreResume(resumeText) {
    if (!resumeText || typeof resumeText !== 'string') return 0;
    
    const text = resumeText.toLowerCase();
    let score = 0;

    // 1. Experience match (20 points)
    const expMatch = text.match(/(\d+)\+? years? of experience/i);
    const candidateExp = expMatch ? parseInt(expMatch[1]) : 0;
    const expScore = this.requiredExperience > 0 ?
      Math.min(20, (candidateExp / this.requiredExperience) * 20) : 0;
    score += expScore;

    // 2. Skills match (15 points)
    const matchedSkills = this.requiredSkills.filter(skill => 
      text.includes(skill)
    ).length;
    const skillsScore = this.requiredSkills.length > 0 ?
      Math.min(15, (matchedSkills / this.requiredSkills.length) * 15) : 0;
    score += skillsScore;

    // 3. Projects match (10 points)
    const projectCount = (text.match(/\bproject\b:/gi) || []).length;
    const projectsScore = Math.min(10, projectCount * 2);
    score += projectsScore;

    // 4. Certifications match (5 points)
    const matchedCerts = this.certificationKeywords.filter(cert => 
      text.includes(cert)
    ).length;
    const certsScore = this.certificationKeywords.length > 0 ?
      Math.min(5, (matchedCerts / this.certificationKeywords.length) * 5) : 0;
    score += certsScore;

    return score;
  }
}

class TfIdfVectorizer {
  constructor() {
    this.documents = [];
    this.vocabulary = new Set();
    this.idf = {};
  }

  fit(documents) {
    if (!Array.isArray(documents)) {
      throw new Error('Documents must be an array');
    }

    this.documents = documents;
    const docFrequency = {};
    
    // Build vocabulary and document frequencies
    documents.forEach(doc => {
      if (typeof doc !== 'string') return;
      
      const terms = this.tokenize(doc);
      const uniqueTerms = new Set(terms);
      
      uniqueTerms.forEach(term => {
        this.vocabulary.add(term);
        docFrequency[term] = (docFrequency[term] || 0) + 1;
      });
    });

    // Calculate IDF
    this.vocabulary.forEach(term => {
      this.idf[term] = Math.log(documents.length / (1 + docFrequency[term]));
    });
  }

  tokenize(text) {
    if (!text || typeof text !== 'string') return [];
    
    return text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(term => term.length > 2);
  }

  transform(document) {
    if (!document || typeof document !== 'string') {
      return Array(this.vocabulary.size).fill(0);
    }

    const terms = this.tokenize(document);
    const termFrequency = {};
    const vector = [];
    
    // Calculate term frequencies
    terms.forEach(term => {
      termFrequency[term] = (termFrequency[term] || 0) + 1;
    });

    // Create TF-IDF vector
    this.vocabulary.forEach(term => {
      const tf = (termFrequency[term] || 0) / terms.length;
      const idf = this.idf[term] || 0;
      vector.push(tf * idf);
    });

    return vector;
  }
}

export function calculateCombinedScore(jobDescription, resumes) {
  if (!jobDescription || !resumes || !Array.isArray(resumes)) {
    console.error('Invalid inputs to calculateCombinedScore');
    return [];
  }

  try {
    const scorer = new ContentScorer(jobDescription);
    const vectorizer = new TfIdfVectorizer();
    const documents = [jobDescription, ...resumes];
    
    // Initialize the vectorizer
    vectorizer.fit(documents);
    
    // Transform documents to vectors
    const vectors = documents.map(doc => {
      try {
        return vectorizer.transform(doc);
      } catch (err) {
        console.error('Error transforming document:', err);
        return Array(vectorizer.vocabulary.size).fill(0);
      }
    });
    
    const jobVector = vectors[0];
    const results = [];
    
    vectors.slice(1).forEach((resumeVector, i) => {
      try {
        // Content-based score (50%)
        const contentScore = scorer.scoreResume(resumes[i]);
        
        // Similarity score (50%)
        let similarityScore = 0;
        try {
          similarityScore = cosineSimilarity(jobVector, resumeVector) * 50;
        } catch (err) {
          console.error('Error calculating similarity:', err);
        }
        
        // Combined score
        const combinedScore = contentScore + similarityScore;
        
        results.push({
          contentScore: parseFloat(contentScore.toFixed(2)),
          similarityScore: parseFloat(similarityScore.toFixed(2)),
          combinedScore: parseFloat(combinedScore.toFixed(2)),
          details: {
            experience: scorer.requiredExperience,
            matchedSkills: scorer.requiredSkills.filter(skill => 
              resumes[i]?.toLowerCase()?.includes(skill) || false
            ),
            projectsCount: (resumes[i]?.match(/\bproject\b:/gi) || []).length,
            matchedCertifications: scorer.certificationKeywords.filter(cert => 
              resumes[i]?.toLowerCase()?.includes(cert) || false
            ),
            resumeText: resumes[i]?.substring(0, 500) + 
              (resumes[i]?.length > 500 ? '...' : '')
          }
        });
      } catch (error) {
        console.error(`Error processing resume ${i}:`, error);
      }
    });

    return results;
  } catch (error) {
    console.error('Error in calculateCombinedScore:', error);
    return [];
  }
}