import { NextResponse } from 'next/server'
import { NeynarAPIClient, Configuration } from '@neynar/nodejs-sdk'

export async function GET() {
  try {
    console.log('=== Testing Neynar API Integration ===')
    
    // Check if API key exists
    if (!process.env.NEYNAR_API_KEY) {
      console.log('❌ NEYNAR_API_KEY not found')
      return NextResponse.json({
        success: false,
        error: 'NEYNAR_API_KEY not configured',
        envCheck: {
          exists: false,
          length: 0
        }
      })
    }

    console.log('✅ NEYNAR_API_KEY found, length:', process.env.NEYNAR_API_KEY.length)
    
    // Test creating the client
    try {
      const config = new Configuration({
        apiKey: process.env.NEYNAR_API_KEY,
      })
      console.log('✅ Configuration created')
      
      const neynarClient = new NeynarAPIClient(config)
      console.log('✅ NeynarAPIClient created')
      
      // Test a simple API call - get user profile for a known FID
      // Using FID 1 (Dwr) as a test case
      console.log('Testing API call to get user profile...')
      const profileResponse = await neynarClient.getUserProfile({
        fid: 1,
      })
      
      console.log('✅ API call successful')
      console.log('User data:', {
        fid: profileResponse.user.fid,
        username: profileResponse.user.username,
        displayName: profileResponse.user.displayName
      })
      
      return NextResponse.json({
        success: true,
        message: 'Neynar API integration working correctly',
        testUser: {
          fid: profileResponse.user.fid,
          username: profileResponse.user.username,
          displayName: profileResponse.user.displayName
        },
        envCheck: {
          exists: true,
          length: process.env.NEYNAR_API_KEY.length,
          preview: process.env.NEYNAR_API_KEY.substring(0, 8) + '...'
        }
      })
      
    } catch (apiError) {
      console.error('❌ Neynar API error:', apiError)
      return NextResponse.json({
        success: false,
        error: 'Neynar API call failed',
        details: apiError instanceof Error ? apiError.message : 'Unknown error',
        envCheck: {
          exists: true,
          length: process.env.NEYNAR_API_KEY.length,
          preview: process.env.NEYNAR_API_KEY.substring(0, 8) + '...'
        }
      })
    }
    
  } catch (error) {
    console.error('❌ Test endpoint error:', error)
    return NextResponse.json({
      success: false,
      error: 'Test endpoint failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
