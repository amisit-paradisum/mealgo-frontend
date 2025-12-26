"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"

interface SettingsScreenProps {
  onBack: () => void
}

// 설정 타입 정의
interface Settings {
  darkMode: boolean
  preferredMenuAlert: boolean
  timeDisplay: boolean
  highContrastMode: boolean
  grade: string
  className: string
}

// 기본 설정값
const defaultSettings: Settings = {
  darkMode: true,
  preferredMenuAlert: true,
  timeDisplay: false,
  highContrastMode: true,
  grade: "1",
  className: "1"
}

export function SettingsScreen({ onBack }: SettingsScreenProps) {
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // 컴포넌트 마운트 시 localStorage에서 설정 불러오기
  useEffect(() => {
    if (!isClient) return

    const savedSettings = localStorage.getItem("mealAppSettings")
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings({
          darkMode: parsed.darkMode ?? defaultSettings.darkMode,
          preferredMenuAlert: parsed.preferredMenuAlert ?? defaultSettings.preferredMenuAlert,
          timeDisplay: parsed.timeDisplay ?? defaultSettings.timeDisplay,
          highContrastMode: parsed.highContrastMode ?? defaultSettings.highContrastMode,
          grade: parsed.grade ?? defaultSettings.grade,
          className: parsed.className ?? defaultSettings.className,
        })
      } catch (error) {
        console.error("설정 불러오기 실패:", error)
      }
    }
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

  // 설정 변경 시 localStorage에 저장
  const toggleSetting = (key: keyof Settings) => {
    setSettings((prev) => {
      const newSettings = { ...prev, [key]: !prev[key] }
      // localStorage에 즉시 저장
      if (isClient) {
        localStorage.setItem("mealAppSettings", JSON.stringify(newSettings))
      }
      return newSettings
    })
  }

  const onLogout = () => {
    if (isClient) {
      localStorage.removeItem("refresh")
      window.location.reload()
    }
  }

  // 다크모드에 따른 스타일 변수
  const bgColor = settings.darkMode ? "bg-[#140D2B]" : "bg-gray-50"
  const textColor = settings.darkMode ? "text-white" : "text-gray-800"
  const buttonIconColor = settings.darkMode ? "text-white" : "text-gray-800"
  const settingItemBg = settings.darkMode ? "bg-black" : "bg-white"
  const settingItemBorder = settings.darkMode ? "" : "border border-gray-200"
  const logoutTextColor = settings.darkMode ? "text-white" : "text-gray-800"
  const logoutLinkColor = settings.darkMode ? "text-[#8479FF]" : "text-blue-600"

  return (
    <div className={`flex flex-col min-h-screen px-6 pt-12 ${bgColor}`}>
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" className={buttonIconColor} onClick={onBack}>
          <ChevronLeft className="w-8! h-8!" />
        </Button>
        <h1 className={`text-2xl font-bold ${textColor}`}>설정</h1>
      </div>

      <div className="space-y-3">
        <SettingItem 
          label="다크모드" 
          checked={settings.darkMode} 
          onToggle={() => toggleSetting("darkMode")}
          darkMode={settings.darkMode}
          itemBg={settingItemBg}
          itemBorder={settingItemBorder}
        />
        <SettingItem
          label="선호메뉴알림"
          checked={settings.preferredMenuAlert}
          onToggle={() => toggleSetting("preferredMenuAlert")}
          darkMode={settings.darkMode}
          itemBg={settingItemBg}
          itemBorder={settingItemBorder}
        />
        <SettingItem
          label="시간표기능 비활성화"
          checked={settings.timeDisplay}
          onToggle={() => toggleSetting("timeDisplay")}
          darkMode={settings.darkMode}
          itemBg={settingItemBg}
          itemBorder={settingItemBorder}
        />
        <SettingItem
          label="고대비 모드"
          checked={settings.highContrastMode}
          onToggle={() => toggleSetting("highContrastMode")}
          darkMode={settings.darkMode}
          itemBg={settingItemBg}
          itemBorder={settingItemBorder}
        />
      </div>
      <div className="flex-1" />
      <div className="w-full flex justify-center mb-6">
        <p className={logoutTextColor}>
          현재 mealgo 계정{" "}
          <span onClick={onLogout} className={`${logoutLinkColor} cursor-pointer`}>
            로그아웃
          </span>{" "}
          하기
        </p>
      </div>
    </div>
  )
}

function SettingItem({
  label,
  checked,
  onToggle,
  darkMode,
  itemBg,
  itemBorder,
}: {
  label: string
  checked: boolean
  onToggle: () => void
  darkMode: boolean
  itemBg: string
  itemBorder: string
}) {
  const textColor = darkMode ? "text-white" : "text-gray-800"

  return (
    <div className={`flex items-center justify-between ${itemBg} ${itemBorder} rounded-2xl px-6 py-5`}>
      <span className={`${textColor} font-medium`}>{label}</span>
      <CustomSwitch checked={checked} onToggle={onToggle} darkMode={darkMode} />
    </div>
  )
}

function CustomSwitch({
  checked,
  onToggle,
  darkMode,
}: {
  checked: boolean
  onToggle: () => void
  darkMode: boolean
}) {
  // 다크모드에 따른 스위치 색상
  const activeBg = darkMode ? "bg-[#643BF0]" : "bg-blue-600"
  const inactiveBg = darkMode 
    ? "bg-[#e6e1e8] border-2 border-[#79747E]" 
    : "bg-gray-200 border-2 border-gray-400"
  const activeKnob = darkMode ? "bg-white" : "bg-white"
  const inactiveKnob = darkMode ? "bg-[#6e6874]" : "bg-gray-500"

  return (
    <button
      onClick={onToggle}
      className={`relative w-12 h-7 rounded-full transition-colors duration-300 ${
        checked ? activeBg : inactiveBg
      }`}
    >
      <span
        className={`absolute top-1/2 left-1 rounded-full transition-all duration-300 -translate-y-1/2 ${
          checked
            ? `w-5 h-5 ${activeKnob} translate-x-5`
            : `w-[16px] h-[16px] ${inactiveKnob} translate-x-0`
        }`}
      />
    </button>
  )
}