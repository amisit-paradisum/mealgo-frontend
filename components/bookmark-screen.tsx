"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronLeft, Search, X } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"

interface BookmarkScreenProps {
  onNavigate: (screen: "meal" | "diet" | "bookmark" | "settings") => void
}

export function BookmarkScreen({ onNavigate }: BookmarkScreenProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [bookmarks, setBookmarks] = useState<string[]>([])

  // localStorage에서 북마크 불러오기
  useEffect(() => {
    const savedBookmarks = localStorage.getItem("mealBookmarks")
    if (savedBookmarks) {
      try {
        setBookmarks(JSON.parse(savedBookmarks))
      } catch (error) {
        console.error("북마크 불러오기 실패:", error)
      }
    }
  }, [])

  // 북마크 추가
  const addBookmark = () => {
    if (!searchQuery.trim()) return
    
    const trimmedQuery = searchQuery.trim()
    
    // 이미 존재하는지 체크
    if (bookmarks.includes(trimmedQuery)) {
      alert("이미 추가된 음식입니다!")
      return
    }

    const newBookmarks = [...bookmarks, trimmedQuery]
    setBookmarks(newBookmarks)
    localStorage.setItem("mealBookmarks", JSON.stringify(newBookmarks))
    setSearchQuery("")
  }

  // 북마크 삭제
  const removeBookmark = (tag: string) => {
    const newBookmarks = bookmarks.filter(b => b !== tag)
    setBookmarks(newBookmarks)
    localStorage.setItem("mealBookmarks", JSON.stringify(newBookmarks))
  }

  // Enter 키로 추가
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addBookmark()
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-linear-to-b from-[#000000] to-[#4325A5]">
      <div className="flex-1 px-6 pt-12 pb-24">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white hover:bg-white/10" 
            onClick={() => onNavigate("meal")}
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-2xl font-bold text-white">북마크</h1>
        </div>

        <div className="relative mb-6">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="좋아하는 음식을 입력하세요"
            className="w-full h-14 bg-transparent border-2 border-white/30 rounded-2xl text-white placeholder:text-white/50 pr-24"
          />
          <Button 
            onClick={addBookmark}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-10 px-6 bg-white text-black hover:bg-gray-100 rounded-xl font-bold text-sm"
          >
            추가
          </Button>
        </div>

        <p className="text-white/60 text-sm mb-4">{bookmarks.length}개 추가됨</p>

        <div className="flex flex-wrap gap-2">
          {bookmarks.map((tag, index) => (
            <Button
              key={index}
              variant="outline"
              className="relative h-10 px-4 pr-10 bg-transparent border-2 border-white text-white hover:bg-white/10 rounded-full group"
            >
              {tag}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  removeBookmark(tag)
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </Button>
          ))}
        </div>

        {bookmarks.length === 0 && (
          <div className="text-center mt-12 text-white/40">
            <p>아직 북마크된 음식이 없습니다</p>
            <p className="text-sm mt-2">좋아하는 음식을 추가해보세요!</p>
          </div>
        )}
      </div>

      <BottomNav currentTab="bookmark" onNavigate={onNavigate} />
    </div>
  )
}