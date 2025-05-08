import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import SplashScreen from "@/components/splash-screen"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Ziny.AI - AI Chat App",
  description: "Modern AI chat application in collaboration Gemini",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <SplashScreen />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
