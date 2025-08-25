"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Sparkles, Share2 } from "lucide-react"

// Character database with sitcom characters
const CHARACTERS = {
  "the-office": [
    { name: "Jim Halpert", traits: ["witty", "pranks", "sarcastic", "romantic"], show: "The Office" },
    { name: "Dwight Schrute", traits: ["intense", "competitive", "loyal", "eccentric"], show: "The Office" },
    {
      name: "Michael Scott",
      traits: ["enthusiastic", "inappropriate", "caring", "attention-seeking"],
      show: "The Office",
    },
    { name: "Pam Beesly", traits: ["artistic", "kind", "supportive", "gentle"], show: "The Office" },
  ],
  friends: [
    { name: "Chandler Bing", traits: ["sarcastic", "witty", "awkward", "loyal"], show: "Friends" },
    { name: "Ross Geller", traits: ["nerdy", "passionate", "dramatic", "intellectual"], show: "Friends" },
    { name: "Rachel Green", traits: ["fashionable", "determined", "social", "ambitious"], show: "Friends" },
    { name: "Monica Geller", traits: ["organized", "competitive", "caring", "perfectionist"], show: "Friends" },
  ],
  "big-bang-theory": [
    { name: "Sheldon Cooper", traits: ["genius", "rigid", "literal", "scientific"], show: "Big Bang Theory" },
    { name: "Leonard Hofstadter", traits: ["smart", "romantic", "insecure", "kind"], show: "Big Bang Theory" },
    { name: "Penny", traits: ["social", "practical", "friendly", "street-smart"], show: "Big Bang Theory" },
    { name: "Howard Wolowitz", traits: ["flirty", "creative", "insecure", "loyal"], show: "Big Bang Theory" },
  ],
  "silicon-valley": [
    { name: "Richard Hendricks", traits: ["anxious", "idealistic", "technical", "ethical"], show: "Silicon Valley" },
    { name: "Erlich Bachman", traits: ["arrogant", "delusional", "entrepreneurial", "loud"], show: "Silicon Valley" },
    { name: "Gilfoyle", traits: ["sarcastic", "dark", "technical", "pessimistic"], show: "Silicon Valley" },
    { name: "Dinesh", traits: ["competitive", "insecure", "technical", "petty"], show: "Silicon Valley" },
  ],
  himym: [
    {
      name: "Barney Stinson",
      traits: ["legendary", "suit-obsessed", "confident", "loyal"],
      show: "How I Met Your Mother",
    },
    {
      name: "Ted Mosby",
      traits: ["romantic", "architect", "storyteller", "optimistic"],
      show: "How I Met Your Mother",
    },
    { name: "Marshall Eriksen", traits: ["gentle", "environmental", "loyal", "funny"], show: "How I Met Your Mother" },
    {
      name: "Robin Scherbatsky",
      traits: ["independent", "canadian", "news-anchor", "tough"],
      show: "How I Met Your Mother",
    },
  ],
}

export default function FarcasterSitcomMatcher() {
  const [isConnected, setIsConnected] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState("")

  const connectFarcaster = async () => {
    setError("")

    try {
      const response = await fetch("/api/farcaster/connect", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to connect to Farcaster")
      }

      const data = await response.json()
      setUserProfile(data.profile)
      setIsConnected(true)
    } catch (err) {
      setError("Failed to connect to Farcaster. Please try again.")
    }
  }

  const analyzeUser = async () => {
    if (!isConnected || !userProfile) {
      setError("Please connect your Farcaster account first")
      return
    }

    setIsAnalyzing(true)
    setError("")

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fid: userProfile.fid,
          username: userProfile.username,
        }),
      })

      if (!response.ok) {
        throw new Error("Analysis failed")
      }

      const analysisResult = await response.json()
      setResult(analysisResult)
    } catch (err) {
      setError("Failed to analyze your casts. Please try again.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const resetAnalysis = () => {
    setResult(null)
    setIsConnected(false)
    setUserProfile(null)
    setError("")
  }

  if (result) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <Card className="text-center bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader className="space-y-4">
              <div className="mx-auto w-24 h-24 bg-yellow-400/20 rounded-full flex items-center justify-center">
                <Sparkles className="w-12 h-12 text-yellow-400" />
              </div>
              <div>
                <CardTitle className="text-2xl font-heading text-white">You are...</CardTitle>
                <CardDescription className="text-lg font-semibold mt-2 text-white">
                  {result.character.name}
                </CardDescription>
                <Badge variant="secondary" className="mt-2 bg-yellow-400 text-blue-900">
                  from {result.character.show}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-white/80">
                <div className="font-semibold mb-2">Match Confidence: {result.confidence}%</div>
                <p>{result.reasoning}</p>
              </div>

              <div className="flex flex-wrap gap-2 justify-center">
                {result.character.traits.map((trait: string) => (
                  <Badge key={trait} variant="outline" className="text-xs border-white/30 text-white">
                    {trait}
                  </Badge>
                ))}
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={resetAnalysis}
                  variant="outline"
                  className="flex-1 bg-transparent border-white/30 text-white hover:bg-white/10"
                >
                  Try Again
                </Button>
                <Button
                  className="flex-1 bg-yellow-400 text-blue-900 hover:bg-yellow-300"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: "My Sitcom Character Match!",
                        text: `I'm ${result.character.name} from ${result.character.show}! Find out which sitcom character you are.`,
                        url: window.location.href,
                      })
                    }
                  }}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-bg">
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="space-y-8">
          <h1 className="text-4xl md:text-6xl font-heading font-bold text-white leading-tight">
            Discover which <span className="text-yellow-400">sitcom character</span> you are based on your Farcaster
            casts.
          </h1>

          <div className="flex flex-col gap-6 justify-center items-center max-w-lg mx-auto">
            {!isConnected ? (
              <Button
                onClick={connectFarcaster}
                className="w-full bg-yellow-400 text-blue-900 hover:bg-yellow-300 px-16 py-8 text-2xl font-bold rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-200"
              >
                Connect Farcaster
              </Button>
            ) : (
              <div className="space-y-6 w-full">
                <div className="text-center space-y-3">
                  <div className="text-white/80 text-lg">Connected as</div>
                  <div className="font-semibold text-white text-2xl">@{userProfile?.username}</div>
                  <Badge
                    variant="secondary"
                    className="bg-green-500/20 text-green-300 border-green-500/30 px-4 py-2 text-base"
                  >
                    Connected
                  </Badge>
                </div>

                <Button
                  onClick={analyzeUser}
                  disabled={isAnalyzing}
                  className="w-full bg-yellow-400 text-blue-900 hover:bg-yellow-300 px-16 py-8 text-2xl font-bold rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-200"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                      Analyzing your casts...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-6 h-6 mr-3" />
                      Find My Character
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-heading font-semibold text-white mb-6">Featured Shows</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-8">
              {[
                { name: "The Office", image: "/the-office-tv-show-poster.png" },
                { name: "Friends", image: "/friends-tv-show-poster.png" },
                { name: "Big Bang Theory", image: "/big-bang-theory-tv-show-poster.png" },
                { name: "Silicon Valley", image: "/silicon-valley-tv-show-poster.png" },
                { name: "How I Met Your Mother", image: "/how-i-met-your-mother-tv-show-poster.png" },
              ].map((show) => (
                <div key={show.name} className="text-center">
                  <div className="bg-white/10 backdrop-blur-sm border-white/20 rounded-lg p-2 hover:bg-white/20 transition-all duration-200">
                    <img
                      src={show.image || "/placeholder.svg"}
                      alt={show.name}
                      className="w-full h-32 md:h-40 object-cover rounded-md mb-2"
                    />
                    <p className="text-white text-sm font-medium">{show.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {error && <p className="text-red-300 bg-red-500/20 px-4 py-2 rounded-lg max-w-md mx-auto">{error}</p>}
        </div>
      </div>
    </div>
  )
}
