import { type NextRequest, NextResponse } from "next/server"
import { NeynarAPIClient } from "@neynar/nodejs-sdk"

const neynarClient = new NeynarAPIClient(process.env.NEYNAR_API_KEY || "")

export async function POST(request: NextRequest) {
  try {
    const { signerUuid, fid } = await request.json()

    if (!signerUuid || !fid) {
      return NextResponse.json({ error: "Signer UUID and FID are required" }, { status: 400 })
    }

    // Get user's profile information from Neynar
    const userInfo = await neynarClient.lookupUserByFid(Number(fid))
    
    if (!userInfo.result?.user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const user = userInfo.result.user

    // Get user's recent casts
    const casts = await neynarClient.getUserCasts(Number(fid), { limit: 50 })
    
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
  } catch (error) {
    console.error("Farcaster connection error:", error)
    return NextResponse.json({ error: "Failed to connect to Farcaster" }, { status: 500 })
  }
}
