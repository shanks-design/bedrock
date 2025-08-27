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
  const [neynarStatus, setNeynarStatus] = useState<string>('')

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
            throw new Error('Failed to fetch user data')
          }
        } catch (sdkError) {
          console.error('SDK error:', sdkError)
          throw new Error('Failed to connect with Farcaster SDK')
        }
      } else {
        // Fallback for non-Farcaster environments (development/testing)
        await connectWithMockData()
      }
    } catch (err) {
      console.error('Authentication error:', err)
      setError('Failed to connect to Farcaster. Please try again.')
    } finally {
      setIsConnecting(false)
    }
  }

  const connectWithMockData = async () => {
    try {
      const response = await fetch('/api/farcaster/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          signerUuid: 'mock-signer-uuid',
          fid: 12345,
          walletAddress: '0x1234567890123456789012345678901234567890'
        })
      })

      if (response.ok) {
        const data = await response.json()
        setNeynarStatus(data.neynarStatus || 'Mock data used')
        onUserConnected(data)
      } else {
        throw new Error('Failed to connect with mock data')
      }
    } catch (err) {
      console.error('Mock connection error:', err)
      setError('Failed to connect. Please try again.')
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
            {isInFarcaster ? 'Connect Your Farcaster Account' : 'Test with Mock Data'}
          </h2>
          <p className="text-gray-300">
            {isInFarcaster 
              ? 'Sign in securely with your Farcaster wallet to analyze your social data'
              : 'Running in development mode - using mock data for testing'
            }
          </p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {neynarStatus && (
          <div className="bg-blue-500/20 border border-blue-500/50 text-blue-200 px-4 py-3 rounded-lg mb-6">
            <strong>Status:</strong> {neynarStatus}
          </div>
        )}

        <button
          onClick={connectWithFarcaster}
          disabled={isConnecting}
          className={`w-full py-3 px-6 rounded-lg font-semibold text-lg transition-all duration-200 ${
            isConnecting
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
            isInFarcaster ? 'Sign In with Farcaster' : 'Connect with Mock Data'
          )}
        </button>

        {isInFarcaster && (
          <p className="text-sm text-gray-400 mt-4">
            Your wallet will prompt you to sign a message to authenticate
          </p>
        )}

        {!isInFarcaster && (
          <div className="mt-6 p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
            <p className="text-yellow-200 text-sm">
              <strong>Development Mode:</strong> This app is designed to run as a Farcaster Mini App. 
              In production, users will authenticate through their Farcaster client.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
