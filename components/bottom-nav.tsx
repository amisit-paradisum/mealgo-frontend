"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Calendar, UtensilsCrossed, Flame } from "lucide-react"

interface BottomNavProps {
  currentTab: "meal" | "diet" | "bookmark"
  onNavigate: (screen: "meal" | "diet" | "bookmark") => void
}

interface Settings {
  darkMode: boolean
  preferredMenuAlert: boolean
  timeDisplay: boolean
  highContrastMode: boolean
  grade: string
  className: string
}

const DEFAULT_SETTINGS: Settings = {
  darkMode: true,
  preferredMenuAlert: true,
  timeDisplay: false,
  highContrastMode: true,
  grade: "1",
  className: "1"
}

export function BottomNav({ currentTab, onNavigate }: BottomNavProps) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // localStorage에서 설정 로드
  useEffect(() => {
    if (!isClient) return

    const loadSettings = () => {
      try {
        const savedSettings = localStorage.getItem("mealAppSettings")
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings)
          setSettings({
            darkMode: parsed.darkMode ?? DEFAULT_SETTINGS.darkMode,
            preferredMenuAlert: parsed.preferredMenuAlert ?? DEFAULT_SETTINGS.preferredMenuAlert,
            timeDisplay: parsed.timeDisplay ?? DEFAULT_SETTINGS.timeDisplay,
            highContrastMode: parsed.highContrastMode ?? DEFAULT_SETTINGS.highContrastMode,
            grade: parsed.grade ?? DEFAULT_SETTINGS.grade,
            className: parsed.className ?? DEFAULT_SETTINGS.className,
          })
        }
      } catch (error) {
        console.error("Failed to load settings:", error)
        setSettings(DEFAULT_SETTINGS)
      }
    }

    loadSettings()
  }, [isClient])

  // storage 이벤트 리스너 등록
  useEffect(() => {
    if (!isClient) return

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "mealAppSettings" && e.newValue) {
        try {
          setSettings(JSON.parse(e.newValue))
        } catch (error) {
          console.error("Failed to parse settings from storage event:", error)
        }
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [isClient])

  const handleBookmarkClick = () => {
    onNavigate("meal")
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth",
    })
  }

  // 다크모드에 따른 스타일 변수
  const bgColor = settings.darkMode ? "bg-[#0f0a1e]" : "bg-white"
  const borderColor = settings.darkMode ? "border-white/10" : "border-gray-200"
  const activeColor = settings.darkMode ? "text-purple-400" : "text-[#8264F3]"
  const inactiveColor = settings.darkMode ? "text-white/50" : "text-gray-400"
  const shadowStyle = settings.darkMode ? "shadow-lg" : "shadow-xl"

  return (
    <div className={`fixed bottom-0 left-0 right-0 ${bgColor} border-t ${borderColor} rounded-t-[20px] h-[80px] ${shadowStyle}`}>
      <div className="flex items-center justify-around px-6 py-4 max-w-md mx-auto">
        <Button
          variant="ghost"
          className={`flex flex-col items-center gap-1 ${
            currentTab === "bookmark" ? activeColor : inactiveColor
          }`}
          onClick={handleBookmarkClick}
        >
          <Calendar className="w-6 h-6" />
          <span className="text-xs">내 시간표</span>
        </Button>

        <Button
          variant="ghost"
          className={`flex flex-col items-center gap-1 ${
            currentTab === "meal" ? activeColor : inactiveColor
          }`}
          onClick={() => onNavigate("meal")}
        >
          <UtensilsCrossed className="w-6 h-6" />
          <span className="text-xs">오늘 급식</span>
        </Button>

        <Button
          variant="ghost"
          className={`flex flex-col items-center gap-1 ${
            currentTab === "diet" ? activeColor : inactiveColor
          }`}
          onClick={() => onNavigate("diet")}
        >
          <Flame className="w-6 h-6" />
          <span className="text-xs">다이어트</span>
        </Button>
      </div>
    </div>
  )
}