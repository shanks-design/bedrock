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
  const [error, setError] = useState<string | null>(null)
  const [sdkAvailable, setSdkAvailable] = useState(false)

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check if we're in a browser environment
        if (typeof window === 'undefined') {
          setIsInFarcaster(false)
          setLoading(false)
          return
        }

        // Check if the Mini App SDK is available
        let sdk: any = null
        try {
          const { sdk: sdkModule } = await import('@farcaster/miniapp-sdk')
          sdk = sdkModule
          setSdkAvailable(true)
        } catch (sdkError) {
          console.log('Mini App SDK not available:', sdkError)
          setSdkAvailable(false)
          setIsInFarcaster(false)
          setLoading(false)
          return
        }

        // Check if we're inside a Farcaster client
        try {
          const inFarcaster = sdk.isInFarcaster()
          setIsInFarcaster(inFarcaster)

          if (inFarcaster) {
            // Initialize the Mini App SDK
            await sdk.actions.ready()
            
            // Try to get authenticated user data
            try {
              const response = await sdk.quickAuth.fetch('/api/farcaster/me')
              if (response.ok) {
                const data = await response.json()
                setUserData(data)
              } else {
                console.log('User not authenticated, will show sign-in')
              }
            } catch (authError) {
              console.log('Authentication error:', authError)
              // This is expected for new users
            }
          }
        } catch (sdkInitError) {
          console.log('SDK initialization error:', sdkInitError)
          // If SDK fails to initialize, we're not in a Farcaster client
          setIsInFarcaster(false)
        }
      } catch (err) {
        console.error('App initialization error:', err)
        // Don't set error for initialization issues, just continue in web mode
        setIsInFarcaster(false)
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
            Connect your Farcaster account and discover which sitcom character you're most like based on your social data!
          </p>
          {isInFarcaster && (
            <div className="mt-4 inline-block bg-green-500 text-white px-4 py-2 rounded-full text-sm">
              ✓ Running as Farcaster Mini App
            </div>
          )}
          {!isInFarcaster && sdkAvailable && (
            <div className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded-full text-sm">
              🌐 Running in Web Mode
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
          />
        ) : (
          <CharacterAnalysis 
            userData={userData}
            onReanalyze={() => setUserData(null)}
          />
        )}

        {/* Development Info */}
        {!isInFarcaster && (
          <div className="mt-12 max-w-2xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-3">Development Mode</h3>
              <p className="text-gray-300 text-sm mb-4">
                This app is designed to run as a Farcaster Mini App. In production, users will authenticate through their Farcaster client.
              </p>
              <div className="text-xs text-gray-400 space-y-1">
                <p>• <strong>Current Environment:</strong> {sdkAvailable ? 'Web Browser' : 'Unknown'}</p>
                <p>• <strong>Farcaster Client:</strong> {isInFarcaster ? 'Yes' : 'No'}</p>
                <p>• <strong>SDK Available:</strong> {sdkAvailable ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
