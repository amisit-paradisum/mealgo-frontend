"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"

interface SettingsScreenProps {
  onBack: () => void
}

export function SettingsScreen({ onBack }: SettingsScreenProps) {
  const [settings, setSettings] = useState({
    darkMode: true,
    preferredMenuAlert: true,
    timeDisplay: false,
    highContrastMode: true,
  })

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }))
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

// ✅ false일 때만 border 표시, true일 땐 border 제거
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
          ? // ✅ true 상태: 보라색 배경, border 없음
            "bg-[#643BF0]"
          : // ✅ false 상태: 회색 배경 + border 표시
            "bg-[#e6e1e8] border-2 border-[#79747E]"
      }`}
    >
      <span
        className={`absolute top-1/2 left-1 rounded-full transition-all duration-300 -translate-y-1/2 ${
          checked
            ? // ✅ true: 기본 크기, 오른쪽 이동
              "w-5 h-5 bg-white translate-x-5"
            : // ✅ false: 원 크기 축소 + 중앙 유지
              "w-[16px] h-[16px] bg-[#6e6874] translate-x-0"
        }`}
      />
    </button>
  )

}



