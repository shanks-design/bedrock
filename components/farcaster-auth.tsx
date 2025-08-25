"use client"

import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Badge } from "./ui/badge"
import { Loader2, LogOut, User, Wallet } from "lucide-react"

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
  const [isWalletConnecting, setIsWalletConnecting] = useState(false)

  const connectFarcaster = async () => {
    setIsConnecting(true)
    setError(null)

    try {
      // Check if user has a Farcaster wallet (like Warpcast, Neynar, etc.)
      if (typeof window !== 'undefined' && window.ethereum) {
        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
        
        if (accounts.length > 0) {
          // User has connected their wallet
          await connectToFarcaster(accounts[0])
        } else {
          throw new Error("No wallet accounts found")
        }
      } else {
        // Fallback: try to connect using Farcaster Auth Kit
        await connectWithAuthKit()
      }
    } catch (err) {
      console.error("Farcaster connection error:", err)
      setError("Failed to connect to Farcaster. Please make sure you have a Farcaster wallet installed.")
    } finally {
      setIsConnecting(false)
    }
  }

  const connectToFarcaster = async (account: string) => {
    setIsWalletConnecting(true)
    
    try {
      // For now, we'll simulate the Farcaster connection
      // In a real implementation, you would use the Farcaster Auth Kit here
      // to get the user's FID and signer information
      
      // Simulate API call to your backend
      const response = await fetch("/api/farcaster/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          walletAddress: account,
          // In real implementation, you'd also send:
          // - signerUuid from Farcaster Auth Kit
          // - user's FID
          // - signature for verification
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to connect to Farcaster")
      }

      const data = await response.json()
      
      if (data.success) {
        setProfile(data.profile)
        setCasts(data.casts || [])
        onProfileLoaded(data.profile, data.casts || [])
      } else {
        throw new Error(data.error || "Connection failed")
      }
    } catch (err) {
      setError("Failed to authenticate with Farcaster. Please try again.")
      console.error("Authentication error:", err)
    } finally {
      setIsWalletConnecting(false)
    }
  }

  const connectWithAuthKit = async () => {
    // This would implement the actual Farcaster Auth Kit flow
    // For now, we'll show a message about installing a wallet
    setError("Please install a Farcaster wallet (like Warpcast) to connect your account.")
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
          Connect your Farcaster wallet to analyze your casts and discover which sitcom character you are!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={connectFarcaster} 
          disabled={isConnecting || isWalletConnecting} 
          className="w-full"
          size="lg"
        >
          {isConnecting || isWalletConnecting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {isWalletConnecting ? "Connecting Wallet..." : "Connecting..."}
            </>
          ) : (
            <>
              <Wallet className="h-4 w-4 mr-2" />
              Connect Farcaster Wallet
            </>
          )}
        </Button>
        
        {error && (
          <p className="text-sm text-red-600 mt-2 text-center">
            {error}
          </p>
        )}

        <div className="text-xs text-muted-foreground text-center">
          <p>You'll need a Farcaster wallet like Warpcast to connect</p>
        </div>
      </CardContent>
    </Card>
  )
}
