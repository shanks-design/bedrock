import { NextResponse } from 'next/server'
import { NeynarAPIClient, Configuration } from '@neynar/nodejs-sdk'

export async function GET() {
  try {
    console.log('=== Testing Neynar API Methods ===')
    
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
    
    // Get all available methods on the client
    const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(neynarClient))
      .filter(name => name !== 'constructor' && typeof (neynarClient as any)[name] === 'function')
    
    // Get all properties that might be API methods
    const properties = Object.getOwnPropertyNames(neynarClient)
    
    // Try to find user-related methods
    const userMethods = methods.filter(name => 
      name.toLowerCase().includes('user') || 
      name.toLowerCase().includes('profile') || 
      name.toLowerCase().includes('cast')
    )
    
    // Try to find fetch-related methods
    const fetchMethods = methods.filter(name => 
      name.toLowerCase().includes('fetch')
    )
    
    return NextResponse.json({
      success: true,
      message: 'Neynar client methods discovered',
      totalMethods: methods.length,
      allMethods: methods,
      userRelatedMethods: userMethods,
      fetchMethods: fetchMethods,
      allProperties: properties,
      clientType: typeof neynarClient,
      clientConstructor: neynarClient.constructor.name
    })
    
  } catch (error) {
    console.error('❌ Test methods error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to discover methods',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
