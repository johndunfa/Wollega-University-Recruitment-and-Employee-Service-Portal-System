"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { FileText, Brain, Download, Trash2, ChevronRight, ChevronLeft, ArrowLeft } from "lucide-react"

interface JobDescriptionFile {
  name: string
  content: string
  file: File
}

interface ScoringResult {
  score: number
  skill_match: number
  content_similarity: number
  matched_skills: string[]
  missing_skills: string[]
  education: string[]
  experience: string[]
  recommendations: string[]
  fullName?: string
  email?: string
}

const ResumeScorer = () => {
  const searchParams = useSearchParams()
  const [currentStep, setCurrentStep] = useState(1)
  const [jobDescription, setJobDescription] = useState("")
  const [jobTitle, setJobTitle] = useState("")
  const [jobDescriptionFile, setJobDescriptionFile] = useState<JobDescriptionFile | null>(null)
  const [department, setDepartment] = useState("");
  const [location, setLocation] = useState("");
  const [scoringResults, setScoringResults] = useState<Record<string, ScoringResult>>({})
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedResult, setSelectedResult] = useState<{ fileName: string; result: ScoringResult } | null>(null)
  const [showAnalysisModal, setShowAnalysisModal] = useState(false)
  const [cameFromJobPosting, setCameFromJobPosting] = useState(false)

  // Load job details from URL params
  useEffect(() => {
    const jobTitleParam = searchParams.get('jobTitle');
    const jobDescriptionParam = searchParams.get('jobDescription');
    const departmentParam = searchParams.get('department');
    const locationParam = searchParams.get('location');

    if (jobTitleParam) setJobTitle(decodeURIComponent(jobTitleParam));
    if (jobDescriptionParam) setJobDescription(decodeURIComponent(jobDescriptionParam));
    if (departmentParam) setDepartment(decodeURIComponent(departmentParam));
    if (locationParam) setLocation(decodeURIComponent(locationParam));
  }, [searchParams]);

  const handleJobDescriptionFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setJobDescriptionFile({
          name: file.name,
          content,
          file,
        })
        setJobDescription(content)
      }
      reader.readAsText(file)
    }
  }

  const removeJobDescriptionFile = () => {
    setJobDescriptionFile(null)
    setJobDescription("")
  }

  const processResumes = async () => {
    if (!jobDescription.trim()) {
      alert("Please provide a job description.")
      return
    }

    setIsProcessing(true)

    try {
      const formData = new FormData()
      formData.append("jobDescription", jobDescription)
      if (jobTitle) formData.append("jobTitle", jobTitle)

      const response = await fetch("/api/process-resumes", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) throw new Error("Failed to process resumes")

      const results = await response.json()

      if (results.message) {
        alert(results.message)
        setScoringResults({})
        return
      }

      if (typeof results === "object" && !Array.isArray(results)) {
        setScoringResults(results)
        setCurrentStep(4)
      } else {
        throw new Error("Invalid response format")
      }
    } catch (error) {
      console.error("Error processing resumes:", error)
      alert("Error processing resumes. Please try again.")
      setScoringResults({})
    } finally {
      setIsProcessing(false)
    }
  }

  const openAnalysisModal = (fileName: string, result: ScoringResult) => {
    setSelectedResult({ fileName, result })
    setShowAnalysisModal(true)
  }

  const closeAnalysisModal = () => {
    setShowAnalysisModal(false)
    setSelectedResult(null)
  }

  const downloadResults = () => {
    const dataStr = JSON.stringify({
      jobTitle,
      jobDescription,
      results: scoringResults
    }, null, 2)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)
    const exportFileDefaultName = `resume_scores_${jobTitle || 'analysis'}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  const handleSelectCandidates = () => {
    localStorage.setItem("scoringResults", JSON.stringify(scoringResults))
    localStorage.setItem("jobDescription", jobDescription)
    localStorage.setItem("jobTitle", jobTitle)
    window.location.href = "/select-candidates"
  }

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const resetProcess = () => {
    setJobDescription("")
    setJobTitle("")
    setJobDescriptionFile(null)
    setScoringResults({})
    setCurrentStep(1)
    setCameFromJobPosting(false)
  }

  const canProceedToStep2 = jobDescription.trim().length > 0
  const canProceedToStep3 = jobDescription.trim().length > 10

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {cameFromJobPosting && (
          <button 
            onClick={() => window.history.back()}
            className="mb-4 flex items-center text-[#087684] hover:text-[#065b66] transition"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Job Postings
          </button>
        )}

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {jobTitle ? `Analyzing for: ${jobTitle}` : 'AI Resume Scorer'}
          </h1>
          <p className="text-gray-600">Step-by-step resume analysis process</p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= step ? "bg-[#087684] text-white" : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {step}
                </div>
                <span className={`ml-2 text-sm ${currentStep >= step ? "text-[#087684]" : "text-gray-500"}`}>
                  {step === 1 && "Job Description"}
                  {step === 2 && "Review"}
                  {step === 3 && "Analyze"}
                  {step === 4 && "Results"}
                </span>
                {step < 4 && <ChevronRight className="w-4 h-4 text-gray-400 ml-4" />}
              </div>
            ))}
          </div>
        </div>

        {currentStep === 1 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center mb-4">
              <FileText className="w-6 h-6 text-[#087684] mr-3" />
              <h2 className="text-xl font-semibold text-gray-800">Step 1: Enter Job Description</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload Job Description File</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="file"
                    accept=".txt,.doc,.docx"
                    onChange={handleJobDescriptionFileUpload}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#087684] file:text-white hover:file:bg-[#065b66]"
                  />
                  {jobDescriptionFile && (
                    <button
                      onClick={removeJobDescriptionFile}
                      className="p-2 text-red-500 hover:text-red-700"
                      title="Remove file"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {jobDescriptionFile && (
                  <p className="text-sm text-gray-600 mt-1">Uploaded: {jobDescriptionFile.name}</p>
                )}
              </div>

              <div className="text-center text-gray-500">or</div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Paste Job Description</label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job description here..."
                  className="w-full h-64 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#087684] focus:border-transparent resize-none"
                />
                <p className="text-sm text-gray-500 mt-1">Characters: {jobDescription.length} (minimum 10 required)</p>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={nextStep}
                disabled={!canProceedToStep2}
                className="inline-flex items-center px-6 py-3 bg-[#087684] hover:bg-[#065b66] disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors"
              >
                Next: Review
                <ChevronRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center mb-4">
              <FileText className="w-6 h-6 text-[#087684] mr-3" />
              <h2 className="text-xl font-semibold text-gray-800">Step 2: Review Job Description</h2>
            </div>

            {jobTitle && (
              <div className="mb-4 p-3 bg-blue-50 rounded-md">
                <h3 className="font-medium text-blue-800">Job Title:</h3>
                <p className="text-blue-700">{jobTitle}</p>
              </div>
            )}

            <div className="bg-gray-50 p-4 rounded-md mb-4">
              <h3 className="font-medium text-gray-700 mb-2">Job Description:</h3>
              <div className="text-sm text-gray-600 max-h-40 overflow-y-auto whitespace-pre-wrap">{jobDescription}</div>
            </div>

            <div className="flex justify-between mt-6">
              <button
                onClick={prevStep}
                className="inline-flex items-center px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 mr-2" />
                Back: Edit
              </button>
              <button
                onClick={nextStep}
                disabled={!canProceedToStep3}
                className="inline-flex items-center px-6 py-3 bg-[#087684] hover:bg-[#065b66] disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors"
              >
                Next: Analyze
                <ChevronRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center mb-4">
              <Brain className="w-6 h-6 text-[#087684] mr-3" />
              <h2 className="text-xl font-semibold text-gray-800">Step 3: Analyze Resumes</h2>
            </div>

            <div className="text-center">
              <p className="text-gray-600 mb-6">Ready to analyze all stored resumes against your job description.</p>

              <button
                onClick={processResumes}
                disabled={isProcessing}
                className="inline-flex items-center px-8 py-4 bg-[#087684] hover:bg-[#065b66] disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors text-lg"
              >
                <Brain className="w-6 h-6 mr-3" />
                {isProcessing ? "Processing..." : "Start Analysis"}
              </button>

              <p className="text-sm text-gray-500 mt-4">
                This will automatically analyze all resumes stored in the database
              </p>
            </div>

            <div className="flex justify-between mt-8">
              <button
                onClick={prevStep}
                disabled={isProcessing}
                className="inline-flex items-center px-6 py-3 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-700 font-semibold rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 mr-2" />
                Back: Review
              </button>
            </div>
          </div>
        )}

        {currentStep === 4 && Object.keys(scoringResults).length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Step 4: Scoring Results</h2>
              <div className="flex space-x-3">
                <button
                  onClick={resetProcess}
                  className="inline-flex items-center px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium rounded-md transition-colors"
                >
                  New Analysis
                </button>
                <button
                  onClick={handleSelectCandidates}
                  className="inline-flex items-center px-4 py-2 bg-[#087684] hover:bg-[#065b66] text-white text-sm font-medium rounded-md transition-colors"
                >
                  Select Candidates
                </button>
                <button
                  onClick={downloadResults}
                  className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Results
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resume</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Overall Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Object.entries(scoringResults)
                    .sort(([, a], [, b]) => b.score - a.score)
                    .map(([fileName, result]) => (
                      <tr key={fileName}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">{fileName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{result.fullName || "N/A"}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{result.email || "N/A"}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-24 bg-gray-200 rounded-full h-2.5 mr-2">
                              <div
                                className={`h-2.5 rounded-full ${
                                  result.score >= 80 ? "bg-green-500" : result.score >= 60 ? "bg-yellow-500" : "bg-red-500"
                                }`}
                                style={{ width: `${result.score}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">{result.score}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => openAnalysisModal(fileName, result)}
                            className="text-[#087684] hover:text-[#065b66] text-sm font-medium underline"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {showAnalysisModal && selectedResult && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-800">
                    Detailed Analysis: {selectedResult.fileName}
                  </h3>
                  <button onClick={closeAnalysisModal} className="text-gray-500 hover:text-gray-700">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="mb-6">
                  <div className="flex items-center mb-2">
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div
                        className={`h-4 rounded-full ${
                          selectedResult.result.score >= 80
                            ? "bg-green-500"
                            : selectedResult.result.score >= 60
                              ? "bg-yellow-500"
                              : "bg-red-500"
                        }`}
                        style={{ width: `${selectedResult.result.score}%` }}
                      ></div>
                    </div>
                    <span className="ml-3 text-lg font-bold">{selectedResult.result.score}%</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {selectedResult.result.score >= 80
                      ? "Excellent match for this position"
                      : selectedResult.result.score >= 60
                        ? "Good match for this position"
                        : selectedResult.result.score >= 40
                          ? "Moderate match for this position"
                          : "Low match for this position"}
                  </p>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-md font-semibold text-gray-700 mb-2">Skill Match</h4>
                    <div className="flex items-center mb-2">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full ${
                            selectedResult.result.skill_match >= 80
                              ? "bg-green-500"
                              : selectedResult.result.skill_match >= 50
                                ? "bg-yellow-500"
                                : "bg-red-500"
                          }`}
                          style={{ width: `${selectedResult.result.skill_match}%` }}
                        ></div>
                      </div>
                      <span className="ml-3 text-sm font-medium">{selectedResult.result.skill_match}%</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-1">Matched Skills</h5>
                        <div className="flex flex-wrap gap-2">
                          {selectedResult.result.matched_skills.length > 0 ? (
                            selectedResult.result.matched_skills.map((skill, index) => (
                              <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                {skill}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-gray-500">No matched skills found</span>
                          )}
                        </div>
                      </div>

                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-1">Missing Skills</h5>
                        <div className="flex flex-wrap gap-2">
                          {selectedResult.result.missing_skills.length > 0 ? (
                            selectedResult.result.missing_skills.map((skill, index) => (
                              <span key={index} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                                {skill}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-gray-500">No missing skills found</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-md font-semibold text-gray-700 mb-2">Content Similarity</h4>
                    <div className="flex items-center mb-2">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full ${
                            selectedResult.result.content_similarity >= 80
                              ? "bg-green-500"
                              : selectedResult.result.content_similarity >= 50
                                ? "bg-yellow-500"
                                : "bg-red-500"
                          }`}
                          style={{ width: `${selectedResult.result.content_similarity}%` }}
                        ></div>
                      </div>
                      <span className="ml-3 text-sm font-medium">{selectedResult.result.content_similarity}%</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      This measures how well the resume content aligns with the job description.
                    </p>
                  </div>

                  <div>
                    <h4 className="text-md font-semibold text-gray-700 mb-4">Education</h4>
                    {selectedResult.result.education.length > 0 ? (
                      <ul className="list-disc pl-5 space-y-1">
                        {selectedResult.result.education.map((edu, index) => (
                          <li key={index} className="text-sm text-gray-600">
                            {edu}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">No education information detected</p>
                    )}
                  </div>

                  <div>
                    <h4 className="text-md font-semibold text-gray-700 mb-4">Experience</h4>
                    {selectedResult.result.experience.length > 0 ? (
                      <ul className="list-disc pl-5 space-y-1">
                        {selectedResult.result.experience.map((exp, index) => (
                          <li key={index} className="text-sm text-gray-600">
                            {exp}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">No experience information detected</p>
                    )}
                  </div>

                  {selectedResult.result.recommendations.length > 0 && (
                    <div>
                      <h4 className="text-md font-semibold text-gray-700 mb-2">Recommendations</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        {selectedResult.result.recommendations.map((rec, index) => (
                          <li key={index} className="text-sm text-gray-600">
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end">
                  <button
                    onClick={closeAnalysisModal}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ResumeScorer