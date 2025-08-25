import { type NextRequest, NextResponse } from "next/server"
import { NeynarAPIClient } from "@neynar/nodejs-sdk"

const neynarClient = new NeynarAPIClient(process.env.NEYNAR_API_KEY || "")

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, signerUuid, fid } = await request.json()

    if (!walletAddress) {
      return NextResponse.json({ error: "Wallet address is required" }, { status: 400 })
    }

    // If we have a Neynar API key, try to fetch real data
    if (process.env.NEYNAR_API_KEY) {
      try {
        // Try to get user info by wallet address
        // Note: This is a simplified approach - in production you'd use proper Farcaster Auth Kit
        
        // For now, we'll use mock data but structure it for real implementation
        // In a real app, you would:
        // 1. Use the wallet address to get the user's FID
        // 2. Use the FID to fetch profile and casts from Neynar
        
        const mockProfile = {
          fid: Math.floor(Math.random() * 100000) + 1000,
          username: `user_${walletAddress.slice(2, 8)}`,
          displayName: "Farcaster User",
          pfpUrl: "/abstract-profile.png",
          bio: "Building the future of social media on Farcaster",
          followerCount: Math.floor(Math.random() * 100) + 10,
          followingCount: Math.floor(Math.random() * 50) + 5
        }

        const mockCasts = [
          {
            text: "Just shipped a new feature! The debugging process was intense but worth it 🚀",
            timestamp: Date.now() - 3600000,
            hash: `0x${Math.random().toString(16).slice(2, 10)}`
          },
          {
            text: "Coffee is basically a programming language at this point",
            timestamp: Date.now() - 7200000,
            hash: `0x${Math.random().toString(16).slice(2, 10)}`
          },
          {
            text: "Anyone else think meetings could have been an email?",
            timestamp: Date.now() - 10800000,
            hash: `0x${Math.random().toString(16).slice(2, 10)}`
          },
          {
            text: "Working late again, but the code is finally clean",
            timestamp: Date.now() - 14400000,
            hash: `0x${Math.random().toString(16).slice(2, 10)}`
          },
          {
            text: "That feeling when your tests pass on the first try ✨",
            timestamp: Date.now() - 18000000,
            hash: `0x${Math.random().toString(16).slice(2, 10)}`
          }
        ]

        return NextResponse.json({
          success: true,
          profile: mockProfile,
          casts: mockCasts,
          message: "Connected with wallet (using mock data for now)"
        })
      } catch (neynarError) {
        console.error("Neynar API error:", neynarError)
        // Fall back to mock data if Neynar fails
      }
    }

    // Fallback: Return mock data for development/testing
    const mockProfile = {
      fid: Math.floor(Math.random() * 100000) + 1000,
      username: `user_${walletAddress.slice(2, 8)}`,
      displayName: "Farcaster User",
      pfpUrl: "/abstract-profile.png",
      bio: "Building the future of social media on Farcaster",
      followerCount: Math.floor(Math.random() * 100) + 10,
      followingCount: Math.floor(Math.random() * 50) + 5
    }

    const mockCasts = [
      {
        text: "Just shipped a new feature! The debugging process was intense but worth it 🚀",
        timestamp: Date.now() - 3600000,
        hash: `0x${Math.random().toString(16).slice(2, 10)}`
      },
      {
        text: "Coffee is basically a programming language at this point",
        timestamp: Date.now() - 7200000,
        hash: `0x${Math.random().toString(16).slice(2, 10)}`
      },
      {
        text: "Anyone else think meetings could have been an email?",
        timestamp: Date.now() - 10800000,
        hash: `0x${Math.random().toString(16).slice(2, 10)}`
      },
      {
        text: "Working late again, but the code is finally clean",
        timestamp: Date.now() - 14400000,
        hash: `0x${Math.random().toString(16).slice(2, 10)}`
      },
      {
        text: "That feeling when your tests pass on the first try ✨",
        timestamp: Date.now() - 18000000,
        hash: `0x${Math.random().toString(16).slice(2, 10)}`
      }
    ]

    return NextResponse.json({
      success: true,
      profile: mockProfile,
      casts: mockCasts,
      message: "Connected with wallet (development mode)"
    })

  } catch (error) {
    console.error("Farcaster connection error:", error)
    return NextResponse.json({ error: "Failed to connect to Farcaster" }, { status: 500 })
  }
}
