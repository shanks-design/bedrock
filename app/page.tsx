'use client'

import { useEffect, useState } from 'react'
import FarcasterAuth from '@/components/farcaster-auth'
import CharacterAnalysis from '@/components/character-analysis'

interface UserData {
  fid: number
  profile?: any
  casts?: any[]
  reactions?: any[]
}

export default function Home() {
  const [isInFarcaster, setIsInFarcaster] = useState(false)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [sdkAvailable, setSdkAvailable] = useState(false)
  const [debugInfo, setDebugInfo] = useState<any>({})

  // Enhanced Farcaster client detection
  const detectFarcasterClient = () => {
    const indicators = {
      // Check if we're in a Farcaster client via SDK
      sdkDetection: false,
      // Check URL patterns that suggest Farcaster client
      urlPattern: false,
      // Check user agent for Farcaster clients
      userAgent: false,
      // Check for Farcaster-specific environment variables or globals
      environment: false,
      // Check if we're in an iframe (common for Mini Apps)
      iframe: false,
    }

    try {
      // Check if we're in an iframe
      indicators.iframe = window !== window.top
      
      // Check URL patterns
      const url = window.location.href
      indicators.urlPattern = url.includes('farcaster') || 
                             url.includes('warpcast') || 
                             url.includes('base') ||
                             url.includes('miniapp') ||
                             url.includes('preview')
      
      // Check user agent
      const userAgent = navigator.userAgent.toLowerCase()
      indicators.userAgent = userAgent.includes('farcaster') || 
                            userAgent.includes('warpcast') ||
                            userAgent.includes('base')
      
      // Check for Farcaster-specific environment
      indicators.environment = !!(window as any).farcaster || 
                              !!(window as any).warpcast ||
                              !!(window as any).baseApp

      return indicators
    } catch (error) {
      console.log('Error in client detection:', error)
      return indicators
    }
  }

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check if we're in a browser environment
        if (typeof window === 'undefined') {
          setIsInFarcaster(false)
          setLoading(false)
          return
        }

        // Enhanced client detection
        const clientIndicators = detectFarcasterClient()
        console.log('Client detection indicators:', clientIndicators)
        
        setDebugInfo((prev: any) => ({
          ...prev,
          clientIndicators,
          userAgent: navigator.userAgent,
          url: window.location.href,
          isIframe: window !== window.top
        }))

        // Check if the Mini App SDK is available
        let sdk: any = null
        try {
          const { sdk: sdkModule } = await import('@farcaster/miniapp-sdk')
          sdk = sdkModule
          setSdkAvailable(true)
          
          // Add debug info
          setDebugInfo((prev: any) => ({
            ...prev,
            sdkLoaded: true,
            sdkVersion: 'loaded'
          }))
        } catch (sdkError) {
          console.log('Mini App SDK not available:', sdkError)
          setSdkAvailable(false)
          setDebugInfo((prev: any) => ({
            ...prev,
            sdkLoaded: false,
            sdkError: sdkError instanceof Error ? sdkError.message : 'Unknown error'
          }))
        }

        // Determine if we're in a Farcaster client
        let inFarcaster = false
        
        // Use enhanced detection since SDK.isInFarcaster() method doesn't exist
        const indicators = clientIndicators
        // Consider it a Farcaster client if multiple indicators are true
        const positiveIndicators = Object.values(indicators).filter(Boolean).length
        inFarcaster = positiveIndicators >= 2 || indicators.urlPattern || indicators.iframe
        
        console.log('Enhanced detection result:', inFarcaster, 'Positive indicators:', positiveIndicators)

        setIsInFarcaster(inFarcaster)
        
        setDebugInfo((prev: any) => ({
          ...prev,
          isInFarcaster: inFarcaster,
          detectionMethod: 'Enhanced Detection'
        }))

        if (inFarcaster) {
          console.log('Running in Farcaster client, initializing SDK...')
          
          if (sdk) {
            // Initialize the Mini App SDK
            try {
              await sdk.actions.ready()
              console.log('SDK ready() completed successfully')
              
              setDebugInfo((prev: any) => ({
                ...prev,
                sdkReady: true
              }))
            } catch (readyError) {
              console.error('SDK ready() failed:', readyError)
              setDebugInfo((prev: any) => ({
                ...prev,
                sdkReady: false,
                readyError: readyError instanceof Error ? readyError.message : 'Unknown error'
              }))
            }
            
            // Try to get authenticated user data
            try {
              console.log('Attempting to fetch user data...')
              const response = await sdk.quickAuth.fetch('/api/farcaster/me')
              console.log('Quick Auth response:', response.status, response.statusText)
              
              if (response.ok) {
                const data = await response.json()
                console.log('User data received:', data)
                setUserData(data)
              } else {
                const errorData = await response.json().catch(() => ({}))
                console.log('Quick Auth failed:', response.status, errorData)
                setDebugInfo((prev: any) => ({
                  ...prev,
                  quickAuthError: {
                    status: response.status,
                    statusText: response.statusText,
                    error: errorData
                  }
                }))
              }
            } catch (authError) {
              console.error('Quick Auth error:', authError)
              setDebugInfo((prev: any) => ({
                ...prev,
                quickAuthError: authError instanceof Error ? authError.message : 'Unknown error'
              }))
            }
          }
        } else {
          console.log('Not running in Farcaster client')
        }
      } catch (err) {
        console.error('App initialization error:', err)
        setIsInFarcaster(false)
        setDebugInfo((prev: any) => ({
          ...prev,
          appInitError: err instanceof Error ? err.message : 'Unknown error'
        }))
      } finally {
        setLoading(false)
      }
    }

    initializeApp()
  }, [])

  const handleUserConnected = (data: UserData) => {
    setUserData(data)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-xl">Initializing...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Farcaster Sitcom Matcher
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Connect your Farcaster account and discover which sitcom character you're most like based on your real social data!
          </p>
          {isInFarcaster && (
            <div className="mt-4 inline-block bg-green-500 text-white px-4 py-2 rounded-full text-sm">
              ✓ Running as Farcaster Mini App
            </div>
          )}
          {!isInFarcaster && sdkAvailable && (
            <div className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded-full text-sm">
              🌐 Open in Farcaster Client for Full Experience
            </div>
          )}
          {!sdkAvailable && (
            <div className="mt-4 inline-block bg-yellow-500 text-white px-4 py-2 rounded-full text-sm">
              ⚠️ Mini App SDK Unavailable
            </div>
          )}
        </div>

        {!userData ? (
          <FarcasterAuth 
            isInFarcaster={isInFarcaster}
            onUserConnected={handleUserConnected}
            debugInfo={debugInfo}
          />
        ) : (
          <CharacterAnalysis 
            userData={userData}
            onReanalyze={() => setUserData(null)}
          />
        )}

        {/* Debug Information */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 max-w-4xl mx-auto">
            <details className="bg-black/20 backdrop-blur-sm border border-white/20 rounded-xl p-4">
              <summary className="text-white font-semibold cursor-pointer mb-2">
                🔍 Debug Information (Development Only)
              </summary>
              <pre className="text-xs text-gray-300 overflow-auto max-h-64">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </details>
          </div>
        )}

        {/* App Information */}
        {!isInFarcaster && (
          <div className="mt-12 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-8">
              <h3 className="text-2xl font-semibold text-white mb-4 text-center">
                🎭 Real Farcaster Data Analysis
              </h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-lg font-semibold text-blue-300 mb-3">What This App Does</h4>
                  <ul className="text-gray-300 text-sm space-y-2">
                    <li>• <strong>Authenticates</strong> with your Farcaster wallet</li>
                    <li>• <strong>Fetches</strong> your real profile, casts, and reactions</li>
                    <li>• <strong>Analyzes</strong> your social data using AI</li>
                    <li>• <strong>Matches</strong> you with sitcom characters</li>
                    <li>• <strong>Provides</strong> detailed reasoning for matches</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-green-300 mb-3">How to Use</h4>
                  <ul className="text-gray-300 text-sm space-y-2">
                    <li>1. <strong>Open in Farcaster Client</strong> (Warpcast, Base App)</li>
                    <li>2. <strong>Find the App</strong> via cast or search</li>
                    <li>3. <strong>Sign In</strong> with your Farcaster wallet</li>
                    <li>4. <strong>Get Analysis</strong> based on real data</li>
                    <li>5. <strong>Share Results</strong> back to Farcaster</li>
                  </ul>
                </div>
              </div>
              <div className="mt-6 p-4 bg-purple-500/20 border border-purple-500/50 rounded-lg">
                <p className="text-purple-200 text-sm text-center">
                  <strong>Privacy First:</strong> Your data is only used for character analysis and is never stored permanently. 
                  The app connects directly to Farcaster via secure authentication.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
