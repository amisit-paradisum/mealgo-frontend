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

interface MealCalories {
  breakfast: string
  lunch: string
  dinner: string
}

interface Settings {
  darkMode: boolean
  preferredMenuAlert: boolean
  timeDisplay: boolean
  highContrastMode: boolean
  grade: string
  className: string
}

const API_KEY = 'fd185d8332d34309a4d21107f1927ffe'
const ATPT_OFCDC_SC_CODE = 'G10'
const SD_SCHUL_CODE = '7430310'

axios.defaults.headers.common["Content-Type"] = "application/json"

export function MealScreen({ onNavigate }: MealScreenProps) {
  const [showDateModal, setShowDateModal] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedMeal, setSelectedMeal] = useState<'breakfast' | 'lunch' | 'dinner'>(() => {
    const hour = new Date().getHours()
    if (hour < 8) return 'breakfast'
    if (hour < 13) return 'lunch'
    return 'dinner'
  })
  const [mealData, setMealData] = useState<MealData>({ breakfast: [], lunch: [], dinner: [] })
  const [mealCalories, setMealCalories] = useState<MealCalories>({ breakfast: '', lunch: '', dinner: '' })
  const [loadingMeals, setLoadingMeals] = useState(true)
  const [loadingTimetable, setLoadingTimetable] = useState(true)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const [direction, setDirection] = useState(0)
  const [bookmarks, setBookmarks] = useState<string[]>([])
  const [settings, setSettings] = useState<Settings>(() => {
    const raw = localStorage.getItem("mealAppSettings")
    if (raw) {
      try {
        const parsed = JSON.parse(raw)
        return {
          darkMode: parsed.darkMode ?? true,
          preferredMenuAlert: parsed.preferredMenuAlert ?? true,
          timeDisplay: parsed.timeDisplay ?? false,
          highContrastMode: parsed.highContrastMode ?? true,
          grade: parsed.grade ?? "1",
          className: parsed.className ?? "1",
        }
      } catch {
        return { darkMode: true, preferredMenuAlert: true, timeDisplay: false, highContrastMode: true, grade: "1", className: "1" }
      }
    }
    return { darkMode: true, preferredMenuAlert: true, timeDisplay: false, highContrastMode: true, grade: "1", className: "1" }
  })
  const [timetable, setTimetable] = useState<string[]>([])

  const mealNames = {
    breakfast: '조식',
    lunch: '중식',
    dinner: '석식',
  }

  const mealColors = {
    breakfast: 'text-blue-400',
    lunch: 'text-green-400',
    dinner: 'text-orange-400',
  }

  useEffect(() => {
    const savedBookmarks = localStorage.getItem("mealBookmarks")
    if (savedBookmarks) {
      try {
        setBookmarks(JSON.parse(savedBookmarks))
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

  useEffect(() => {
    localStorage.setItem("mealAppSettings", JSON.stringify(settings))
  }, [settings])

  useEffect(() => {
    const fetchMealData = async () => {
      setLoadingMeals(true)
      const y = currentDate.getFullYear()
      const m = String(currentDate.getMonth() + 1).padStart(2, '0')
      const d = String(currentDate.getDate()).padStart(2, '0')
      const formattedDate = `${y}${m}${d}`

      try {
        const res = await axios.get("https://open.neis.go.kr/hub/mealServiceDietInfo", {
          params: {
            KEY: API_KEY,
            Type: "json",
            ATPT_OFCDC_SC_CODE,
            SD_SCHUL_CODE,
            MLSV_YMD: formattedDate,
          },
        })

        const raw = res.data
        const organized: MealData = { breakfast: [], lunch: [], dinner: [] }
        const calories: MealCalories = { breakfast: '', lunch: '', dinner: '' }

        if (raw && raw.mealServiceDietInfo && Array.isArray(raw.mealServiceDietInfo)) {
          const body = raw.mealServiceDietInfo[1]
          if (body && Array.isArray(body.row)) {
            body.row.forEach((meal: any) => {
              const dish = (meal.DDISH_NM || "")
                .replace(/<br\/?>/gi, "\n")
                .split("\n")
                .map((s: string) => s.replace(/\d+\./g, '').replace(/\([^)]*\)/g, '').trim())
                .filter((t: string) => t)
              const category = (meal.MMEAL_SC_NM || "").toLowerCase()
              const cal = meal.CAL_INFO || ''
              
              if (category.includes('조식') || category.includes('breakfast')) {
                organized.breakfast = dish
                calories.breakfast = cal
              } else if (category.includes('중식') || category.includes('lunch')) {
                organized.lunch = dish
                calories.lunch = cal
              } else if (category.includes('석식') || category.includes('dinner')) {
                organized.dinner = dish
                calories.dinner = cal
              }
            })
          }
        }

        setMealData(organized)
        setMealCalories(calories)
      } catch {
        setMealData({ breakfast: [], lunch: [], dinner: [] })
        setMealCalories({ breakfast: '', lunch: '', dinner: '' })
      } finally {
        setLoadingMeals(false)
      }
    }

    fetchMealData()
  }, [currentDate])

  useEffect(() => {
    const fetchTimetable = async () => {
      setLoadingTimetable(true)
      const y = currentDate.getFullYear()
      const m = String(currentDate.getMonth() + 1).padStart(2, '0')
      const d = String(currentDate.getDate()).padStart(2, '0')
      const formattedDate = `${y}${m}${d}`

      try {
        const res = await axios.get("https://open.neis.go.kr/hub/hisTimetable", {
          params: {
            KEY: API_KEY,
            Type: "json",
            ATPT_OFCDC_SC_CODE,
            SD_SCHUL_CODE,
            ALL_TI_YMD: formattedDate,
            GRADE: settings.grade,
            CLASS_NM: settings.className,
          },
        })

        const raw = res.data
        let list: string[] = []

        if (raw && raw.hisTimetable && Array.isArray(raw.hisTimetable)) {
          const body = raw.hisTimetable[1]
          if (body && Array.isArray(body.row)) {
            const rows = body.row
            const byPeriod: { [k: string]: string } = {}
            rows.forEach((r: any) => {
              const period = r.PERIO || r.PERIO ? String(r.PERIO) : (r.I_TRT_SEQ || r.ITRT_CNTNT || "")
              const content = (r.ITRT_CNTNT || r.GSUBJECT_NM || "").trim()
              if (period) byPeriod[period] = content
            })
            const maxPeriod = Math.max(...Object.keys(byPeriod).map(k => parseInt(k)).filter(n => !isNaN(n)), 8)
            for (let p = 1; p <= (maxPeriod || 8); p++) {
              list.push(byPeriod[String(p)] || "")
            }
          }
        }

        setTimetable(list)
      } catch {
        setTimetable([])
      } finally {
        setLoadingTimetable(false)
      }
    }

    fetchTimetable()
  }, [currentDate, settings.grade, settings.className])

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
  const currentCalories = mealCalories[selectedMeal]

  const isBookmarked = (item: string) => {
    return bookmarks.some(bookmark => {
      const a = item.toLowerCase().replace(/\s+/g, '')
      const b = bookmark.toLowerCase().replace(/\s+/g, '')
      return a.includes(b) || b.includes(a)
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
    <div className="flex flex-col min-h-screen overflow-hidden">
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
          <p className={`${textColor} text-base mb-4 opacity-80 font-light`}>대덕소프트웨어마이스터고등학교</p>
        </div>

        <div
          className="flex items-center justify-center relative"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="absolute left-0 top-0 bottom-0 w-[15%] z-10 cursor-pointer" onClick={handlePrevMeal} />
          <div className="absolute right-0 top-0 bottom-0 w-[15%] z-10 cursor-pointer" onClick={handleNextMeal} />

          <div className="relative font-bold w-[75%] min-h-[350px] h-[400px] rounded-3xl">
            <div className={`${cardBg} bg-[#0e0f2b] rounded-3xl border flex flex-col justify-start overflow-hidden border-white/20 shadow-[0_0_30px_#3f2b96] h-full`}>
              <div className="flex items-center justify-between p-5 px-7 border-b border-white/10">
                <div className={`text-2xl font-bold ${mealColors[selectedMeal]}`}>
                  {mealNames[selectedMeal]}
                </div>
                {currentCalories && (
                  <div className={`text-sm ${textColor} opacity-70`}>
                    {currentCalories}
                  </div>
                )}
              </div>

              <div className="relative flex-1 overflow-hidden">
                <AnimatePresence custom={direction}>
                  <motion.div
                    key={selectedMeal + currentDate.toDateString()}
                    className="absolute w-full h-full p-5 flex flex-col justify-center"
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                  >
                    {loadingMeals ? (
                      <div className={`text-center py-8 ${textColor} opacity-70`}>급식 정보를 불러오는 중...</div>
                    ) : currentMenu.length > 0 ? (
                      <div className="space-y-2.5 text-center flex flex-col">
                        {currentMenu.map((item, i) => (
                          <p
                            key={i}
                            className={`text-lg font-large tracking-wide ${
                              isBookmarked(item) ? 'text-[#5B9FFF] font-bold' : textColor
                            }`}
                          >
                            {item}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <div className={`text-center py-20 ${textColor} opacity-50`}>
                        {mealNames[selectedMeal]} 정보가 없습니다
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        <div
          className={`w-[75%] max-w-md mx-auto mt-10 bg-[#0e0f2b] rounded-3xl p-8 border ${
            settings.highContrastMode ? 'border-white/20' : 'border-white/10'
          } shadow-[0_0_40px_#3f2b96]`}
        >
          <div className="flex items-center justify-center gap-4 mb-8 text-white/90">
            <div className={`${textColor} font-medium text-lg`}>학년</div>
            <select
              value={settings.grade}
              onChange={(e) => setSettings((prev) => ({ ...prev, grade: e.target.value }))}
              className="rounded-lg px-3 py-1.5 bg-transparent border border-white/20 text-white/90 focus:outline-none"
            >
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
            </select>
            <div className={`${textColor} font-medium text-lg`}>반</div>
            <select
              value={settings.className}
              onChange={(e) => setSettings((prev) => ({ ...prev, className: e.target.value }))}
              className="rounded-lg px-3 py-1.5 bg-transparent border border-white/20 text-white/90 focus:outline-none"
            >
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
            </select>
          </div>

          <div>
            {loadingTimetable ? (
              <div className={`${textColor} opacity-70 text-lg text-center py-6`}>
                시간표 정보를 불러오는 중...
              </div>
            ) : timetable.length > 0 ? (
              <div className="space-y-6 text-left">
                {timetable.map((subj, idx) => (
                  <div
                    key={idx}
                    className={`${textColor} text-base sm:text-lg md:text-xl font-semibold tracking-wide`}
                  >
                    {idx + 1}교시 - {subj || '-'}
                  </div>
                ))}
              </div>
            ) : (
              <div className={`${textColor} opacity-50 text-lg text-center py-6`}>
                해당일 시간표 정보가 없습니다
              </div>
            )}
          </div>
        </div>
      </div>
      <BottomNav currentTab="meal" onNavigate={onNavigate} />
    </div>
  )
}