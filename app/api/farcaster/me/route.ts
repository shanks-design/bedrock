import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@farcaster/quick-auth'
import { NeynarAPIClient, Configuration } from '@neynar/nodejs-sdk'

const client = createClient()

export async function GET(request: NextRequest) {
  try {
    console.log('=== /api/farcaster/me called ===')
    
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
    console.log('Auth header received:', authHeader ? 'Yes' : 'No')
    console.log('Auth header starts with Bearer:', authHeader?.startsWith('Bearer '))
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ Missing or invalid authorization header')
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      )
    }

    const token = authHeader.split(' ')[1]
    console.log('Token extracted, length:', token?.length || 0)
    console.log('Token preview:', token ? `${token.substring(0, 20)}...` : 'None')

    // Verify the JWT token
    let payload
    try {
      console.log('Attempting JWT verification...')
      payload = await client.verifyJwt({
        token,
        domain: request.headers.get('host') || 'localhost:3000',
      })
      console.log('✅ JWT verification successful, FID:', payload.sub)
    } catch (error) {
      console.error('❌ JWT verification failed:', error)
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    const fid = payload.sub
    console.log('Processing FID:', fid)

    // Check if Neynar API key is configured
    console.log('Checking Neynar API key...')
    if (!process.env.NEYNAR_API_KEY) {
      console.error('❌ Neynar API key not found in environment variables')
      return NextResponse.json(
        { error: 'Neynar API key not configured. Please contact the administrator.' },
        { status: 500 }
      )
    }
    console.log('✅ Neynar API key found')

    try {
      console.log('Creating Neynar client...')
      const config = new Configuration({
        apiKey: process.env.NEYNAR_API_KEY,
      })
      const neynarClient = new NeynarAPIClient(config)
      console.log('✅ Neynar client created')

      // Fetch user profile
      console.log('Fetching user profile for FID:', fid)
      const profileResponse = await neynarClient.getUserProfile({
        fid: fid,
      })
      console.log('✅ Profile fetched:', profileResponse.user.username)

      // Fetch user casts
      console.log('Fetching user casts...')
      const castsResponse = await neynarClient.getUserCasts({
        fid: fid,
        limit: 50, // Get recent casts for analysis
      })
      console.log('✅ Casts fetched:', castsResponse.casts?.length || 0, 'casts')

      // Fetch user reactions (if available)
      let reactions: any[] = []
      try {
        console.log('Fetching user reactions...')
        const reactionsResponse = await neynarClient.getUserReactions({
          fid: fid,
          type: 'likes', // Specify reaction type
          limit: 50,
        })
        reactions = reactionsResponse.reactions || []
        console.log('✅ Reactions fetched:', reactions.length, 'reactions')
      } catch (reactionsError) {
        console.log('⚠️ Could not fetch reactions:', reactionsError)
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

      console.log('✅ Returning user data successfully')
      return NextResponse.json(userData)
    } catch (neynarError) {
      console.error('❌ Neynar API error:', neynarError)
      console.error('Error details:', {
        name: neynarError.name,
        message: neynarError.message,
        stack: neynarError.stack,
        code: (neynarError as any).code,
        status: (neynarError as any).status,
        response: (neynarError as any).response
      })
      
      // Return more specific error information
      let errorMessage = 'Failed to fetch Farcaster data. Please try again later.'
      if (neynarError instanceof Error) {
        errorMessage = `Neynar API Error: ${neynarError.message}`
      }
      
      return NextResponse.json(
        { 
          error: errorMessage,
          details: neynarError instanceof Error ? neynarError.message : 'Unknown error',
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('❌ Error in /api/farcaster/me:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
