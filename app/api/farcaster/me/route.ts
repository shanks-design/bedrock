import { type NextRequest, NextResponse } from "next/server"
import { createClient } from '@farcaster/quick-auth'
import { NeynarAPIClient, Configuration } from "@neynar/nodejs-sdk"

const client = createClient()
const config = new Configuration({
  apiKey: process.env.NEYNAR_API_KEY || "",
  baseOptions: {
    headers: {
      "x-neynar-experimental": true,
    },
  },
})

const neynarClient = new NeynarAPIClient(config)

export async function GET(request: NextRequest) {
  try {
    // Get the authorization header
    const authorization = request.headers.get('Authorization')
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing token' }, { status: 401 })
    }

    const token = authorization.split(' ')[1]

    try {
      // Verify the JWT token
      const payload = await client.verifyJwt({
        token,
        domain: request.headers.get('host') || 'localhost:3000',
      })

      const fid = payload.sub // The FID is in the 'sub' field

      // If we have a Neynar API key, try to fetch real data
      if (process.env.NEYNAR_API_KEY) {
        try {
          // Get user's profile information from Neynar
          const userInfo = await neynarClient.lookupUserByFid(fid)
          
          if (userInfo.result?.user) {
            const user = userInfo.result.user

            // Get user's recent casts
            const casts = await neynarClient.getUserCasts(fid, { limit: 50 })
            
            const recentCasts = casts.result.casts.map(cast => ({
              text: cast.text,
              timestamp: cast.timestamp,
              hash: cast.hash
            }))

            return NextResponse.json({
              success: true,
              profile: {
                fid: user.fid,
                username: user.username,
                displayName: user.displayName,
                pfpUrl: user.pfp?.url || "/abstract-profile.png",
                bio: user.profile?.bio?.text || "",
                followerCount: user.followerCount,
                followingCount: user.followingCount
              },
              casts: recentCasts
            })
          }
        } catch (neynarError) {
          console.error("Neynar API error:", neynarError)
          // Fall back to mock data if Neynar fails
        }
      }

      // Fallback: Return mock data for development/testing
      const mockProfile = {
        fid: fid,
        username: `user_${fid}`,
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
        message: "Authenticated with Farcaster (using mock data for now)"
      })

    } catch (e) {
      console.error("Token verification error:", e)
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

  } catch (error) {
    console.error("Farcaster me endpoint error:", error)
    return NextResponse.json({ error: "Failed to fetch user data" }, { status: 500 })
  }
}
