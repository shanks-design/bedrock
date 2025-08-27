import { NextResponse } from 'next/server'
import { NeynarAPIClient, Configuration } from '@neynar/nodejs-sdk'

export async function GET() {
  try {
    console.log('=== Testing Neynar API Response Structure ===')
    
    if (!process.env.NEYNAR_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'NEYNAR_API_KEY not configured'
      })
    }

    const config = new Configuration({
      apiKey: process.env.NEYNAR_API_KEY,
    })
    
    const neynarClient = new NeynarAPIClient(config)
    
    // Test fetchBulkUsers
    console.log('Testing fetchBulkUsers...')
    const profileResponse = await neynarClient.fetchBulkUsers({
      fids: [1], // Test with FID 1
    })
    
    // Test fetchCastsForUser
    console.log('Testing fetchCastsForUser...')
    const castsResponse = await neynarClient.fetchCastsForUser({
      fid: 1,
      limit: 5,
    })
    
    return NextResponse.json({
      success: true,
      message: 'API response structures',
      profileResponse: {
        type: typeof profileResponse,
        keys: Object.keys(profileResponse),
        users: profileResponse.users,
        firstUser: profileResponse.users?.[0],
        firstUserKeys: profileResponse.users?.[0] ? Object.keys(profileResponse.users[0]) : null
      },
      castsResponse: {
        type: typeof castsResponse,
        keys: Object.keys(castsResponse),
        casts: castsResponse.casts,
        firstCast: castsResponse.casts?.[0],
        firstCastKeys: castsResponse.casts?.[0] ? Object.keys(castsResponse.casts[0]) : null
      }
    })
    
  } catch (error) {
    console.error('❌ Test structure error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to test API structure',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
