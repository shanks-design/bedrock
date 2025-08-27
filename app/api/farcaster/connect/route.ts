import { NextRequest, NextResponse } from 'next/server'
import { NeynarAPIClient, Configuration } from '@neynar/nodejs-sdk'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { signerUuid, fid, walletAddress } = body

    if (!signerUuid || !fid || !walletAddress) {
      return NextResponse.json(
        { error: 'Missing required parameters: signerUuid, fid, walletAddress' },
        { status: 400 }
      )
    }

    // Check if Neynar API key is configured
    if (!process.env.NEYNAR_API_KEY) {
      return NextResponse.json(
        { error: 'Neynar API key not configured. Please contact the administrator.' },
        { status: 500 }
      )
    }

    try {
      const config = new Configuration({
        apiKey: process.env.NEYNAR_API_KEY,
      })
      const neynarClient = new NeynarAPIClient(config)

      // Fetch user profile
      const profileResponse = await neynarClient.getUserProfile({
        fid: fid,
      })

      // Fetch user casts
      const castsResponse = await neynarClient.getUserCasts({
        fid: fid,
        limit: 50,
      })

      // Fetch user reactions
      let reactions = []
      try {
        const reactionsResponse = await neynarClient.getUserReactions({
          fid: fid,
          limit: 50,
        })
        reactions = reactionsResponse.reactions || []
      } catch (reactionsError) {
        console.log('Could not fetch reactions:', reactionsError)
        // Reactions are optional
      }

      const userData = {
        fid: fid,
        profile: {
          username: profileResponse.user.username,
          displayName: profileResponse.user.displayName,
          pfpUrl: profileResponse.user.pfp?.url,
          bio: profileResponse.user.profile?.bio?.text,
          followerCount: profileResponse.user.followerCount,
          followingCount: profileResponse.user.followingCount,
        },
        casts: castsResponse.casts?.map(cast => ({
          text: cast.text,
          timestamp: new Date(cast.timestamp).getTime(),
          hash: cast.hash,
          reactions: cast.reactions,
          replies: cast.replies,
        })) || [],
        reactions: reactions.map(reaction => ({
          type: reaction.reactionType,
          castHash: reaction.castHash,
          timestamp: new Date(reaction.timestamp).getTime(),
        })),
      }

      return NextResponse.json(userData)
    } catch (neynarError) {
      console.error('Neynar API error:', neynarError)
      return NextResponse.json(
        { error: 'Failed to fetch Farcaster data. Please try again later.' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error in /api/farcaster/connect:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
