import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import { GoogleOAuthProvider } from "@react-oauth/google"
import "./globals.css"
import { GoogleAuthWrapper } from "@/components/GoogleAuthWrapper"

export const metadata: Metadata = {
  title: "mealgo - 통합로그인",
  description: "학교 급식 관리 앱",
  generator: "v0.app",
  manifest: "/manifest.json",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="font-pretendard antialiased">
        <GoogleAuthWrapper>{children}</GoogleAuthWrapper>
        <Analytics />
      </body>
    </html>
  )
}
