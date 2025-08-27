import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: 'Farcaster Sitcom Matcher',
  description: 'Discover which sitcom character you\'re most like based on your Farcaster social data!',
  metadataBase: new URL('https://your-vercel-domain.vercel.app'), // Update this with your actual domain
  openGraph: {
    title: 'Farcaster Sitcom Matcher',
    description: 'Discover which sitcom character you\'re most like based on your Farcaster social data!',
    images: [
      {
        url: '/abstract-profile.png',
        width: 1200,
        height: 800,
        alt: 'Farcaster Sitcom Matcher',
      },
    ],
  },
  other: {
    'fc:miniapp': JSON.stringify({
      version: "1",
      imageUrl: "https://your-vercel-domain.vercel.app/abstract-profile.png", // Update with your domain
      button: {
        title: "Sitcom Matcher",
        action: {
          type: "post",
          url: "https://your-vercel-domain.vercel.app", // Update with your domain
        },
      },
      postUrl: "https://your-vercel-domain.vercel.app", // Update with your domain
      input: {
        text: "Discover which sitcom character you are!",
      },
    }),
    // Backward compatibility
    'fc:frame': JSON.stringify({
      version: "1",
      imageUrl: "https://your-vercel-domain.vercel.app/abstract-profile.png", // Update with your domain
      button: {
        title: "Sitcom Matcher",
        action: {
          type: "post",
          url: "https://your-vercel-domain.vercel.app", // Update with your domain
        },
      },
      postUrl: "https://your-vercel-domain.vercel.app", // Update with your domain
      input: {
        text: "Discover which sitcom character you are!",
      },
    }),
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://auth.farcaster.xyz" />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
