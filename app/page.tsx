"use client"

import { useState, useEffect } from "react"
import { useSetRecoilState } from "recoil"
import { accessTokenState } from "@/recoil/auth"
import api from "@/lib/api/api"
import { LoginScreen } from "@/components/login-screen"
import { OnboardingScreen } from "@/components/onboarding-screen"
import { MealScreen } from "@/components/meal-screen"
import { DietScreen } from "@/components/diet-screen"
import { BookmarkScreen } from "@/components/bookmark-screen"
import { SettingsScreen } from "@/components/settings-screen"

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<
    "login" | "onboarding" | "onboardingGrade" | "meal" | "diet" | "bookmark" | "settings" | undefined
  >(undefined)

  const setAccessToken = useSetRecoilState(accessTokenState)

  useEffect(() => {
    const initAuth = async () => {
      try {
        const res = await api.post("/auth/refresh", {}, { withCredentials: true })
        setAccessToken(res.data.accessToken)
        setCurrentScreen("meal")
      } catch {
        setCurrentScreen("login")
      }
    }

    initAuth()
  }, [])

  if (!currentScreen) return null // 초기 로딩 상태

  return (
    <div className="min-h-screen">
      {currentScreen === "login" && <LoginScreen onNext={() => setCurrentScreen("meal")} />}
      {currentScreen === "meal" && <MealScreen onNavigate={setCurrentScreen} />}
      {currentScreen === "onboarding" && <OnboardingScreen onNext={() => setCurrentScreen("onboardingGrade")} />}
      {currentScreen === "diet" && <DietScreen onNavigate={setCurrentScreen} />}
      {currentScreen === "bookmark" && <BookmarkScreen onNavigate={setCurrentScreen} />}
      {currentScreen === "settings" && <SettingsScreen onBack={() => setCurrentScreen("meal")} />}
    </div>
  )
}
