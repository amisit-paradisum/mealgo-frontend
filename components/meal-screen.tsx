"use client"


import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Bookmark, MoreVertical } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"
import { DateModal } from "@/components/date-modal"
import axios from "axios"

interface MealScreenProps {
  onNavigate: (screen: "meal" | "diet" | "bookmark" | "settings") => void
}



interface MealData {
  breakfast: string[]
  lunch: string[]
  dinner: string[]
}

interface Settings {
  darkMode: boolean
  preferredMenuAlert: boolean
  timeDisplay: boolean
  highContrastMode: boolean
}

// ✅ axios 인스턴스 생성
const api = axios.create({
  baseURL: "https://mealgo.whitefish.uk",
  headers: {
    "Content-Type": "application/json",
  },
})

export function MealScreen({ onNavigate }: MealScreenProps) {
  const [showDateModal, setShowDateModal] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedMeal, setSelectedMeal] = useState<'breakfast' | 'lunch' | 'dinner'>('lunch')
  const [mealData, setMealData] = useState<MealData | null>(null)
  const [loading, setLoading] = useState(true)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const [direction, setDirection] = useState(0)
  const [bookmarks, setBookmarks] = useState<string[]>([])
  const [settings, setSettings] = useState<Settings>({
    darkMode: true,
    preferredMenuAlert: true,
    timeDisplay: false,
    highContrastMode: true,
  })

const api = axios.create({
  baseURL: "https://mealgo.whitefish.uk",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbmFkbWluYWRtaTJuYWRtaW5hZG1pbmFkbWluYWQzbWluYWRtaW5hZG1pbmFkbWluYTRkbWluYWRtaW4xYWRtaW5hZG1pbmFkMm1pbmFkbWluYWRtaW5hNmRtaW5hZG1pbmEyZG1pbmFkbWluYWRtaW5hZG1pbmFkbWluYWRtaW5hZG1pbmFkbWluIiwiaWF0IjoxNzYyMjQyMTAxLCJleHAiOjI1MzQwMjI2ODM5OX0.ELddoPs-3Qrwhfi3aHfOHL6dZzs9SRWJz67WAvMhv1Y"
  },
})

  const mealNames = {
    breakfast: '조식',
    lunch: '중식',
    dinner: '석식',
  }

  useEffect(() => {
    const savedBookmarks = localStorage.getItem("mealBookmarks")
    if (savedBookmarks) {
      try {
        setBookmarks(JSON.parse(savedBookmarks))
      } catch {}
    }

    const savedSettings = localStorage.getItem("mealAppSettings")
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings))
      } catch {}
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "mealAppSettings" && e.newValue) {
        try {
          setSettings(JSON.parse(e.newValue))
        } catch {}
      }
      if (e.key === "mealBookmarks" && e.newValue) {
        try {
          setBookmarks(JSON.parse(e.newValue))
        } catch {}
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  // ✅ 급식 데이터 불러오기
  useEffect(() => {
    const fetchMealData = async () => {
      setLoading(true)
      const y = currentDate.getFullYear()
      const m = String(currentDate.getMonth() + 1).padStart(2, '0')
      const d = String(currentDate.getDate()).padStart(2, '0')
      const formattedDate = `${y}-${m}-${d}`

      try {
        const response = await api.get("/api/meal", {
          params: {
            schoolCode: "7430310",
            date: formattedDate
          }
        })

        const data = response.data
        const organized: MealData = { breakfast: [], lunch: [], dinner: [] }

        if (data.meals && Array.isArray(data.meals)) {
          for (const meal of data.meals) {
            const menuItems = Array.isArray(meal.menu)
              ? meal.menu.map((i: string) =>
                  i.replace(/\d+\./g, '').replace(/\([^)]*\)/g, '').trim()
                )
              : []

            if (meal.categories === '조식' || meal.categories === 'breakfast')
              organized.breakfast = menuItems
            else if (meal.categories === '중식' || meal.categories === 'lunch')
              organized.lunch = menuItems
            else if (meal.categories === '석식' || meal.categories === 'dinner')
              organized.dinner = menuItems
          }
        }

        setMealData(organized)
      } catch {
        setMealData({ breakfast: [], lunch: [], dinner: [] })
      } finally {
        setLoading(false)
      }
    }

    fetchMealData()
  }, [currentDate])

  const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.targetTouches[0].clientX)
  const handleTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX)
  const handleTouchEnd = () => {
    const dist = touchStart - touchEnd
    if (dist > 50) {
      setDirection(1)
      if (selectedMeal === 'breakfast') setSelectedMeal('lunch')
      else if (selectedMeal === 'lunch') setSelectedMeal('dinner')
      else {
        const next = new Date(currentDate)
        next.setDate(next.getDate() + 1)
        setCurrentDate(next)
        setSelectedMeal('breakfast')
      }
    } else if (dist < -50) {
      setDirection(-1)
      if (selectedMeal === 'breakfast') {
        const prev = new Date(currentDate)
        prev.setDate(prev.getDate() - 1)
        setCurrentDate(prev)
        setSelectedMeal('dinner')
      } else if (selectedMeal === 'lunch') setSelectedMeal('breakfast')
      else setSelectedMeal('lunch')
    }
    setTouchStart(0)
    setTouchEnd(0)
  }

  const handleNextMeal = () => {
    setDirection(1)
    if (selectedMeal === 'breakfast') setSelectedMeal('lunch')
    else if (selectedMeal === 'lunch') setSelectedMeal('dinner')
    else {
      const next = new Date(currentDate)
      next.setDate(next.getDate() + 1)
      setCurrentDate(next)
      setSelectedMeal('breakfast')
    }
  }

  const handlePrevMeal = () => {
    setDirection(-1)
    if (selectedMeal === 'breakfast') {
      const prev = new Date(currentDate)
      prev.setDate(prev.getDate() - 1)
      setCurrentDate(prev)
      setSelectedMeal('dinner')
    } else if (selectedMeal === 'lunch') setSelectedMeal('breakfast')
    else setSelectedMeal('lunch')
  }

  const currentMenu = mealData ? mealData[selectedMeal] || [] : []
  
  const isBookmarked = (item: string) => {
    return bookmarks.some(bookmark => {
      const normalizedItem = item.toLowerCase().replace(/\s+/g, '')
      const normalizedBookmark = bookmark.toLowerCase().replace(/\s+/g, '')
      return normalizedItem.includes(normalizedBookmark) || normalizedBookmark.includes(normalizedItem)
    })
  }

  const bgGradient = settings.darkMode
    ? "bg-gradient-to-b from-[#000000] to-[#4325A5]"
    : "bg-gradient-to-b from-[#f0f0f0] to-[#d0d0ff]"
  const textColor = settings.highContrastMode ? "text-white" : "text-gray-200"
  const cardBg = settings.highContrastMode ? "bg-[#1a1a2e]/30" : "bg-[#2a2a3e]/30"

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0,
      rotate: dir > 0 ? 10 : -10
    }),
    center: {
      x: 0,
      opacity: 1,
      rotate: 0,
      transition: { type: "spring" as const, stiffness: 260, damping: 25 }
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -300 : 300,
      opacity: 0,
      rotate: dir > 0 ? -10 : 10,
      transition: { duration: 0.3 }
    }),
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className={`flex-1 pt-5 pb-24 ${bgGradient} relative flex flex-col`}>
        <div className="flex justify-end mb-4">
          <div className="flex">
            <Button
              variant="ghost"
              size="icon"
              className={`${textColor} hover:bg-white/10`}
              onClick={() => onNavigate("bookmark")}
            >
              <Bookmark className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`${textColor} hover:bg-white/10`}
              onClick={() => onNavigate("settings")}
            >
              <MoreVertical className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="text-center mb-2">
          <h1 className={`text-xl font-bold ${textColor} mb-1`}>
            {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월 {currentDate.getDate()}일
          </h1>
          <p className={`${textColor} opacity-50 text-xs mb-10`}>대덕소프트웨어마이스터고등학교</p>
        </div>
        <div
          className="flex items-center justify-center overflow-hidden relative"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div 
            className="absolute left-0 top-0 bottom-0 w-[15%] z-10 cursor-pointer"
            onClick={handlePrevMeal}
          />
          
          <div 
            className="absolute right-0 top-0 bottom-0 w-[15%] z-10 cursor-pointer"
            onClick={handleNextMeal}
          />

          <div className="relative font-bold w-[80%] h-[350px]">
            <AnimatePresence custom={direction}>
              <motion.div
                key={selectedMeal + currentDate.toDateString()}
                className={`absolute w-full h-full ${cardBg} backdrop-blur-ls rounded-3xl p-5 border ${
                  settings.highContrastMode ? 'border-white/20' : 'border-white/10'
                } flex flex-col justify-center`}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                {loading ? (
                  <div className={`text-center py-8 ${textColor} opacity-70`}>급식 정보를 불러오는 중...</div>
                ) : currentMenu.length > 0 ? (
                  <div className="space-y-2.5 text-center flex flex-col mt-4">
                    {currentMenu.map((item, i) => (
                      <p
                        key={i}
                        className={`text-lg font-large tracking-wide ${
                          isBookmarked(item)
                            ? 'text-[#5B9FFF] font-bold'
                            : textColor
                        }`}
                      >
                        {item}
                      </p>
                    ))}
                  </div>
                ) : (
                  <div className={`text-center py-8 ${textColor} opacity-50`}>
                    {mealNames[selectedMeal]} 정보가 없습니다
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="fixed bottom-28 left-4 text-xs text-white/40">
          <div>북마크: {bookmarks.length}개</div>
          <div>다크모드: {settings.darkMode ? 'ON' : 'OFF'}</div>
          <div>고대비: {settings.highContrastMode ? 'ON' : 'OFF'}</div>
          <div>시간표시: {settings.timeDisplay ? 'OFF' : 'ON'}</div>
        </div>
      </div>

      <BottomNav currentTab="meal" onNavigate={onNavigate} />
      {showDateModal && <DateModal onClose={() => setShowDateModal(false)} />}
    </div>
  )
}
