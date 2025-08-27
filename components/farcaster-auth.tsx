'use client'

import { useState } from 'react'

interface UserData {
  fid: number
  profile?: any
  casts?: any[]
  reactions?: any[]
}

interface FarcasterAuthProps {
  isInFarcaster: boolean
  onUserConnected: (data: UserData) => void
}

export default function FarcasterAuth({ isInFarcaster, onUserConnected }: FarcasterAuthProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const connectWithFarcaster = async () => {
    setIsConnecting(true)
    setError(null)

    try {
      if (isInFarcaster) {
        // Use Quick Auth for seamless authentication
        try {
          const { sdk } = await import('@farcaster/miniapp-sdk')
          const { token } = await sdk.quickAuth.getToken()
          
          // Fetch user data using the authenticated token
          const response = await sdk.quickAuth.fetch('/api/farcaster/me')
          
          if (response.ok) {
            const userData = await response.json()
            onUserConnected(userData)
          } else {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Failed to fetch user data')
          }
        } catch (sdkError) {
          console.error('SDK error:', sdkError)
          throw new Error('Failed to connect with Farcaster SDK')
        }
      } else {
        // For non-Farcaster environments, show guidance
        throw new Error('This app requires a Farcaster client to authenticate. Please open it in Warpcast, Base App, or another Farcaster client.')
      }
    } catch (err) {
      console.error('Authentication error:', err)
      setError(err instanceof Error ? err.message : 'Failed to connect to Farcaster. Please try again.')
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-8 text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {isInFarcaster ? 'Connect Your Farcaster Account' : 'Farcaster Client Required'}
          </h2>
          <p className="text-gray-300">
            {isInFarcaster 
              ? 'Sign in securely with your Farcaster wallet to analyze your social data'
              : 'This app requires a Farcaster client to authenticate and access your data'
            }
          </p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <button
          onClick={connectWithFarcaster}
          disabled={isConnecting || !isInFarcaster}
          className={`w-full py-3 px-6 rounded-lg font-semibold text-lg transition-all duration-200 ${
            isConnecting || !isInFarcaster
              ? 'bg-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 transform hover:scale-105'
          } text-white`}
        >
          {isConnecting ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Connecting...
            </div>
          ) : (
            isInFarcaster ? 'Sign In with Farcaster' : 'Farcaster Client Required'
          )}
        </button>

        {isInFarcaster && (
          <p className="text-sm text-gray-400 mt-4">
            Your wallet will prompt you to sign a message to authenticate
          </p>
        )}

        {!isInFarcaster && (
          <div className="mt-6 p-4 bg-blue-500/20 border border-blue-500/50 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-200 mb-2">How to Use This App</h3>
            <div className="text-blue-100 text-sm space-y-2">
              <p>1. <strong>Open in Farcaster Client:</strong> Use Warpcast, Base App, or another Farcaster client</p>
              <p>2. <strong>Find the App:</strong> Search for "Sitcom Matcher" or use the cast link</p>
              <p>3. <strong>Authenticate:</strong> Sign in with your Farcaster wallet</p>
              <p>4. <strong>Analyze:</strong> Get your character analysis based on real social data</p>
            </div>
            <div className="mt-4 text-xs text-blue-200">
              <p><strong>Note:</strong> This app requires real Farcaster authentication to access your profile, casts, and reactions for accurate character analysis.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
