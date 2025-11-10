"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import Script from "next/script"
import api from "../lib/api/api"

interface LoginScreenProps {
  onNext: () => void
}

export function LoginScreen({ onNext }: LoginScreenProps) {
  let codeClient: any

  useEffect(() => {
    // 전역 google 객체 초기화
    codeClient = google.accounts.oauth2.initCodeClient({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      scope: "openid email profile",
      ux_mode: "popup",
      redirect_uri: "postmessage", // 클라이언트에서 code만 받음
      callback: async (response: { code: string }) => {
        console.log("받은 code:", response.code)
        console.log(response)
        try {
          await api.post("/auth/signin", { "oauth": `${response.code}` })
          onNext()
        } catch (err) {
          console.error("서버 전송 실패:", err)
          // 필요하면 에러 UI 표시도 가능
        }
      }
    })
  }, [])

  const handleLogin = () => {
    codeClient.requestCode()
  }

  return (
    <>
      {/* Google OAuth SDK 스크립트 로드 */}
      <Script
        src="https://accounts.google.com/gsi/client"
        async
        defer
        strategy="beforeInteractive"
      />

      <div className="flex flex-col items-center justify-center h-screen px-[17px]">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <img
              src="/logos/mealgo_logo.svg"
              className="h-20 flex-1 m-auto"
              alt="mealgo logo"
            />
            <h1 className="text-3xl font-medium text-white">mealgo</h1>
            <p className="text-white text-[12px] font-medium">통합로그인</p>
          </div>
        </div>

        <div className="w-full pb-[33px]">
          <Button
            onClick={handleLogin}
            className="w-full bg-white text-black hover:bg-gray-100 h-14 rounded-[5px] font-[600] text-base flex items-center justify-center gap-3"
          >
            <img
              src="/logos/google.png"
              alt="구글 로고 이미지"
              width={20}
              height={20}
            />
            구글 로그인
          </Button>
        </div>
      </div>
    </>
  )
}
