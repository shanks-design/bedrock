import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@farcaster/quick-auth'
import { NeynarAPIClient, Configuration } from '@neynar/nodejs-sdk'

const client = createClient()

export async function GET(request: NextRequest) {
  try {
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

    // Try to fetch real data from Neynar if API key is configured
    if (process.env.NEYNAR_API_KEY) {
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
          neynarStatus: 'Real data from Neynar API',
        }

        return NextResponse.json(userData)
      } catch (neynarError) {
        console.error('Neynar API error:', neynarError)
        // Fall back to mock data if Neynar fails
      }
    }

    // Fallback to mock data if Neynar is not configured or fails
    const mockData = {
      fid: fid,
      profile: {
        username: 'farcaster_user',
        displayName: 'Farcaster User',
        pfpUrl: '/placeholder-user.jpg',
        bio: 'Farcaster enthusiast and sitcom lover!',
        followerCount: 42,
        followingCount: 38,
      },
      casts: [
        {
          text: "Just finished watching The Office for the 10th time. Michael Scott is absolutely hilarious! 😂",
          timestamp: Date.now() - 86400000, // 1 day ago
          hash: "mock_cast_1",
          reactions: { likes: 15, recasts: 3 },
          replies: 2,
        },
        {
          text: "Friends reunion was everything I hoped for. The chemistry is still there after all these years! 💕",
          timestamp: Date.now() - 172800000, // 2 days ago
          hash: "mock_cast_2",
          reactions: { likes: 23, recasts: 5 },
          replies: 4,
        },
        {
          text: "Big Bang Theory marathon weekend! Sheldon's quirks never get old. Bazinga! 🧠",
          timestamp: Date.now() - 259200000, // 3 days ago
          hash: "mock_cast_3",
          reactions: { likes: 18, recasts: 2 },
          replies: 1,
        },
        {
          text: "Silicon Valley is pure gold. The tech humor is spot on! 💻",
          timestamp: Date.now() - 345600000, // 4 days ago
          hash: "mock_cast_4",
          reactions: { likes: 12, recasts: 1 },
          replies: 0,
        },
        {
          text: "How I Met Your Mother - still the best sitcom ever made. Legendary! 🍺",
          timestamp: Date.now() - 432000000, // 5 days ago
          hash: "mock_cast_5",
          reactions: { likes: 31, recasts: 7 },
          replies: 6,
        },
      ],
      reactions: [
        { type: 'like', castHash: 'other_cast_1', timestamp: Date.now() - 3600000 },
        { type: 'recast', castHash: 'other_cast_2', timestamp: Date.now() - 7200000 },
        { type: 'like', castHash: 'other_cast_3', timestamp: Date.now() - 10800000 },
      ],
      neynarStatus: process.env.NEYNAR_API_KEY 
        ? 'Neynar API failed, using mock data' 
        : 'Neynar API not configured, using mock data',
    }

    return NextResponse.json(mockData)
  } catch (error) {
    console.error('Error in /api/farcaster/me:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
