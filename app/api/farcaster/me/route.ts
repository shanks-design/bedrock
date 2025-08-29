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
      console.log('✅ JWT verification successful')
      console.log('JWT payload type:', typeof payload)
      console.log('JWT payload keys:', Object.keys(payload))
      console.log('JWT payload:', JSON.stringify(payload, null, 2))
      console.log('JWT subject (FID):', payload.sub)
      console.log('JWT issuer:', payload.iss)
      console.log('JWT audience:', payload.aud)
      console.log('JWT payload structure analysis:', {
        hasSub: !!payload.sub,
        subType: typeof payload.sub,
        subValue: payload.sub,
        hasFid: !!(payload as any).fid,
        fidType: typeof (payload as any).fid,
        fidValue: (payload as any).fid,
        hasUserId: !!(payload as any).user_id,
        userIdType: typeof (payload as any).user_id,
        userIdValue: (payload as any).user_id,
        hasUserIdCamel: !!(payload as any).userId,
        userIdCamelType: typeof (payload as any).userId,
        userIdCamelValue: (payload as any).userId
      })
    } catch (error) {
      console.error('❌ JWT verification failed:', error)
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Extract FID from JWT payload - handle different possible structures
    let fid: string | number | undefined
    
    console.log('🔍 Extracting FID from JWT payload...')
    console.log('Available payload fields:', Object.keys(payload))
    
    // Try different possible FID fields
    if (payload.sub) {
      fid = payload.sub
      console.log('✅ Found FID in payload.sub:', fid)
    } else if ((payload as any).fid) {
      fid = (payload as any).fid
      console.log('✅ Found FID in payload.fid:', fid)
    } else if ((payload as any).user_id) {
      fid = (payload as any).user_id
      console.log('✅ Found FID in payload.user_id:', fid)
    } else if ((payload as any).userId) {
      fid = (payload as any).userId
      console.log('✅ Found FID in payload.userId:', fid)
    } else {
      console.log('⚠️ No FID found in any expected field')
    }
    
    console.log('Processing FID from JWT:', fid)
    console.log('JWT payload structure:', {
      hasSub: !!payload.sub,
      hasFid: !!(payload as any).fid,
      hasUserId: !!(payload as any).user_id,
      hasUserIdCamel: !!(payload as any).userId,
      sub: payload.sub,
      fid: (payload as any).fid,
      user_id: (payload as any).user_id,
      userId: (payload as any).userId
    })
    
    // Validate FID format
    if (!fid) {
      console.error('❌ No FID found in JWT payload')
      console.error('Available payload fields:', Object.keys(payload))
      console.error('Payload values:', {
        sub: payload.sub,
        fid: (payload as any).fid,
        user_id: (payload as any).user_id,
        userId: (payload as any).userId
      })
      return NextResponse.json(
        { error: 'No FID found in authentication token' },
        { status: 400 }
      )
    }
    
    console.log('🔍 Validating FID format...')
    console.log('FID type:', typeof fid)
    console.log('FID value:', fid)
    console.log('FID as number:', Number(fid))
    console.log('Is NaN:', isNaN(Number(fid)))
    
    if (isNaN(Number(fid))) {
      console.error('❌ Invalid FID format from JWT:', fid)
      console.error('FID type:', typeof fid)
      console.error('FID value:', fid)
      return NextResponse.json(
        { error: 'Invalid FID format in authentication token' },
        { status: 400 }
      )
    }
    
    // Convert fid to number for consistency
    const numericFid = Number(fid)
    console.log('✅ Using numeric FID:', numericFid)
    
    // Additional validation: ensure FID is reasonable
    if (numericFid <= 0 || numericFid > 999999999) {
      console.error('❌ FID value seems unreasonable:', numericFid)
      return NextResponse.json(
        { error: 'FID value in authentication token seems invalid' },
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
      console.log('Fetching user profile for FID:', numericFid)
      const profileResponse = await neynarClient.fetchBulkUsers({
        fids: [numericFid],
      })
      
      console.log('✅ Profile response received')
      console.log('Profile response type:', typeof profileResponse)
      console.log('Profile response keys:', Object.keys(profileResponse))
      console.log('Profile response users:', profileResponse.users)
      console.log('Profile response users type:', typeof profileResponse.users)
      console.log('Profile response users length:', profileResponse.users?.length)
      console.log('First user exists:', !!profileResponse.users?.[0])
      
      // CRITICAL: Check if profileResponse.users exists and has data
      if (!profileResponse.users) {
        console.error('❌ CRITICAL: profileResponse.users is undefined')
        console.error('Profile response structure:', JSON.stringify(profileResponse, null, 2))
        throw new Error('Profile response missing users array')
      }
      
      if (profileResponse.users.length === 0) {
        console.error('❌ CRITICAL: profileResponse.users array is empty')
        console.error('This usually means the FID is invalid or the user does not exist')
        throw new Error(`No user found for FID: ${numericFid}. This FID may be invalid or the user may not exist.`)
      }
      
      if (profileResponse.users?.[0]) {
        console.log('✅ First user found:', {
          username: profileResponse.users[0].username,
          displayName: profileResponse.users[0].display_name,
          fid: profileResponse.users[0].fid
        })
      } else {
        console.log('⚠️ No first user found in response')
      }

      // Fetch user casts using the correct method
      console.log('Fetching user casts...')
      const castsResponse = await neynarClient.fetchCastsForUser({
        fid: numericFid,
        limit: 50, // Get recent casts for analysis
      })
      console.log('✅ Casts response received:', JSON.stringify(castsResponse, null, 2))
      console.log('✅ Casts array:', castsResponse.casts)
      console.log('✅ Casts fetched:', castsResponse.casts?.length || 0, 'casts')

      // Validate casts response
      if (!castsResponse.casts) {
        console.log('⚠️ No casts array in response, using empty array')
      }

      // Fetch user reactions (if available)
      let reactions: any[] = []
      try {
        console.log('Fetching user reactions...')
        const reactionsResponse = await neynarClient.fetchUserReactions({
          fid: numericFid,
          type: 'likes', // Specify reaction type
          limit: 50,
        })
        reactions = reactionsResponse.reactions || []
        console.log('✅ Reactions fetched:', reactions.length, 'reactions')
      } catch (reactionsError) {
        console.log('⚠️ Could not fetch reactions:', reactionsError)
        // Reactions are optional, continue without them
      }

      // Validate that we have user data before proceeding
      console.log('🔍 Validating profile response...')
      console.log('Profile response users exists:', !!profileResponse.users)
      console.log('Profile response users length:', profileResponse.users?.length || 0)
      
      if (!profileResponse.users || profileResponse.users.length === 0) {
        console.error('❌ No users found in profile response')
        console.error('Profile response structure:', JSON.stringify(profileResponse, null, 2))
        throw new Error('No user profile data received from Neynar API')
      }

      console.log('🔍 Accessing first user...')
      const user = profileResponse.users[0]
      console.log('🔍 First user object:', user)
      console.log('🔍 First user type:', typeof user)
      console.log('🔍 First user keys:', user ? Object.keys(user) : 'undefined')
      
      if (!user) {
        console.error('❌ First user is undefined')
        throw new Error('First user object is undefined')
      }

      console.log('✅ User data extracted:', {
        username: user.username,
        displayName: user.display_name,
        fid: user.fid
      })

      const userData = {
        fid: numericFid,
        profile: {
          username: user.username,
          displayName: user.display_name,
          pfpUrl: user.pfp_url,
          bio: user.profile?.bio?.text,
          followerCount: user.follower_count,
          followingCount: user.following_count,
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
