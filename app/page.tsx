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
import axios from "axios"

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<
    "login" | "onboarding" | "onboardingGrade" | "meal" | "diet" | "bookmark" | "settings" | undefined
  >(undefined)

  const setAccessToken = useSetRecoilState(accessTokenState)

  useEffect(() => {
    const checkAuth = async () => {
      const refresh = localStorage.getItem("refresh")

      if (!refresh) {
        setCurrentScreen("login")
        return
      }

      try {
         const res = await api.get("/auth/refresh", {
            headers: {
              "refresh-token": refresh
            }
          })

        console.log(res)
        const newToken = res.data;

        if (newToken) {
          setAccessToken(newToken)
        }

        setCurrentScreen("meal")
      } catch (err: any) {
        
        if (err?.response?.status === 401) {
          localStorage.removeItem("refresh")
        }else{
          console.error("끼야아악 인증 또 터짐ㅁ:", err.message);
          localStorage.removeItem("refresh")
        }
        setCurrentScreen("login")
      }
    }

    checkAuth()
  }, [setAccessToken])

  if (!currentScreen) return null

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
