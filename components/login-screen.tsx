"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import Script from "next/script"
import api from "../lib/api/api"

interface LoginScreenProps {
  onNext: () => void
}

interface GoogleAuthResponse {
  code: string
}

interface GoogleCodeClient {
  requestCode: () => void
}

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initCodeClient: (config: {
            client_id: string
            scope: string
            ux_mode: string
            redirect_uri: string
            callback: (response: GoogleAuthResponse) => void
          }) => GoogleCodeClient
        }
      }
    }
  }
}

export function LoginScreen({ onNext }: LoginScreenProps) {
  const codeClientRef = useRef<GoogleCodeClient | null>(null)
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const initializeGoogleClient = () => {
    if (!window.google?.accounts?.oauth2) {
      console.error("❌ Google API 로드 실패")
      return
    }

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    
    if (!clientId) {
      console.error("❌ NEXT_PUBLIC_GOOGLE_CLIENT_ID 환경변수가 설정되지 않았습니다.")
      return
    }

    try {
      codeClientRef.current = window.google.accounts.oauth2.initCodeClient({
        client_id: clientId,
        scope: "openid email profile",
        ux_mode: "popup",
        redirect_uri: "postmessage",
        callback: async (response: GoogleAuthResponse) => {
          if (!response.code) {
            console.error("❌ authorization code를 받지 못했습니다.")
            return
          }
          
          setIsLoading(true)
          
          try {
            const res = await api.post("/auth/signin", 
              { oauth: response.code },
              { withCredentials: false }
            )
            // 로컬 저장이에요
            localStorage.setItem("token", res.data.jwt);
            console.log(response.code)
            console.log("✅ === 서버 응답 성공 ===")
            console.log("  - Status:", res.status)
            console.log("  - Status Text:", res.statusText)
            console.log("  - Headers:", res.headers)
            console.log("  - Data:", res.data)
            setIsLoading(false)
            onNext()
            
          } catch (err: any) {
            console.log(response.code)
            console.error("❌ === 서버 요청 실패 ===")
            console.error("  - Error 타입:", err.name)
            console.error("  - Error 코드:", err.code)
            console.error("  - Error 메시지:", err.message)
            
            if (err.response) {
              console.error("  - 상태 코드:", err.response.status)
              console.error("  - 상태 텍스트:", err.response.statusText)
              console.error("  - 응답 데이터:", err.response.data)
              console.error("  - 응답 헤더:", err.response.headers)
            } else if (err.request) {
              console.error("  - readyState:", err.request.readyState)
              console.error("  - status:", err.request.status)
              console.error("  - responseURL:", err.request.responseURL)
            }
            
            alert("로그인에 실패했습니다. 콘솔을 확인해주세요.")
          } finally {
            setIsLoading(false)
          }
        },
      })
      
      setIsGoogleLoaded(true)
      
    } catch (error: any) {
      console.error("❌ Google Client 초기화 실패:", error.message)
    }
  }

  useEffect(() => {
    if (window.google?.accounts?.oauth2) {
      initializeGoogleClient()
    }
  }, [isGoogleLoaded])

  const handleScriptLoad = () => {
    initializeGoogleClient()
  }

  const handleScriptError = () => {
    console.error("❌ Google Script 로드 실패")
  }

  const handleLogin = () => {
    if (!codeClientRef.current) {
      console.error("❌ Google Client가 초기화되지 않았습니다.")
      alert("Google 로그인을 준비 중입니다. 잠시 후 다시 시도해주세요.")
      return
    }

    if (isLoading) {
      return
    }

    try {
      codeClientRef.current.requestCode()
    } catch (error: any) {
      console.error("❌ requestCode 호출 실패:", error.message)
      alert("로그인 요청에 실패했습니다. 페이지를 새로고침 해주세요.")
    }
  }

  return (
    <>
      <Script 
        src="https://accounts.google.com/gsi/client" 
        strategy="beforeInteractive"
        onLoad={handleScriptLoad}
        onError={handleScriptError}
      />
      <div className="flex flex-col items-center justify-center h-screen px-[17px]">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <img 
              src="/logos/mealgo_logo.svg" 
              className="h-20 m-auto" 
              alt="mealgo logo" 
            />
            <h1 className="text-3xl font-medium text-white">mealgo</h1>
            <p className="text-white text-[12px] font-medium">통합로그인</p>
          </div>
        </div>
        
        <div className="w-full pb-[33px]">
          <Button
            onClick={handleLogin}
            disabled={!isGoogleLoaded || isLoading}
            className="w-full bg-white text-black hover:bg-gray-100 h-14 rounded-[5px] font-[600] text-base flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span>로그인 중...</span>
            ) : (
              <>
                <img 
                  src="/logos/google.png" 
                  alt="구글 로그인" 
                  width={20} 
                  height={20} 
                />
                구글 로그인
              </>
            )}
          </Button>
        </div>
      </div>
    </>
  )
}