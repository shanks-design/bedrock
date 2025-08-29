'use client'

import { useState } from 'react'

interface UserData {
  fid: number
  profile?: any
  casts?: any[]
  reactions?: any[]
}

interface CharacterAnalysisProps {
  userData: UserData
  onReanalyze: () => void
}

interface AnalysisResult {
  topMatches: Array<{
    character: string
    show: string
    confidence: number
    reasoning: string
  }>
  identifiedTraits: string[]
  personalitySummary: string
}

interface AnalysisResponse {
  success: boolean
  analysis: AnalysisResult
  userData: {
    username: string
    displayName: string
    castsAnalyzed: number
    reactionsAnalyzed: number
  }
  timestamp: string
}

export default function CharacterAnalysis({ userData, onReanalyze }: CharacterAnalysisProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const analyzeCharacter = async () => {
    if (!userData.casts || userData.casts.length === 0) {
      setError('No casts available for analysis. Please try reconnecting your account.')
      return
    }

    setIsAnalyzing(true)
    setError(null)

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userData }),
      })

      if (!response.ok) {
        throw new Error('Failed to analyze character')
      }

      const result = await response.json()
      setAnalysisResult(result)
    } catch (err) {
      console.error('Analysis error:', err)
      setError('Failed to analyze your character. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Auto-analyze when component mounts
  useState(() => {
    if (userData.casts && userData.casts.length > 0 && !analysisResult) {
      analyzeCharacter()
    }
  })

  return (
    <div className="max-w-4xl mx-auto">
      {/* User Profile Section */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 mb-8">
        <div className="flex items-center gap-6">
          {userData.profile?.pfpUrl && (
            <img 
              src={userData.profile.pfpUrl} 
              alt={userData.profile.displayName || 'Profile'} 
              className="w-20 h-20 rounded-full border-4 border-white/20"
            />
          )}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-2">
              {userData.profile?.displayName || `Farcaster User ${userData.fid}`}
            </h2>
            {userData.profile?.username && (
              <p className="text-gray-300 text-lg mb-2">@{userData.profile.username}</p>
            )}
            {userData.profile?.bio && (
              <p className="text-gray-300">{userData.profile.bio}</p>
            )}
            <div className="flex gap-6 mt-4 text-sm text-gray-300">
              <div>
                <span className="font-semibold text-white">{userData.casts?.length || 0}</span> casts
              </div>
              {userData.profile?.followerCount && (
                <div>
                  <span className="font-semibold text-white">{userData.profile.followerCount}</span> followers
                </div>
              )}
              {userData.profile?.followingCount && (
                <div>
                  <span className="font-semibold text-white">{userData.profile.followingCount}</span> following
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Section */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-8 text-center">
        {!analysisResult && !isAnalyzing && !error && (
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-white mb-4">
              Ready to Discover Your Character?
            </h3>
            <p className="text-gray-300 mb-6">
              We'll analyze your {userData.casts?.length || 0} casts to find which sitcom character matches your personality!
            </p>
            <button
              onClick={analyzeCharacter}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105"
            >
              Analyze My Character
            </button>
          </div>
        )}

        {isAnalyzing && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
            <h3 className="text-2xl font-bold text-white mb-2">Analyzing Your Character...</h3>
            <p className="text-gray-300">
              Our AI is studying your {userData.casts?.length || 0} casts to find your perfect sitcom match!
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-6 py-4 rounded-lg mb-6">
            <p className="text-lg font-semibold mb-2">Analysis Failed</p>
            <p>{error}</p>
            <button
              onClick={analyzeCharacter}
              className="mt-4 bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg"
            >
              Try Again
            </button>
          </div>
        )}

        {analysisResult && (
          <div className="space-y-6">
            {/* Top Character Match */}
            <div className="text-center">
              <h3 className="text-3xl font-bold text-white mb-2">
                🎭 You're Most Like:
              </h3>
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-transparent bg-clip-text">
                <h2 className="text-4xl font-bold">{analysisResult.analysis.topMatches[0].character}</h2>
              </div>
              <p className="text-xl text-gray-300 mt-2">
                from <span className="text-white font-semibold">{analysisResult.analysis.topMatches[0].show}</span>
              </p>
              <div className="mt-4">
                <span className="bg-blue-500/20 border border-blue-500/50 text-blue-200 px-4 py-2 rounded-full text-lg font-semibold">
                  {analysisResult.analysis.topMatches[0].confidence}% Match
                </span>
              </div>
            </div>

            {/* All Character Matches */}
            <div className="bg-white/5 rounded-lg p-6">
              <h4 className="text-xl font-semibold text-white mb-4">Your Character Matches</h4>
              <div className="space-y-4">
                {analysisResult.analysis.topMatches.map((match, index) => (
                  <div key={index} className={`p-4 rounded-lg border ${
                    index === 0 
                      ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/50' 
                      : 'bg-white/5 border-white/20'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-lg font-semibold text-white">
                        {index + 1}. {match.character}
                      </h5>
                      <span className="text-sm text-gray-300">{match.show}</span>
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        index === 0 
                          ? 'bg-yellow-500/20 text-yellow-200 border border-yellow-500/50' 
                          : 'bg-blue-500/20 text-blue-200 border border-blue-500/50'
                      }`}>
                        {match.confidence}% Match
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed">{match.reasoning}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Identified Traits */}
            <div className="bg-white/5 rounded-lg p-6">
              <h4 className="text-xl font-semibold text-white mb-4">Your Personality Traits</h4>
              <div className="flex flex-wrap gap-2 justify-center">
                {analysisResult.analysis.identifiedTraits.map((trait, index) => (
                  <span
                    key={index}
                    className="bg-purple-500/20 border border-purple-500/50 text-purple-200 px-3 py-1 rounded-full text-sm"
                  >
                    {trait}
                  </span>
                ))}
              </div>
            </div>

            {/* Personality Summary */}
            <div className="bg-white/5 rounded-lg p-6">
              <h4 className="text-xl font-semibold text-white mb-4">Personality Summary</h4>
              <p className="text-gray-300 leading-relaxed text-center">{analysisResult.analysis.personalitySummary}</p>
            </div>

            {/* Analysis Details */}
            <div className="bg-white/5 rounded-lg p-6">
              <h4 className="text-xl font-semibold text-white mb-4">Analysis Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-400">{analysisResult.analysis.topMatches[0].confidence}%</div>
                  <div className="text-gray-300 text-sm">Top Match</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-400">{analysisResult.userData.castsAnalyzed}</div>
                  <div className="text-gray-300 text-sm">Casts Analyzed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-400">{analysisResult.userData.reactionsAnalyzed}</div>
                  <div className="text-gray-300 text-sm">Reactions Analyzed</div>
                </div>
              </div>
              <div className="text-center mt-4">
                <p className="text-xs text-gray-400">
                  Analyzed on {new Date(analysisResult.timestamp).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={onReanalyze}
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200"
              >
                Analyze Again
              </button>
              <button
                onClick={() => {
                  // Share functionality could be added here
                  alert('Share functionality coming soon!')
                }}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200"
              >
                Share Result
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
