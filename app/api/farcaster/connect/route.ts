import { NextRequest, NextResponse } from 'next/server'
import { NeynarAPIClient, Configuration } from '@neynar/nodejs-sdk'

export async function POST(request: NextRequest) {
  try {
    console.log('=== /api/farcaster/connect called ===')
    
    const body = await request.json()
    const { signerUuid, fid, walletAddress } = body
    console.log('Request body:', { signerUuid: !!signerUuid, fid, walletAddress: !!walletAddress })

    if (!signerUuid || !fid || !walletAddress) {
      console.log('❌ Missing required parameters')
      return NextResponse.json(
        { error: 'Missing required parameters: signerUuid, fid, walletAddress' },
        { status: 400 }
      )
    }

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

      // Fetch user profile using the correct method
      console.log('Fetching user profile for FID:', fid)
      const profileResponse = await neynarClient.fetchBulkUsers({
        fids: [fid],
      })
      console.log('✅ Profile response received, users count:', profileResponse.users?.length || 0)
      console.log('✅ First user:', profileResponse.users?.[0]?.username)

      // Fetch user casts using the correct method
      console.log('Fetching user casts...')
      const castsResponse = await neynarClient.fetchCastsForUser({
        fid: fid,
        limit: 50,
      })
      console.log('✅ Casts response received, casts count:', castsResponse.casts?.length || 0)

      // Fetch user reactions using the correct method
      let reactions = []
      try {
        console.log('Fetching user reactions...')
        const reactionsResponse = await neynarClient.fetchUserReactions({
          fid: fid,
          type: 'likes', // Specify reaction type
          limit: 50,
        })
        reactions = reactionsResponse.reactions || []
        console.log('✅ Reactions fetched:', reactions.length, 'reactions')
      } catch (reactionsError) {
        console.log('⚠️ Could not fetch reactions:', reactionsError)
        // Reactions are optional
      }

      const userData = {
        fid: fid,
        profile: {
          username: profileResponse.users[0].username,
          displayName: profileResponse.users[0].display_name,
          pfpUrl: profileResponse.users[0].pfp_url,
          bio: profileResponse.users[0].profile?.bio?.text,
          followerCount: profileResponse.users[0].follower_count,
          followingCount: profileResponse.users[0].following_count,
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
    console.error('Error in /api/farcaster/connect:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
