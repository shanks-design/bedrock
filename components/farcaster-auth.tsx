"use client"

import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Badge } from "./ui/badge"
import { Loader2, LogOut, User, Sparkles } from "lucide-react"
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

interface FarcasterAuthProps {
  onProfileLoaded: (profile: FarcasterProfile, casts: Cast[]) => void
}

export function FarcasterAuth({ onProfileLoaded }: FarcasterAuthProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [profile, setProfile] = useState<FarcasterProfile | null>(null)
  const [casts, setCasts] = useState<Cast[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isInFarcaster, setIsInFarcaster] = useState(false)

  useEffect(() => {
    // Check if we're running in a Farcaster client
    setIsInFarcaster(sdk.isInFarcaster)
  }, [])

  const connectFarcaster = async () => {
    setIsConnecting(true)
    setError(null)

    try {
      if (isInFarcaster) {
        // Use Quick Auth to get a session token
        const { token } = await sdk.quickAuth.getToken()
        
        if (token) {
          // Use the token to fetch user data
          await fetchUserData(token)
        } else {
          throw new Error("Failed to get authentication token")
        }
      } else {
        // Fallback for web usage - use mock data
        await connectWithMockData()
      }
    } catch (err) {
      console.error("Farcaster connection error:", err)
      setError("Failed to connect to Farcaster. Please try again.")
    } finally {
      setIsConnecting(false)
    }
  }

  const fetchUserData = async (token: string) => {
    try {
      // Use Quick Auth to make authenticated requests
      const response = await sdk.quickAuth.fetch("/api/farcaster/me")
      
      if (response.ok) {
        const data = await response.json()
        setProfile(data.profile)
        setCasts(data.casts || [])
        onProfileLoaded(data.profile, data.casts || [])
      } else {
        throw new Error("Failed to fetch user data")
      }
    } catch (err) {
      setError("Failed to fetch your Farcaster data. Please try again.")
      console.error("Data fetch error:", err)
    }
  }

  const connectWithMockData = async () => {
    // Fallback mock data for web usage
    const mockProfile: FarcasterProfile = {
      fid: 12345,
      username: "demo_user",
      displayName: "Demo User",
      pfpUrl: "/abstract-profile.png",
      bio: "Building the future of social media on Farcaster",
      followerCount: 42,
      followingCount: 38
    }

    const mockCasts: Cast[] = [
      {
        text: "Just shipped a new feature! The debugging process was intense but worth it 🚀",
        timestamp: Date.now() - 3600000,
        hash: "0x123..."
      },
      {
        text: "Coffee is basically a programming language at this point",
        timestamp: Date.now() - 7200000,
        hash: "0x456..."
      },
      {
        text: "Anyone else think meetings could have been an email?",
        timestamp: Date.now() - 10800000,
        hash: "0x789..."
      }
    ]

    setProfile(mockProfile)
    setCasts(mockCasts)
    onProfileLoaded(mockProfile, mockCasts)
  }

  const disconnect = () => {
    setProfile(null)
    setCasts([])
    setError(null)
  }

  if (profile) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <User className="h-5 w-5" />
            Connected to Farcaster
          </CardTitle>
          <CardDescription>
            Your profile has been loaded successfully
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile.pfpUrl} alt={profile.displayName} />
              <AvatarFallback>{profile.displayName[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{profile.displayName}</h3>
              <p className="text-sm text-muted-foreground">@{profile.username}</p>
              <p className="text-sm text-muted-foreground">FID: {profile.fid}</p>
            </div>
          </div>
          
          {profile.bio && (
            <p className="text-sm text-center p-3 bg-muted rounded-lg">
              {profile.bio}
            </p>
          )}

          <div className="flex justify-center gap-4 text-sm">
            <div className="text-center">
              <div className="font-semibold">{profile.followerCount}</div>
              <div className="text-muted-foreground">Followers</div>
            </div>
            <div className="text-center">
              <div className="font-semibold">{profile.followingCount}</div>
              <div className="text-muted-foreground">Following</div>
            </div>
          </div>

          <div className="text-center">
            <Badge variant="secondary" className="mb-2">
              {casts.length} casts loaded
            </Badge>
          </div>

          <Button 
            onClick={disconnect} 
            variant="outline" 
            className="w-full"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Disconnect
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle>Connect Your Farcaster Account</CardTitle>
        <CardDescription>
          {isInFarcaster 
            ? "Sign in with Farcaster to analyze your casts and discover which sitcom character you are!"
            : "Connect your Farcaster account to analyze your casts and discover which sitcom character you are!"
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={connectFarcaster} 
          disabled={isConnecting} 
          className="w-full"
          size="lg"
        >
          {isConnecting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              {isInFarcaster ? "Sign In with Farcaster" : "Connect Farcaster"}
            </>
          )}
        </Button>
        
        {error && (
          <p className="text-sm text-red-600 mt-2 text-center">
            {error}
          </p>
        )}

        {!isInFarcaster && (
          <div className="text-xs text-muted-foreground text-center">
            <p>For the best experience, open this app in a Farcaster client like Warpcast</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
