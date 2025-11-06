"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const run = async () => {
      const params = new URLSearchParams(window.location.search)
      const code = params.get("code")
      if (!code) {
        console.error("auth code 없음")
        router.replace("/")
        return
      }

      try {
        const res = await axios.post(
          "https://mealgo.whitefish.uk/auth/signin",
          JSON.stringify(code), // 서버는 JSON 문자열 기대
          { headers: { "Content-Type": "application/json" } }
        )

        const { jwt, refreshToken } = res.data
        if (jwt && refreshToken) {
          localStorage.setItem("jwt", jwt)
          localStorage.setItem("refreshToken", refreshToken)
          router.replace("/dashboard") // 로그인 후 이동할 페이지
        } else {
          console.error("응답 형식 오류:", res.data)
          router.replace("/")
        }
      } catch (err: any) {
        if (err.response) {
          console.error("서버 오류:", err.response.status, err.response.data)
        } else {
          console.error("요청 실패:", err.message)
        }
        router.replace("/")
      }
    }

    run()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center text-white">
      로그인 처리 중...
    </div>
  )
}
