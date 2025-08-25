"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Badge } from "./ui/badge"
import { Progress } from "./ui/progress"
import { Loader2, Sparkles, Trophy, RefreshCw } from "lucide-react"

interface Character {
  name: string
  traits: string[]
  show: string
}

interface AnalysisResult {
  character: Character
  confidence: number
  reasoning: string
  analyzedCasts: number
}

interface CharacterAnalysisProps {
  casts: Array<{ text: string; timestamp: number; hash: string }>
  onAnalyze: (casts: Array<{ text: string; timestamp: number; hash: string }>) => Promise<AnalysisResult>
}

export function CharacterAnalysis({ casts, onAnalyze }: CharacterAnalysisProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const analyzeCasts = async () => {
    setIsAnalyzing(true)
    setError(null)

    try {
      const analysisResult = await onAnalyze(casts)
      setResult(analysisResult)
    } catch (err) {
      setError("Failed to analyze your casts. Please try again.")
      console.error("Analysis error:", err)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const resetAnalysis = () => {
    setResult(null)
    setError(null)
  }

  if (result) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <Trophy className="h-6 w-6 text-yellow-500" />
            Character Analysis Complete!
          </CardTitle>
          <CardDescription>
            Based on your {result.analyzedCasts} Farcaster casts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {result.character.name}
            </div>
            <div className="text-lg text-muted-foreground mb-4">
              from {result.character.show}
            </div>
            
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {result.character.traits.map((trait, index) => (
                <Badge key={index} variant="secondary">
                  {trait}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span>Confidence Level</span>
              <span className="font-semibold">{result.confidence}%</span>
            </div>
            <Progress value={result.confidence} className="h-2" />
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Why This Character Matches You
            </h4>
            <p className="text-sm leading-relaxed">{result.reasoning}</p>
          </div>

          <div className="flex gap-3">
            <Button onClick={resetAnalysis} variant="outline" className="flex-1">
              <RefreshCw className="h-4 w-4 mr-2" />
              Analyze Again
            </Button>
            <Button className="flex-1">
              Share Result
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle>Ready to Analyze Your Character?</CardTitle>
        <CardDescription>
          We'll analyze your {casts.length} Farcaster casts to find your sitcom match
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={analyzeCasts} 
          disabled={isAnalyzing} 
          className="w-full"
          size="lg"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Analyzing Your Character...
            </>
          ) : (
            "Analyze My Character"
          )}
        </Button>
        
        {error && (
          <p className="text-sm text-red-600 mt-2 text-center">
            {error}
          </p>
        )}

        <div className="mt-4 text-center">
          <Badge variant="outline">
            {casts.length} casts loaded
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
