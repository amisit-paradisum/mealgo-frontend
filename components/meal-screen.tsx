"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion"
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
  const [selectedPeriod, setSelectedPeriod] = useState(0)
  const [periodDirection, setPeriodDirection] = useState(0)

  const scrollRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ container: scrollRef })
  const timetableOpacity = useTransform(scrollYProgress, [0.3, 0.5], [0, 1])
  const timetableY = useTransform(scrollYProgress, [0.3, 0.5], [50, 0])

  const API_KEY = 'fd185d8332d34309a4d21107f1927ffe'
  const ATPT_OFCDC_SC_CODE = 'G10'
  const SD_SCHUL_CODE = '7430310'

  const mealNames = {
    breakfast: '조식',
    lunch: '중식',
    dinner: '석식',
  }

  // 더미 시간표 데이터
  const dummyTimetable = [
    { period: 1, subject: '수학', teacher: '김수학' },
    { period: 2, subject: '영어', teacher: '이영어' },
    { period: 3, subject: '국어', teacher: '박국어' },
    { period: 4, subject: '과학', teacher: '최과학' },
    { period: 5, subject: '체육', teacher: '정체육' },
    { period: 6, subject: '음악', teacher: '강음악' },
    { period: 7, subject: '미술', teacher: '윤미술' },
  ]

useEffect(() => {
  const fetchMealData = async () => {
    setLoading(true)
    const y = currentDate.getFullYear()
    const m = String(currentDate.getMonth() + 1).padStart(2, '0')
    const d = String(currentDate.getDate()).padStart(2, '0')
    const mlsvYmd = `${y}${m}${d}`

    const cached = localStorage.getItem(`mealData_${mlsvYmd}`)
    if (cached) {
      setMealData(JSON.parse(cached))
      setLoading(false)
      return
    }

    try {
      const { data } = await axios.get("https://open.neis.go.kr/hub/mealServiceDietInfo", {
        params: {
          KEY: API_KEY,
          Type: "json",
          ATPT_OFCDC_SC_CODE,
          SD_SCHUL_CODE,
          MLSV_YMD: mlsvYmd,
        },
      })

      const organized: MealData = { breakfast: [], lunch: [], dinner: [] }

      if (data.mealServiceDietInfo) {
        const meals = data.mealServiceDietInfo[1].row
        for (const meal of meals) {
          const menuItems = meal.DDISH_NM
            .split('<br/>')
            .map(i => i.replace(/\d+\./g, '').replace(/\([^)]*\)/g, '').trim())
            .filter(Boolean)

          if (meal.MMEAL_SC_NM === '조식') organized.breakfast = menuItems
          else if (meal.MMEAL_SC_NM === '중식') organized.lunch = menuItems
          else if (meal.MMEAL_SC_NM === '석식') organized.dinner = menuItems
        }
      }

      setMealData(organized)
      localStorage.setItem(`mealData_${mlsvYmd}`, JSON.stringify(organized))
    } catch (err) {
      console.error("급식 데이터 불러오기 실패:", err)
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

  const handleTimetableTouchStart = (e: React.TouchEvent) => setTouchStart(e.targetTouches[0].clientX)
  const handleTimetableTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX)
  const handleTimetableTouchEnd = () => {
    const dist = touchStart - touchEnd
    if (dist > 50) {
      setPeriodDirection(1)
      if (selectedPeriod < dummyTimetable.length - 1) {
        setSelectedPeriod(selectedPeriod + 1)
      }
    } else if (dist < -50) {
      setPeriodDirection(-1)
      if (selectedPeriod > 0) {
        setSelectedPeriod(selectedPeriod - 1)
      }
    }
    setTouchStart(0)
    setTouchEnd(0)
  }

  // 클릭으로 다음 메뉴 이동
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

  // 클릭으로 이전 메뉴 이동
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

  // 클릭으로 다음 교시 이동
  const handleNextPeriod = () => {
    setPeriodDirection(1)
    if (selectedPeriod < dummyTimetable.length - 1) {
      setSelectedPeriod(selectedPeriod + 1)
    }
  }

  // 클릭으로 이전 교시 이동
  const handlePrevPeriod = () => {
    setPeriodDirection(-1)
    if (selectedPeriod > 0) {
      setSelectedPeriod(selectedPeriod - 1)
    }
  }

  const currentMenu = mealData ? mealData[selectedMeal] || [] : []
  const currentPeriodData = dummyTimetable[selectedPeriod]
  
  // 북마크 체크 함수 개선 - 부분 문자열 매칭
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
      transition: { type: "spring", stiffness: 260, damping: 25 }
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
      <div 
        ref={scrollRef} 
        className={`flex-1 pt-5 pb-24 ${bgGradient} relative overflow-y-auto`}
      >
        <div className="flex justify-end mb-4 px-4">
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
          <p className={`${textColor} opacity-50 text-xs mb-5`}>대덕소프트웨어마이스터고등학교</p>
        </div>

        <div
          className="flex items-center justify-center overflow-hidden relative min-h-[400px]"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* 왼쪽 클릭 영역 - 이전 메뉴 */}
          <div 
            className="absolute left-0 top-0 bottom-0 w-[15%] z-10 cursor-pointer"
            onClick={handlePrevMeal}
          />
          
          {/* 오른쪽 클릭 영역 - 다음 메뉴 */}
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
                  <div className="space-y-2.5 text-center flex flex-col">
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

        {/* 시간표 섹션 */}
        <motion.div 
          className="mt-16 px-4 pb-8"
          style={{ opacity: timetableOpacity, y: timetableY }}
        >
          <div className="text-center mb-6">
            <h2 className={`text-xl font-bold ${textColor} mb-1`}>오늘의 시간표</h2>
          </div>

          <div className={`${cardBg} backdrop-blur-ls rounded-3xl p-6 border ${
            settings.highContrastMode ? 'border-white/20' : 'border-white/10'
          }`}>
            <div className="space-y-3">
              {dummyTimetable.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`flex items-center gap-4 p-3 rounded-2xl transition-colors ${
                    idx === selectedPeriod 
                      ? settings.highContrastMode ? 'bg-white/20' : 'bg-white/15'
                      : 'hover:bg-white/10'
                  }`}
                  onClick={() => {
                    setPeriodDirection(idx > selectedPeriod ? 1 : -1)
                    setSelectedPeriod(idx)
                  }}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                    idx === selectedPeriod
                      ? 'bg-[#5B9FFF]'
                      : settings.highContrastMode ? 'bg-white/15' : 'bg-white/10'
                  }`}>
                    <span className={`text-lg font-bold ${textColor}`}>{item.period}</span>
                  </div>
                  <div className="flex-1">
                    <p className={`text-lg font-bold ${textColor} mb-0.5`}>
                      {item.subject}
                    </p>
                    <p className={`text-sm ${textColor} opacity-60`}>
                      {item.teacher} 선생님
                    </p>
                  </div>
                  {idx === selectedPeriod && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-2 h-2 rounded-full bg-[#5B9FFF]"
                    />
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

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