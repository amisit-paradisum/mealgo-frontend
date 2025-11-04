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
}

// 기본 설정값
const defaultSettings: Settings = {
  darkMode: true,
  preferredMenuAlert: true,
  timeDisplay: false,
  highContrastMode: true,
}

export function SettingsScreen({ onBack }: SettingsScreenProps) {
  const [settings, setSettings] = useState<Settings>(defaultSettings)

  // 컴포넌트 마운트 시 localStorage에서 설정 불러오기
  useEffect(() => {
    const savedSettings = localStorage.getItem("mealAppSettings")
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings))
      } catch (error) {
        console.error("설정 불러오기 실패:", error)
      }
    }
  }, [])

  // 설정 변경 시 localStorage에 저장
  const toggleSetting = (key: keyof Settings) => {
    setSettings((prev) => {
      const newSettings = { ...prev, [key]: !prev[key] }
      // localStorage에 즉시 저장
      localStorage.setItem("mealAppSettings", JSON.stringify(newSettings))
      return newSettings
    })
  }

  return (
    <div className="flex flex-col min-h-screen px-6 pt-12 bg-[#140D2B]">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" className="text-white" onClick={onBack}>
          <ChevronLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-2xl font-bold text-white">설정</h1>
      </div>

      <div className="space-y-3">
        <SettingItem label="다크모드" checked={settings.darkMode} onToggle={() => toggleSetting("darkMode")} />
        <SettingItem
          label="선호메뉴알림"
          checked={settings.preferredMenuAlert}
          onToggle={() => toggleSetting("preferredMenuAlert")}
        />
        <SettingItem
          label="시간표기능 비활성화"
          checked={settings.timeDisplay}
          onToggle={() => toggleSetting("timeDisplay")}
        />
        <SettingItem
          label="고대비 모드"
          checked={settings.highContrastMode}
          onToggle={() => toggleSetting("highContrastMode")}
        />
      </div>
    </div>
  )
}

function SettingItem({
  label,
  checked,
  onToggle,
}: {
  label: string
  checked: boolean
  onToggle: () => void
}) {
  return (
    <div className="flex items-center justify-between bg-black rounded-2xl px-6 py-5">
      <span className="text-white font-medium">{label}</span>
      <CustomSwitch checked={checked} onToggle={onToggle} />
    </div>
  )
}

function CustomSwitch({
  checked,
  onToggle,
}: {
  checked: boolean
  onToggle: () => void
}) {
  return (
    <button
      onClick={onToggle}
      className={`relative w-12 h-7 rounded-full transition-colors duration-300 ${
        checked
          ? "bg-[#643BF0]"
          : "bg-[#e6e1e8] border-2 border-[#79747E]"
      }`}
    >
      <span
        className={`absolute top-1/2 left-1 rounded-full transition-all duration-300 -translate-y-1/2 ${
          checked
            ? "w-5 h-5 bg-white translate-x-5"
            : "w-[16px] h-[16px] bg-[#6e6874] translate-x-0"
        }`}
      />
    </button>
  )
}