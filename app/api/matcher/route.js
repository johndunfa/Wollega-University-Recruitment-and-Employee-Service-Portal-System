import { extractText } from '@/lib/extractText';
import { calculateCombinedScore } from '@/lib/similarity';
import fs from 'fs/promises';
import path from 'path';

const JOB_DESCRIPTION_FOLDER = process.env.JOB_DESC_FOLDER || 'C:/Users/Visionary/Desktop/job_description';
const RESUME_FOLDER = process.env.RESUME_FOLDER || 'C:/Users/Visionary/Desktop/resume_folder';

export async function POST() {
  try {
    // Read job description
    const jobFiles = await fs.readdir(JOB_DESCRIPTION_FOLDER);
    const jobDescriptionFile = jobFiles.find(file => 
      ['.txt', '.docx', '.pdf'].includes(path.extname(file).toLowerCase())
    );
    
    if (!jobDescriptionFile) {
      return Response.json(
        { message: "No job description file found", results: [] },
        { status: 400 }
      );
    }

    const jobDescriptionPath = path.join(JOB_DESCRIPTION_FOLDER, jobDescriptionFile);
    const jobDescription = await extractText(jobDescriptionPath);

    if (!jobDescription) {
      return Response.json(
        { message: "Failed to extract text from job description", results: [] },
        { status: 400 }
      );
    }

    // Read resumes
    const resumeFiles = await fs.readdir(RESUME_FOLDER);
    const validExtensions = ['.pdf', '.docx', '.txt'];
    
    const resumes = [];
    const fileNames = [];
    
    for (const file of resumeFiles) {
      const filePath = path.join(RESUME_FOLDER, file);
      const extension = path.extname(file).toLowerCase();
      
      if (validExtensions.includes(extension)) {
        try {
          const text = await extractText(filePath);
          if (text) {
            resumes.push(text);
            fileNames.push(file);
          }
        } catch (error) {
          console.error(`Error processing file ${file}:`, error);
        }
      }
    }

    if (resumes.length === 0) {
      return Response.json(
        { message: "No valid resumes found", results: [] },
        { status: 400 }
      );
    }

    // Calculate combined scores
    const results = calculateCombinedScore(jobDescription, resumes);
    
    if (results.length === 0) {
      return Response.json(
        { message: "Error calculating scores", results: [] },
        { status: 500 }
      );
    }

    // Prepare final response
    const response = results
      .map((result, index) => ({
        ...result,
        filename: fileNames[index]
      }))
      .sort((a, b) => b.combinedScore - a.combinedScore);

    return Response.json({
      message: `Top matching resumes for ${jobDescriptionFile}:`,
      results: response,
      scoringMetrics: {
        experienceWeight: 20,
        skillsWeight: 15,
        projectsWeight: 10,
        certificationsWeight: 5,
        similarityWeight: 50
      }
    });

  } catch (error) {
    console.error('Error in matcher API:', error);
    return Response.json(
      { message: 'Internal server error', results: [] },
      { status: 500 }
    );
  }
}