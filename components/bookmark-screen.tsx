"use client"

import { useState, useEffect } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronLeft, X } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"

interface BookmarkScreenProps {
  onNavigate: (screen: "meal" | "diet" | "bookmark" | "settings") => void
}

interface Settings {
  darkMode: boolean
}

const defaultSettings: Settings = {
  darkMode: true,
}

export function BookmarkScreen({ onNavigate }: BookmarkScreenProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [bookmarks, setBookmarks] = useState<string[]>([])
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [isClient, setIsClient] = useState(false)

  /* 클라이언트 체크 */
  useEffect(() => {
    setIsClient(true)
  }, [])

  /* 설정 불러오기 */
  useEffect(() => {
    if (!isClient) return
    const saved = localStorage.getItem("mealAppSettings")
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setSettings({
          darkMode: parsed.darkMode ?? true,
        })
      } catch {}
    }
  }, [isClient])

  /* 북마크 불러오기 */
  useEffect(() => {
    const savedBookmarks = localStorage.getItem("mealBookmarks")
    if (savedBookmarks) {
      try {
        setBookmarks(JSON.parse(savedBookmarks))
      } catch {}
    }
  }, [])

  /* 북마크 추가 */
  const addBookmark = () => {
    if (!searchQuery.trim()) return
    const trimmed = searchQuery.trim()
    if (bookmarks.includes(trimmed)) return
    const next = [...bookmarks, trimmed]
    setBookmarks(next)
    localStorage.setItem("mealBookmarks", JSON.stringify(next))
    setSearchQuery("")
  }

  /* 북마크 삭제 */
  const removeBookmark = (tag: string) => {
    const next = bookmarks.filter(b => b !== tag)
    setBookmarks(next)
    localStorage.setItem("mealBookmarks", JSON.stringify(next))
  }

  /* 스타일 분기 */
  const bgGradient = settings.darkMode
    ? "bg-[#000000]"
    : "bg-[#DEE0FF]"
  const textColor = settings.darkMode ? "text-white" : "text-black"
  const subTextColor = settings.darkMode ? "text-white/60" : "text-gray-500"
  const borderColor = settings.darkMode ? "border-white/30" : "border-gray-300"
  const actionButtonStyle = settings.darkMode
    ? "bg-white text-black hover:bg-gray-100"
    : "bg-black text-white hover:bg-gray-800"
  const tagStyle = settings.darkMode
    ? "border-white text-white hover:bg-white/10"
    : "border-gray-400 bg-[#643BF0] text-white hover:bg-[#562ED4]"

  return (
    <div className={`flex flex-col min-h-screen ${bgGradient}`}>
      <div className="flex-1 px-6 pt-12 pb-24">
        {/* 헤더 */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            className={textColor}
            onClick={() => onNavigate("meal")}
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <h1 className={`text-2xl font-bold ${textColor}`}>북마크</h1>
        </div>

        {/* 입력 */}
        <div className="relative mb-6">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="좋아하는 음식을 입력하세요"
            className={`w-full h-14 bg-transparent border-2 ${borderColor} rounded-2xl ${textColor} placeholder:opacity-50 pr-24`}
            onKeyDown={(e) => e.key === "Enter" && addBookmark()}
          />

          <Button
            onClick={addBookmark}
            className={`absolute right-2 top-1/2 -translate-y-1/2 h-10 px-6 rounded-xl font-bold text-sm ${actionButtonStyle}`}
          >
            추가
          </Button>
        </div>

        {/* 개수 */}
        <p className={`${subTextColor} text-sm mb-4`}>
          {bookmarks.length}개 추가됨
        </p>

        {/* 태그 */}
        <div className="flex flex-wrap gap-2">
          {bookmarks.map((tag, index) => (
            <Button
              key={index}
              variant="outline"
              className={`relative h-10 px-4 pr-10 border-2 rounded-full ${tagStyle}`}
            >
              {tag}
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation()
                  removeBookmark(tag)
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.stopPropagation()
                    removeBookmark(tag)
                  }
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full cursor-pointer"
              >
                <X className="w-3 h-3" />
              </span>
            </Button>
          ))}
        </div>

        {/* 빈 상태 */}
        {bookmarks.length === 0 && (
          <div className={`text-center mt-12 ${subTextColor}`}>
            <p>아직 북마크된 음식이 없습니다</p>
            <p className="text-sm mt-2">좋아하는 음식을 추가해보세요!</p>
          </div>
        )}
      </div>

      <BottomNav currentTab="bookmark" onNavigate={onNavigate} />
    </div>
  )
}
