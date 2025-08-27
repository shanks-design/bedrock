import { NextResponse } from 'next/server'

export async function GET() {
  const envCheck = {
    nodeEnv: process.env.NODE_ENV,
    neynarApiKeyExists: !!process.env.NEYNAR_API_KEY,
    neynarApiKeyLength: process.env.NEYNAR_API_KEY?.length || 0,
    groqApiKeyExists: !!process.env.GROQ_API_KEY,
    groqApiKeyLength: process.env.GROQ_API_KEY?.length || 0,
    allEnvVars: Object.keys(process.env).filter(key => 
      key.includes('NEY') || key.includes('GROQ') || key.includes('NODE')
    ),
    // Show first few characters of API keys for debugging (safe in development)
    neynarApiKeyPreview: process.env.NEYNAR_API_KEY ? 
      `${process.env.NEYNAR_API_KEY.substring(0, 8)}...` : 'Not set',
    groqApiKeyPreview: process.env.GROQ_API_KEY ? 
      `${process.env.GROQ_API_KEY.substring(0, 8)}...` : 'Not set',
  }

  return NextResponse.json(envCheck)
}
