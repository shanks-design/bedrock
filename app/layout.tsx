import type React from "react"
import type { Metadata } from "next"
import { Nunito, Comfortaa } from "next/font/google"
import "./globals.css"

const nunito = Nunito({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-nunito",
})

const comfortaa = Comfortaa({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-comfortaa",
})

export const metadata: Metadata = {
  title: "Sitcom Character Matcher - Farcaster Mini App",
  description: "Discover which sitcom character you are based on your Farcaster casts!",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${nunito.variable} ${comfortaa.variable} antialiased`}>
      <body>{children}</body>
    </html>
  )
}
