import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Sitcom Character Matcher - Farcaster Mini App",
  description: "Discover which sitcom character you are based on your Farcaster casts!",
  generator: "v0.app",
  openGraph: {
    title: "Sitcom Character Matcher",
    description: "Discover which sitcom character you are based on your Farcaster casts!",
    images: ["/placeholder-logo.png"],
  },
  other: {
    "fc:miniapp": JSON.stringify({
      version: "1",
      imageUrl: "/placeholder-logo.png",
      button: {
        title: "Sitcom Matcher",
        action: {
          url: "/",
          method: "GET"
        }
      }
    })
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to Farcaster Quick Auth Server for better performance */}
        <link rel="preconnect" href="https://auth.farcaster.xyz" />
        
        {/* Farcaster Mini App Embed Meta Tags */}
        <meta property="fc:miniapp" content={JSON.stringify({
          version: "1",
          imageUrl: "/placeholder-logo.png",
          button: {
            title: "Sitcom Matcher",
            action: {
              url: "/",
              method: "GET"
            }
          }
        })} />
        
        {/* Backward compatibility with fc:frame */}
        <meta property="fc:frame" content={JSON.stringify({
          version: "1",
          imageUrl: "/placeholder-logo.png",
          button: {
            title: "Sitcom Matcher",
            action: {
              url: "/",
              method: "GET"
            }
          }
        })} />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
