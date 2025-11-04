"use client"

import { useState } from "react"
import { LoginScreen } from "@/components/login-screen"
import { OnboardingScreen } from "@/components/onboarding-screen"
import { MealScreen } from "@/components/meal-screen"
import { DietScreen } from "@/components/diet-screen"
import { BookmarkScreen } from "@/components/bookmark-screen"
import { SettingsScreen } from "@/components/settings-screen"
import { OnboardingGradeScreen } from "@/components/onboarding-grade-screen"

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<
    "login" | "onboarding" | "onboardingGrade" | "meal" | "diet" | "bookmark" | "settings"
  >("login")

  return (
    <div className="min-h-screen">
      {currentScreen === "login" && <LoginScreen onNext={() => setCurrentScreen("onboarding")} />}
      {currentScreen === "onboarding" && <OnboardingScreen onNext={() => setCurrentScreen("onboardingGrade")} />}
      {currentScreen === "onboardingGrade" && <OnboardingGradeScreen onNext={() => setCurrentScreen("meal")} />}
      {currentScreen === "meal" && <MealScreen onNavigate={setCurrentScreen} />}
      {currentScreen === "diet" && <DietScreen onNavigate={setCurrentScreen} />}
      {currentScreen === "bookmark" && <BookmarkScreen onNavigate={setCurrentScreen} />}
      {currentScreen === "settings" && <SettingsScreen onBack={() => setCurrentScreen("meal")} />}
    </div>
  )
}
