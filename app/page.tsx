"use client"

import { useState, useEffect } from "react"
import { FarcasterAuth } from "@/components/farcaster-auth"
import { CharacterAnalysis } from "@/components/character-analysis"
import { sdk } from "@farcaster/miniapp-sdk"

interface FarcasterProfile {
  fid: number
  username: string
  displayName: string
  pfpUrl: string
  bio: string
  followerCount: number
  followingCount: number
}

interface Cast {
  text: string
  timestamp: number
  hash: string
}

interface AnalysisResult {
  character: {
    name: string
    traits: string[]
    show: string
  }
  confidence: number
  reasoning: string
  analyzedCasts: number
}

export default function Home() {
  const [profile, setProfile] = useState<FarcasterProfile | null>(null)
  const [casts, setCasts] = useState<Cast[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Initialize the Mini App SDK
    const initApp = async () => {
      try {
        // Check if we're running in a Farcaster client
        if (sdk.isInFarcaster) {
          // Try to get an existing session token
          const token = sdk.quickAuth.token
          if (token) {
            // We have a valid session, fetch user data
            await fetchUserData()
          }
        }
        
        // Hide the splash screen and show the app
        await sdk.actions.ready()
        setIsLoading(false)
      } catch (err) {
        console.error("Failed to initialize app:", err)
        setError("Failed to initialize the app")
        setIsLoading(false)
      }
    }

    initApp()
  }, [])

  const fetchUserData = async () => {
    try {
      // Use Quick Auth to make authenticated requests
      const response = await sdk.quickAuth.fetch("/api/farcaster/me")
      
      if (response.ok) {
        const data = await response.json()
        setProfile(data.profile)
        setCasts(data.casts || [])
      }
    } catch (err) {
      console.error("Failed to fetch user data:", err)
    }
  }

  const handleProfileLoaded = (profile: FarcasterProfile, casts: Cast[]) => {
    setProfile(profile)
    setCasts(casts)
  }

  const handleAnalyze = async (casts: Cast[]): Promise<AnalysisResult> => {
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ casts }),
    })

    if (!response.ok) {
      throw new Error("Failed to analyze casts")
    }

    return response.json()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-xl">Loading Sitcom Character Matcher...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center text-white">
          <p className="text-xl text-red-400 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-yellow-400 text-blue-900 px-6 py-3 rounded-lg hover:bg-yellow-300"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-bg">
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="space-y-8 mb-12">
          <h1 className="text-4xl md:text-6xl font-heading font-bold text-white leading-tight">
            Discover which <span className="text-yellow-400">sitcom character</span> you are based on your Farcaster casts.
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Connect your Farcaster account and let AI analyze your personality through your social posts to find your perfect sitcom match!
          </p>
        </div>

        <div className="space-y-8">
          {/* Farcaster Authentication */}
          <FarcasterAuth onProfileLoaded={handleProfileLoaded} />

          {/* Character Analysis - Only show when profile is loaded */}
          {profile && casts.length > 0 && (
            <CharacterAnalysis casts={casts} onAnalyze={handleAnalyze} />
          )}
        </div>

        {/* Featured Shows */}
        <div className="text-center mt-16">
          <h2 className="text-2xl font-heading font-semibold text-white mb-6">
            Featured Shows
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-8">
            <div className="text-center">
              <div className="bg-white/10 backdrop-blur-sm border-white/20 rounded-lg p-2 hover:bg-white/20 transition-all duration-200">
                <img
                  src="/the-office-tv-show-poster.png"
                  alt="The Office"
                  className="w-full h-32 md:h-40 object-cover rounded-md mb-2"
                />
                <p className="text-white text-sm font-medium">The Office</p>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white/10 backdrop-blur-sm border-white/20 rounded-lg p-2 hover:bg-white/20 transition-all duration-200">
                <img
                  src="/friends-tv-show-poster.png"
                  alt="Friends"
                  className="w-full h-32 md:h-40 object-cover rounded-md mb-2"
                />
                <p className="text-white text-sm font-medium">Friends</p>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white/10 backdrop-blur-sm border-white/20 rounded-lg p-2 hover:bg-white/20 transition-all duration-200">
                <img
                  src="/big-bang-theory-tv-show-poster.png"
                  alt="Big Bang Theory"
                  className="w-full h-32 md:h-40 object-cover rounded-md mb-2"
                />
                <p className="text-white text-sm font-medium">Big Bang Theory</p>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white/10 backdrop-blur-sm border-white/20 rounded-lg p-2 hover:bg-white/20 transition-all duration-200">
                <img
                  src="/silicon-valley-tv-show-poster.png"
                  alt="Silicon Valley"
                  className="w-full h-32 md:h-40 object-cover rounded-md mb-2"
                />
                <p className="text-white text-sm font-medium">Silicon Valley</p>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white/10 backdrop-blur-sm border-white/20 rounded-lg p-2 hover:bg-white/20 transition-all duration-200">
                <img
                  src="/how-i-met-your-mother-tv-show-poster.png"
                  alt="How I Met Your Mother"
                  className="w-full h-32 md:h-40 object-cover rounded-md mb-2"
                />
                <p className="text-white text-sm font-medium">How I Met Your Mother</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
