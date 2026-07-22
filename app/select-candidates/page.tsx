"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Users, Check } from "lucide-react"

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

interface CandidatePayload {
  fileName: string
  fullName: string
  email: string
  score: number
  skillMatch: number
  contentSimilarity: number
  matchedSkills: string[]
  missingSkills: string[]
  jobDescription: string
  jobTitle: string
  selectedAt: string
}

const SelectCandidatesPage = () => {
  const [scoringResults, setScoringResults] = useState<Record<string, ScoringResult>>({})
  const [jobDescription, setJobDescription] = useState("")
  const [jobTitle, setJobTitle] = useState("")
  const [candidateCount, setCandidateCount] = useState(3)
  const [isSelectingCandidates, setIsSelectingCandidates] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    // Load data from localStorage
    const storedResults = localStorage.getItem("scoringResults")
    const storedJobDescription = localStorage.getItem("jobDescription")
    const storedJobTitle = localStorage.getItem("jobTitle")

    if (storedResults) setScoringResults(JSON.parse(storedResults))
    if (storedJobDescription) setJobDescription(storedJobDescription)
    if (storedJobTitle) setJobTitle(storedJobTitle)

    // Redirect if missing data
    if (!storedResults || !storedJobDescription || !storedJobTitle) {
      window.location.href = "/"
    }
  }, [])

  const selectCandidates = async () => {
    if (candidateCount <= 0 || candidateCount > Object.keys(scoringResults).length) {
      alert(`Please enter a valid number between 1 and ${Object.keys(scoringResults).length}`)
      return
    }

    setIsSelectingCandidates(true)

    try {
      const sortedResults = Object.entries(scoringResults)
        .sort(([, a], [, b]) => b.score - a.score)
        .slice(0, candidateCount)

      const selectedCandidates: CandidatePayload[] = sortedResults.map(([fileName, result]) => ({
        fileName,
        fullName: result.fullName || "N/A",
        email: result.email || "N/A",
        score: result.score,
        skillMatch: result.skill_match,
        contentSimilarity: result.content_similarity,
        matchedSkills: result.matched_skills,
        missingSkills: result.missing_skills,
        jobDescription: jobDescription.substring(0, 500) + "...",
        jobTitle, // ✅ Ensure jobTitle is attached
        selectedAt: new Date().toISOString(),
      }))

      const response = await fetch("/api/select-candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidates: selectedCandidates,
          totalCandidates: Object.keys(scoringResults).length,
          jobDescription,
          jobTitle, // ✅ also pass top-level for backend
        }),
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.error || "Failed to select candidates")
      }

      setIsSuccess(true)

      // Clear localStorage
      localStorage.removeItem("scoringResults")
      localStorage.removeItem("jobDescription")
      localStorage.removeItem("jobTitle")
    } catch (error) {
      console.error("Error selecting candidates:", error)
      alert(error instanceof Error ? error.message : "Error selecting candidates. Please try again.")
    } finally {
      setIsSelectingCandidates(false)
    }
  }

  const goBack = () => {
    window.location.href = "/"
  }

  const sortedCandidates = Object.entries(scoringResults).sort(([, a], [, b]) => b.score - a.score)

  // ✅ Success UI
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Candidates Selected Successfully!</h1>
            <p className="text-gray-600 mb-8">
              {candidateCount} candidates have been stored for <strong>{jobTitle}</strong>.
            </p>
            <button
              onClick={goBack}
              className="inline-flex items-center px-6 py-3 bg-[#087684] hover:bg-[#065b66] text-white font-semibold rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Resume Scorer
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ✅ Normal UI
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-8">
          <button
            onClick={goBack}
            className="inline-flex items-center text-[#087684] hover:text-[#065b66] font-medium mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Results
          </button>

          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-[#087684] mb-4">
              <Users className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Select Top Candidates</h1>
            <p className="text-gray-600">
              Choose the best candidates for the position: <strong>{jobTitle}</strong>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Selection Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Selection Settings</h2>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Number of Candidates</label>
                <input
                  type="number"
                  min={1}
                  max={Object.keys(scoringResults).length}
                  value={candidateCount}
                  onChange={(e) => setCandidateCount(Number.parseInt(e.target.value) || 1)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#087684] focus:border-transparent"
                  disabled={isSelectingCandidates}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Max: {Object.keys(scoringResults).length} candidates available
                </p>
              </div>

              {/* Preview */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Selected Candidates Preview</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {sortedCandidates.slice(0, candidateCount).map(([fileName, result], index) => (
                    <div key={fileName} className="flex items-center justify-between p-2 bg-green-50 rounded-md">
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-medium mr-2">
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{result.fullName || fileName}</p>
                          <p className="text-xs text-gray-500">{result.email}</p>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-green-600">{result.score}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={selectCandidates}
                disabled={isSelectingCandidates}
                className="w-full px-4 py-3 bg-[#087684] hover:bg-[#065b66] disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors"
              >
                {isSelectingCandidates ? "Selecting Candidates..." : `Select ${candidateCount} Candidates`}
              </button>
            </div>
          </div>

          {/* Candidates List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">All Candidates (Ranked by Score)</h2>

              <div className="space-y-4">
                {sortedCandidates.map(([fileName, result], index) => (
                  <div
                    key={fileName}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      index < candidateCount ? "border-green-200 bg-green-50" : "border-gray-200 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mr-3 ${
                            index < candidateCount ? "bg-green-500 text-white" : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{result.fullName || fileName}</h3>
                          <p className="text-sm text-gray-600">{result.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">{result.score}%</div>
                        <div className="text-sm text-gray-500">Overall Score</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <div className="text-sm text-gray-600">Skill Match</div>
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${result.skill_match}%` }}></div>
                          </div>
                          <span className="text-sm font-medium">{result.skill_match}%</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Content Similarity</div>
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                            <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${result.content_similarity}%` }}></div>
                          </div>
                          <span className="text-sm font-medium">{result.content_similarity}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {result.matched_skills.slice(0, 3).map((skill, skillIndex) => (
                        <span key={skillIndex} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          {skill}
                        </span>
                      ))}
                      {result.matched_skills.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{result.matched_skills.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SelectCandidatesPage
