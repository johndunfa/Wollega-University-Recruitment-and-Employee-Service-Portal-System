import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { Application } from "@/lib/models/Resume"

const createDeterministicScore = (input: string): number => {
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash) % 100
}

const extractSkillsFromText = (text: string): string[] => {
  const commonSkills = [
    "javascript",
    "python",
    "java",
    "react",
    "nodejs",
    "typescript",
    "html",
    "css",
    "sql",
    "mongodb",
    "postgresql",
    "aws",
    "docker",
    "kubernetes",
    "git",
    "linux",
    "machine learning",
    "data science",
    "artificial intelligence",
    "backend",
    "frontend",
    "full stack",
    "devops",
    "agile",
    "scrum",
    "rest api",
    "graphql",
    "microservices",
    "cloud computing",
    "cybersecurity",
    "mobile development",
    "web development",
    "project management",
    "leadership",
    "communication",
    "problem solving",
  ]

  const textLower = text.toLowerCase()
  return commonSkills.filter((skill) => textLower.includes(skill) || textLower.includes(skill.replace(/\s+/g, "")))
}

const calculateTextSimilarity = (text1: string, text2: string): number => {
  if (!text1 || !text2 || text1.length < 10 || text2.length < 10) {
    return 0
  }

  const words1 = text1
    .toLowerCase()
    .split(/\W+/)
    .filter((word) => word.length > 2)
  const words2 = text2
    .toLowerCase()
    .split(/\W+/)
    .filter((word) => word.length > 2)

  if (words1.length === 0 || words2.length === 0) return 0

  const commonWords = words1.filter((word) => words2.includes(word))
  const similarity = (commonWords.length * 2) / (words1.length + words2.length)

  return Math.round(similarity * 100)
}

const validateJobDescription = (jobDescription: string): boolean => {
  return typeof jobDescription === "string" && jobDescription.trim().length >= 20
}

const checkCVCompleteness = (resumeContent: string, appData: any): number => {
  const requiredSections = {
    name: 0,
    field: 0,
    experience: 0,
    skills: 0,
    projects: 0,
    certifications: 0,
  }

  const contentLower = resumeContent.toLowerCase()

  // Check for Name (from fullName field or content)
  if (appData.fullName || contentLower.includes("name") || /[a-z]+\s+[a-z]+/i.test(resumeContent)) {
    requiredSections.name = 1
  }

  // Check for Field/Domain (job title, profession, field of study)
  const fieldKeywords = [
    "engineer",
    "developer",
    "analyst",
    "manager",
    "designer",
    "consultant",
    "specialist",
    "coordinator",
    "director",
    "lead",
    "senior",
    "junior",
    "intern",
    "software",
    "data",
    "web",
    "mobile",
    "frontend",
    "backend",
    "fullstack",
    "devops",
  ]
  if (fieldKeywords.some((keyword) => contentLower.includes(keyword)) || appData.jobTitle) {
    requiredSections.field = 1
  }

  // Check for Experience (work history, employment, job experience)
  const experienceKeywords = [
    "experience",
    "work",
    "employment",
    "job",
    "position",
    "role",
    "company",
    "organization",
    "worked",
    "years",
    "months",
  ]
  if (
    experienceKeywords.some((keyword) => contentLower.includes(keyword)) ||
    (appData.experience && appData.experience.length > 0)
  ) {
    requiredSections.experience = 1
  }

  // Check for Skills (technical skills, programming languages, tools)
  const skillKeywords = [
    "skills",
    "technologies",
    "programming",
    "languages",
    "tools",
    "frameworks",
    "libraries",
    "software",
    "technical",
  ]
  if (
    skillKeywords.some((keyword) => contentLower.includes(keyword)) ||
    (appData.skills && appData.skills.length > 0)
  ) {
    requiredSections.skills = 1
  }

  // Check for Projects (personal projects, portfolio, github)
  const projectKeywords = [
    "project",
    "portfolio",
    "github",
    "built",
    "developed",
    "created",
    "designed",
    "implemented",
    "application",
    "website",
    "system",
  ]
  if (projectKeywords.some((keyword) => contentLower.includes(keyword)) || appData.projects) {
    requiredSections.projects = 1
  }

  // Check for Certifications (certificates, certifications, courses, training)
  const certificationKeywords = [
    "certification",
    "certificate",
    "certified",
    "course",
    "training",
    "diploma",
    "degree",
    "qualification",
    "license",
  ]
  if (
    certificationKeywords.some((keyword) => contentLower.includes(keyword)) ||
    (appData.education && appData.education.length > 0)
  ) {
    requiredSections.certifications = 1
  }

  // Calculate completeness percentage
  const totalSections = Object.keys(requiredSections).length
  const completedSections = Object.values(requiredSections).reduce((sum, value) => sum + value, 0)

  return Math.round((completedSections / totalSections) * 100)
}

const extractExperienceRequirements = (jobDescription: string): { years: number; level: string } => {
  const textLower = jobDescription.toLowerCase()

  // Extract years of experience
  let requiredYears = 0
  const yearPatterns = [
    /(\d+)\+?\s*years?\s*(?:of\s*)?experience/i,
    /(\d+)\+?\s*years?\s*(?:of\s*)?(?:work\s*)?experience/i,
    /minimum\s*(?:of\s*)?(\d+)\s*years?/i,
    /at\s*least\s*(\d+)\s*years?/i,
    /(\d+)\+\s*years?/i,
  ]

  for (const pattern of yearPatterns) {
    const match = textLower.match(pattern)
    if (match) {
      requiredYears = Number.parseInt(match[1])
      break
    }
  }

  // Extract experience level
  let level = "entry"
  if (textLower.includes("senior") || textLower.includes("lead") || textLower.includes("principal")) {
    level = "senior"
  } else if (textLower.includes("mid") || textLower.includes("intermediate") || requiredYears >= 3) {
    level = "mid"
  } else if (textLower.includes("junior") || textLower.includes("entry") || requiredYears <= 2) {
    level = "entry"
  }

  return { years: requiredYears, level }
}

const extractEducationRequirements = (jobDescription: string): { degree: DegreeLevel; field: string[] } => {
  const textLower = jobDescription.toLowerCase()

  // Extract degree level
  let requiredDegree: DegreeLevel = "none"
  if (textLower.includes("phd") || textLower.includes("doctorate")) {
    requiredDegree = "phd"
  } else if (textLower.includes("master") || textLower.includes("msc") || textLower.includes("mba")) {
    requiredDegree = "masters"
  } else if (textLower.includes("bachelor") || textLower.includes("bsc") || textLower.includes("degree")) {
    requiredDegree = "bachelors"
  }

  // Extract field of study
  const fieldKeywords = [
    "computer science",
    "software engineering",
    "information technology",
    "engineering",
    "mathematics",
    "physics",
    "data science",
    "business",
    "marketing",
    "finance",
    "accounting",
    "design",
    "art",
    "psychology",
    "education",
  ]

  const requiredFields = fieldKeywords.filter((field) => textLower.includes(field))

  return { degree: requiredDegree, field: requiredFields }
}

const calculateExperienceScore = (cvExperience: any[], jobRequirements: { years: number; level: string }): number => {
  if (!cvExperience || cvExperience.length === 0) {
    return jobRequirements.years === 0 ? 100 : 0
  }

  // Calculate total years of experience from CV
  let totalYears = 0
  let hasRelevantLevel = false

  for (const exp of cvExperience) {
    const expText = (exp.title || exp.position || exp.role || "").toLowerCase()
    const companyText = (exp.company || "").toLowerCase()

    // Try to extract years from experience duration
    if (exp.duration) {
      const durationText = exp.duration.toLowerCase()
      const yearMatch = durationText.match(/(\d+)\s*years?/)
      if (yearMatch) {
        totalYears += Number.parseInt(yearMatch[1])
      }
    }

    // Check if experience level matches job requirements
    if (
      jobRequirements.level === "senior" &&
      (expText.includes("senior") || expText.includes("lead") || expText.includes("manager"))
    ) {
      hasRelevantLevel = true
    } else if (
      jobRequirements.level === "mid" &&
      (expText.includes("developer") || expText.includes("engineer") || expText.includes("analyst"))
    ) {
      hasRelevantLevel = true
    } else if (jobRequirements.level === "entry") {
      hasRelevantLevel = true
    }
  }

  // If no duration info, estimate based on number of positions
  if (totalYears === 0) {
    totalYears = cvExperience.length * 1.5 // Estimate 1.5 years per position
  }

  // Calculate score based on years and level match
  let score = 0
  if (totalYears >= jobRequirements.years) {
    score = 100
  } else if (jobRequirements.years > 0) {
    score = Math.round((totalYears / jobRequirements.years) * 80)
  } else {
    score = 80 // No specific years required
  }

  // Bonus for matching experience level
  if (hasRelevantLevel) {
    score = Math.min(score + 20, 100)
  }

  return Math.max(score, 0)
}

type DegreeLevel = "none" | "bachelors" | "masters" | "phd";

const calculateEducationScore = (
  cvEducation: any[],
  jobRequirements: { degree: DegreeLevel; field: string[] }
): number => {
  if (!cvEducation || cvEducation.length === 0) {
    return jobRequirements.degree === "none" ? 100 : 20
  }

  let degreeScore = 0
  let fieldScore = 0

  const degreeHierarchy: Record<DegreeLevel, number> = { none: 0, bachelors: 1, masters: 2, phd: 3 }
  const requiredLevel = degreeHierarchy[jobRequirements.degree] || 0

  for (const edu of cvEducation) {
    const degreeText = (edu.degree || edu.qualification || "").toLowerCase()
    const fieldText = (edu.field || edu.major || edu.subject || "").toLowerCase()

    // Check degree level
    let candidateLevel = 0
    if (degreeText.includes("phd") || degreeText.includes("doctorate")) {
      candidateLevel = 3
    } else if (degreeText.includes("master") || degreeText.includes("msc") || degreeText.includes("mba")) {
      candidateLevel = 2
    } else if (degreeText.includes("bachelor") || degreeText.includes("bsc") || degreeText.includes("degree")) {
      candidateLevel = 1
    }

    if (candidateLevel >= requiredLevel) {
      degreeScore = 100
    } else if (requiredLevel > 0) {
      degreeScore = Math.max(degreeScore, (candidateLevel / requiredLevel) * 70)
    }

    // Check field match
    if (jobRequirements.field.length > 0) {
      const fieldMatches = jobRequirements.field.filter(
        (reqField) => fieldText.includes(reqField) || reqField.includes(fieldText.split(" ")[0]),
      )
      if (fieldMatches.length > 0) {
        fieldScore = 100
      } else {
        // Partial match for related fields
        const relatedFields = ["computer", "software", "engineering", "technology", "science"]
        if (relatedFields.some((field) => fieldText.includes(field))) {
          fieldScore = Math.max(fieldScore, 60)
        }
      }
    } else {
      fieldScore = 80 // No specific field required
    }
  }

  // If no degree required, give high score for having any education
  if (jobRequirements.degree === "none") {
    return 90
  }

  // Combine degree and field scores
  return Math.round(degreeScore * 0.6 + fieldScore * 0.4)
}

const skillRelationships: { [key: string]: string[] } = {
  // Frontend Technologies
  react: ["nextjs", "next.js", "next", "javascript", "jsx", "typescript", "redux", "react native"],
  vue: ["vuejs", "vue.js", "nuxt", "nuxtjs", "nuxt.js", "javascript", "typescript"],
  angular: ["angularjs", "typescript", "javascript", "rxjs"],
  javascript: ["typescript", "nodejs", "node.js", "react", "vue", "angular", "jquery", "es6", "es2015"],
  typescript: ["javascript", "react", "angular", "nodejs", "node.js"],
  nextjs: ["react", "javascript", "typescript", "vercel"],
  "next.js": ["react", "javascript", "typescript", "vercel"],
  next: ["react", "javascript", "typescript", "vercel"],
  nuxt: ["vue", "javascript", "typescript"],
  svelte: ["javascript", "typescript", "sveltekit"],

  // Backend Technologies
  nodejs: ["node.js", "javascript", "typescript", "express", "nestjs"],
  "node.js": ["nodejs", "javascript", "typescript", "express", "nestjs"],
  express: ["nodejs", "node.js", "javascript", "typescript"],
  nestjs: ["nodejs", "node.js", "typescript", "express"],
  python: ["django", "flask", "fastapi", "pandas", "numpy", "machine learning", "data science"],
  django: ["python", "web development", "backend"],
  flask: ["python", "web development", "backend"],
  fastapi: ["python", "web development", "backend", "api"],
  java: ["spring", "spring boot", "maven", "gradle", "android"],
  spring: ["java", "spring boot", "backend"],
  php: ["laravel", "symfony", "wordpress", "web development"],
  laravel: ["php", "web development", "backend"],

  // Databases
  mongodb: ["nosql", "database", "mongoose", "atlas"],
  postgresql: ["sql", "database", "postgres"],
  mysql: ["sql", "database", "mariadb"],
  sql: ["postgresql", "mysql", "database", "sqlite"],
  nosql: ["mongodb", "cassandra", "couchdb", "database"],
  redis: ["caching", "database", "nosql"],

  // Cloud & DevOps
  aws: ["amazon web services", "cloud computing", "ec2", "s3", "lambda", "cloudformation"],
  azure: ["microsoft azure", "cloud computing"],
  gcp: ["google cloud", "cloud computing"],
  docker: ["containerization", "kubernetes", "devops"],
  kubernetes: ["docker", "containerization", "devops", "k8s"],
  devops: ["docker", "kubernetes", "ci/cd", "jenkins", "github actions"],

  // Mobile Development
  "react native": ["react", "javascript", "typescript", "mobile development"],
  flutter: ["dart", "mobile development"],
  android: ["java", "kotlin", "mobile development"],
  ios: ["swift", "objective-c", "mobile development"],
  swift: ["ios", "mobile development"],

  // Data & AI
  "machine learning": ["python", "tensorflow", "pytorch", "scikit-learn", "data science", "ai"],
  "data science": ["python", "machine learning", "pandas", "numpy", "matplotlib", "ai"],
  "artificial intelligence": ["machine learning", "python", "tensorflow", "pytorch", "data science"],
  tensorflow: ["python", "machine learning", "ai", "deep learning"],
  pytorch: ["python", "machine learning", "ai", "deep learning"],

  // Testing
  jest: ["javascript", "typescript", "react", "testing"],
  cypress: ["javascript", "typescript", "testing", "e2e"],
  selenium: ["testing", "automation", "java", "python"],

  // Version Control & Tools
  git: ["github", "gitlab", "bitbucket", "version control"],
  github: ["git", "version control", "github actions"],
  gitlab: ["git", "version control", "ci/cd"],
}

const calculateAdvancedSkillMatch = (
  jobSkills: string[],
  applicationSkills: string[],
  resumeContent: string,
): {
  matchedSkills: string[]
  relatedSkills: string[]
  missingSkills: string[]
  skillScore: number
} => {
  const normalizeSkill = (skill: string) => skill.toLowerCase().replace(/[.\s-]/g, "")

  const jobSkillsNormalized = jobSkills.map(normalizeSkill)
  const appSkillsNormalized = applicationSkills.map(normalizeSkill)
  const resumeContentLower = resumeContent.toLowerCase()

  const exactMatches: string[] = []
  const relatedMatches: string[] = []
  const missingSkills: string[] = []

  let totalScore = 0
  const maxPossibleScore = jobSkills.length * 100 // 100 points per required skill

  for (const jobSkill of jobSkills) {
    const jobSkillNorm = normalizeSkill(jobSkill)
    let skillFound = false
    let bestMatchScore = 0
    let matchedSkill = ""

    // Check for exact matches in application skills
    for (const appSkill of applicationSkills) {
      const appSkillNorm = normalizeSkill(appSkill)
      if (appSkillNorm === jobSkillNorm || appSkillNorm.includes(jobSkillNorm) || jobSkillNorm.includes(appSkillNorm)) {
        exactMatches.push(jobSkill)
        totalScore += 100 // Full points for exact match
        skillFound = true
        matchedSkill = appSkill
        break
      }
    }

    // Check for exact matches in resume content
    if (!skillFound && resumeContentLower.includes(jobSkillNorm)) {
      exactMatches.push(jobSkill)
      totalScore += 100
      skillFound = true
    }

    // If no exact match, check for related skills
    if (!skillFound) {
      const relatedSkills = skillRelationships[jobSkillNorm] || []

      for (const appSkill of applicationSkills) {
        const appSkillNorm = normalizeSkill(appSkill)

        // Check if app skill is related to job skill
        if (relatedSkills.includes(appSkillNorm)) {
          const relationshipScore = 70 // 70% of full points for related skills
          if (relationshipScore > bestMatchScore) {
            bestMatchScore = relationshipScore
            matchedSkill = appSkill
          }
        }

        // Check reverse relationship (if job skill is related to app skill)
        const appSkillRelated = skillRelationships[appSkillNorm] || []
        if (appSkillRelated.includes(jobSkillNorm)) {
          const relationshipScore = 70
          if (relationshipScore > bestMatchScore) {
            bestMatchScore = relationshipScore
            matchedSkill = appSkill
          }
        }
      }

      // Also check resume content for related skills
      for (const relatedSkill of relatedSkills) {
        if (resumeContentLower.includes(relatedSkill)) {
          const relationshipScore = 60 // Slightly lower for content matches
          if (relationshipScore > bestMatchScore) {
            bestMatchScore = relationshipScore
            matchedSkill = relatedSkill
          }
        }
      }

      if (bestMatchScore > 0) {
        relatedMatches.push(`${jobSkill} (related: ${matchedSkill})`)
        totalScore += bestMatchScore
        skillFound = true
      }
    }

    if (!skillFound) {
      missingSkills.push(jobSkill)
    }
  }

  // Calculate additional score for extra relevant skills in CV
  const extraRelevantSkills: string[] = []
  for (const appSkill of applicationSkills) {
    const appSkillNorm = normalizeSkill(appSkill)

    // Check if this app skill is related to any job skill but not already counted
    for (const jobSkill of jobSkills) {
      const jobSkillNorm = normalizeSkill(jobSkill)
      const relatedSkills = skillRelationships[jobSkillNorm] || []

      if (
        relatedSkills.includes(appSkillNorm) &&
        !exactMatches.some((match) => normalizeSkill(match) === jobSkillNorm) &&
        !relatedMatches.some((match) => match.includes(jobSkill))
      ) {
        extraRelevantSkills.push(appSkill)
        totalScore += 30 // Bonus points for extra relevant skills
        break
      }
    }
  }

  const skillScore = maxPossibleScore > 0 ? Math.min(Math.round((totalScore / maxPossibleScore) * 100), 100) : 0

  return {
    matchedSkills: exactMatches,
    relatedSkills: [...relatedMatches, ...extraRelevantSkills.map((skill) => `${skill} (bonus relevant skill)`)],
    missingSkills: missingSkills.slice(0, 5), // Limit to top 5 missing skills
    skillScore,
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const jobDescription = formData.get("jobDescription") as string
    const jobTitle = formData.get("jobTitle") as string

    if (!jobDescription) {
      return NextResponse.json({ error: "Job description is required" }, { status: 400 })
    }

    if (!validateJobDescription(jobDescription)) {
      return NextResponse.json(
        {
          error: "Job description is too short. Please provide a detailed job description (minimum 20 characters).",
        },
        { status: 400 },
      )
    }

    const results: Record<string, any> = {}

    try {
      await connectToDatabase()
      
      // Build query to filter applications by job title
      const query: any = {}
      if (jobTitle) {
        query.jobTitle = { $regex: new RegExp(jobTitle, "i") } // Case-insensitive match
      }

      console.log(`[v0] Querying applications with filter:`, query)
      const databaseApplications = await Application.find(query)

      console.log(`[v0] Found ${databaseApplications.length} applications matching job title "${jobTitle}"`)

      if (databaseApplications.length === 0) {
        return NextResponse.json(
          { message: `No applicants found for job title: ${jobTitle}` },
          { status: 200 }
        )
      }

      const jobSkills = extractSkillsFromText(jobDescription)
      const experienceRequirements = extractExperienceRequirements(jobDescription)
      const educationRequirements = extractEducationRequirements(jobDescription)

      console.log(`[v0] Job requirements:`, {
        skills: jobSkills,
        experience: experienceRequirements,
        education: educationRequirements,
      })

      for (const application of databaseApplications) {
        try {
          let result = null
          const appData = application.toObject ? application.toObject() : application

          try {
            const pythonResponse = await fetch("http://localhost:8000/score-resume", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                job_title: jobTitle, // Pass job title to Python service
                job_description: jobDescription,
                resume_content: appData.cvFile?.content || `Resume for ${appData.fullName || "Unknown"}`,
                resume_filename: appData.cvFile?.name || "resume.pdf",
                resume_type: appData.cvFile?.type || "application/pdf",
              }),
            })

            if (pythonResponse.ok) {
              result = await pythonResponse.json()
            }
          } catch (fetchError) {
            console.log(`[v0] Python service unavailable, using fallback analysis`)
          }

          if (!result) {
            const resumeContent =
              appData.cvFile?.content || `${appData.fullName} ${appData.email} ${(appData.skills || []).join(" ")}`
            const applicationSkills = appData.skills || []

            const skillAnalysis = calculateAdvancedSkillMatch(jobSkills, applicationSkills, resumeContent)
            const contentSimilarity = checkCVCompleteness(resumeContent, appData)
            const experienceScore = calculateExperienceScore(appData.experience || [], experienceRequirements)
            const educationScore = calculateEducationScore(appData.education || [], educationRequirements)

            const baseScore = Math.round(
              skillAnalysis.skillScore * 0.5 + // Increased weight for skills
              contentSimilarity * 0.2 + 
              experienceScore * 0.2 + 
              educationScore * 0.1
            )

            result = {
              score: Math.min(baseScore, 100),
              skill_match: skillAnalysis.skillScore,
              content_similarity: contentSimilarity,
              experience_match: experienceScore,
              education_match: educationScore,
              matched_skills: skillAnalysis.matchedSkills,
              related_skills: skillAnalysis.relatedSkills,
              missing_skills: skillAnalysis.missingSkills,
              education: appData.education?.length > 0 ? appData.education : [],
              experience: appData.experience?.length > 0 ? appData.experience : [],
              recommendations: generateRecommendations(
                skillAnalysis,
                experienceScore,
                educationScore,
                contentSimilarity,
                experienceRequirements
              )
            }
          }

          // Format the result with applicant details
          const displayName = `${appData.fullName || "Unknown"} - ${appData.jobTitle || "No Position"}`
          results[displayName] = {
            ...result,
            fullName: appData.fullName || "Unknown",
            email: appData.email || "No email",
            appliedAt: appData.appliedAt || "Unknown date",
            jobTitle: appData.jobTitle || "Unknown position"
          }
        } catch (error) {
          console.error(`Error processing application:`, error)
          const appData = application.toObject ? application.toObject() : application
          const displayName = `${appData.fullName || "Unknown"} (${appData.cvFile?.name || "resume.pdf"})`
          results[displayName] = {
            score: 0,
            skill_match: 0,
            content_similarity: 0,
            experience_match: 0,
            education_match: 0,
            matched_skills: [],
            related_skills: [],
            missing_skills: [],
            education: [],
            experience: [],
            recommendations: [`Unable to process application`],
            fullName: appData.fullName || "Unknown",
            email: appData.email || "No email",
            jobTitle: appData.jobTitle || "Unknown position"
          }
        }
      }

      return NextResponse.json(results)
    } catch (dbError) {
      console.error("Database error:", dbError)
      return NextResponse.json(
        { error: "Unable to connect to database or fetch applications" },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// Helper function to generate recommendations
function generateRecommendations(
  skillAnalysis: any,
  experienceScore: number,
  educationScore: number,
  contentSimilarity: number,
  experienceRequirements: any
): string[] {
  const recommendations: string[] = []
  
  // Skill recommendations
  if (skillAnalysis.matchedSkills.length > 0) {
    recommendations.push(`Strong skills: ${skillAnalysis.matchedSkills.slice(0, 3).join(", ")}`)
  }
  if (skillAnalysis.relatedSkills.length > 0) {
    recommendations.push(`Related skills: ${skillAnalysis.relatedSkills.slice(0, 3).join(", ")}`)
  }
  if (skillAnalysis.missingSkills.length > 0) {
    recommendations.push(`Missing key skills: ${skillAnalysis.missingSkills.slice(0, 3).join(", ")}`)
  }

  // Experience recommendations
  if (experienceScore >= 80) {
    recommendations.push("Experience meets or exceeds requirements")
  } else {
    recommendations.push(
      `Needs ${experienceRequirements.years}+ years experience (currently ${Math.round(experienceScore/20)}/5)`
    )
  }

  // Education recommendations
  if (educationScore >= 80) {
    recommendations.push("Education meets requirements")
  } else {
    recommendations.push("Could benefit from additional education/certifications")
  }

  // Resume quality recommendations
  if (contentSimilarity >= 80) {
    recommendations.push("Well-structured resume")
  } else {
    recommendations.push("Could improve resume completeness")
  }

  return recommendations.slice(0, 5) // Limit to top 5 recommendations
}
