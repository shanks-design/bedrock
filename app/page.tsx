'use client'

import { useEffect, useState } from 'react'
import { sdk } from '@farcaster/miniapp-sdk'
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

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check if we're inside a Farcaster client
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
      } catch (err) {
        console.error('SDK initialization error:', err)
        setError('Failed to initialize Farcaster Mini App')
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
          <p className="text-white text-xl">Initializing Farcaster Mini App...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-500 text-white p-4 rounded-lg mb-4">
            <p className="text-lg font-semibold">Error</p>
            <p>{error}</p>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            Retry
          </button>
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
      </div>
    </div>
  )
}
