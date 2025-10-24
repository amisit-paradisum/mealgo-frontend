import type React from "react"
import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

export const metadata: Metadata = {
  title: "mealgo - 통합로그인",
  description: "학교 급식 관리 앱",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <body className="font-pretendard antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}