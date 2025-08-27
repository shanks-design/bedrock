import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@farcaster/quick-auth'
import { NeynarAPIClient, Configuration } from '@neynar/nodejs-sdk'

const client = createClient()

export async function GET(request: NextRequest) {
  try {
    // Debug: Log environment variables (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.log('Environment check:')
      console.log('- NODE_ENV:', process.env.NODE_ENV)
      console.log('- NEYNAR_API_KEY exists:', !!process.env.NEYNAR_API_KEY)
      console.log('- NEYNAR_API_KEY length:', process.env.NEYNAR_API_KEY?.length || 0)
      console.log('- All env vars:', Object.keys(process.env).filter(key => key.includes('NEY')))
    }

    // Get the Authorization header
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      )
    }

    const token = authHeader.split(' ')[1]

    // Verify the JWT token
    let payload
    try {
      payload = await client.verifyJwt({
        token,
        domain: request.headers.get('host') || 'localhost:3000',
      })
    } catch (error) {
      console.error('JWT verification failed:', error)
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    const fid = payload.sub

    // Check if Neynar API key is configured
    if (!process.env.NEYNAR_API_KEY) {
      console.error('Neynar API key not found in environment variables')
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
        limit: 50, // Get recent casts for analysis
      })

      // Fetch user reactions (if available)
      let reactions = []
      try {
        const reactionsResponse = await neynarClient.getUserReactions({
          fid: fid,
          limit: 50,
        })
        reactions = reactionsResponse.reactions || []
      } catch (reactionsError) {
        console.log('Could not fetch reactions:', reactionsError)
        // Reactions are optional, continue without them
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
    console.error('Error in /api/farcaster/me:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
