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

const DEFAULT_SETTINGS: Settings = {
  darkMode: true,
  preferredMenuAlert: true,
  timeDisplay: false,
  highContrastMode: true,
  grade: "1",
  className: "1"
}

export function MealScreen({ onNavigate }: MealScreenProps) {
  const [showDateModal, setShowDateModal] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedMeal, setSelectedMeal] = useState<'breakfast' | 'lunch' | 'dinner'>(() => {
    const hour = new Date().getHours()
    if (hour < 8) return 'breakfast'
    if (hour < 13) return 'lunch'
    return 'dinner'
  })
  const [mealData, setMealData] = useState<MealData>({
    breakfast: [],
    lunch: [],
    dinner: []
  })
  const [mealCalories, setMealCalories] = useState<MealCalories>({
    breakfast: '',
    lunch: '',
    dinner: ''
  })
  const [loadingMeals, setLoadingMeals] = useState(true)
  const [loadingTimetable, setLoadingTimetable] = useState(true)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const [direction, setDirection] = useState(0)
  const [bookmarks, setBookmarks] = useState<any[]>([])
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [timetable, setTimetable] = useState<any[]>([])
  const [isClient, setIsClient] = useState(false)

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

  // localStorage에서 북마크 로드
  useEffect(() => {
    if (!isClient) return

    const loadBookmarks = () => {
      try {
        const savedBookmarks = localStorage.getItem("mealBookmarks")
        if (savedBookmarks) {
          setBookmarks(JSON.parse(savedBookmarks))
        }
      } catch (error) {
        console.error("Failed to load bookmarks:", error)
      }
    }

    loadBookmarks()
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
      if (e.key === "mealBookmarks" && e.newValue) {
        try {
          setBookmarks(JSON.parse(e.newValue))
        } catch (error) {
          console.error("Failed to parse bookmarks from storage event:", error)
        }
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [isClient])

  // localStorage에 설정 저장
  useEffect(() => {
    if (!isClient) return

    try {
      localStorage.setItem("mealAppSettings", JSON.stringify(settings))
    } catch (error) {
      console.error("Failed to save settings:", error)
    }
  }, [settings, isClient])

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
            const maxPeriod = Math.max(...Object.keys(byPeriod).map(k => parseInt(k)).filter(n => !isNaN(n)), 7)
            for (let p = 1; p <= (maxPeriod || 7); p++) {
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

  // 다크모드에 따른 스타일 변수
  // 고대비는 나중에 디자인 나오면 수정하세요
  const bgGradient = settings.darkMode
    ? "bg-gradient-to-b from-[#000000] to-[#4325A5]"
    : "bg-gradient-to-b from-[#FFFFFF] to-[#8A6FE3]"
  
  const iconColor = settings.darkMode
    ? (settings.highContrastMode ? "text-white hover:bg-white/10" : "text-white hover:bg-white/10")
    : (settings.highContrastMode ? "text-[#888888] hover:text-[#888888] hover:bg-black/10" : "text-[#888888] hover:text-[#888888] hover:bg-black/10")

  const titleTextColor = settings.darkMode
    ? (settings.highContrastMode ? "text-white" : "text-white")
    : (settings.highContrastMode ? "text-[#3C2887]" : "text-[#3C2887]")
  
  const textColor = settings.darkMode
    ? (settings.highContrastMode ? "text-white" : "text-white")
    : (settings.highContrastMode ? "text-black" : "text-black")
  const cardBg = settings.darkMode
    ? (settings.highContrastMode ? "bg-[#1a1a2e]/30" : "bg-[#2a2a3e]/30")
    : "bg-white/80"
  
  const cardStyle = settings.darkMode
    ? "bg-[#0e0f2b] border-white/20 shadow-[0_0_30px_#3f2b96]"
    : "bg-white border-gray-300 shadow-xl"
  
  const timetableCardStyle = settings.darkMode
    ? "bg-[#0e0f2b]"
    : "bg-white"
  
  const timetableBorderStyle = settings.darkMode
    ? (settings.highContrastMode ? 'border-white/20' : 'border-white/10')
    : 'border-gray-300'
  
  const timetableShadowStyle = settings.darkMode
    ? 'shadow-[0_0_40px_#3f2b96]'
    : 'shadow-xl'
  
  const selectStyle = settings.darkMode
    ? 'bg-transparent border-white/20 text-white/90'
    : 'bg-white border-gray-300 text-gray-800'

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

  const goGoogleSearch = (keyword: string) => {
    const url = `https://www.google.com/search?q=${encodeURIComponent(keyword)}`
    window.open(url, "_blank")
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className={`flex-1 pt-5 pb-24 ${bgGradient} relative flex flex-col`}>
        <div className="flex justify-end mb-6">
          <div className="flex">
            <Button
              variant="ghost"
              size="icon"
              className={`${iconColor} w-12 h-12`}
              onClick={() => onNavigate("bookmark")}
            >
              <Bookmark className="w-5.5! h-5.5!" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`${iconColor} w-12 h-12`}
              onClick={() => onNavigate("settings")}
            >
              <MoreVertical className="w-6! h-6!" />
            </Button>
          </div>
        </div>

        <div className="text-center mb-2">
          <h1 className={`text-xl font-bold ${titleTextColor} mb-1`}>
            {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월 {currentDate.getDate()}일
          </h1>
          <p className={`${titleTextColor} text-base mb-4 opacity-80 font-light`}>대덕소프트웨어마이스터고등학교</p>
        </div>

        <div
          className="relative w-[75%] max-w-md mx-auto font-bold min-h-[400px] rounded-3xl"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="absolute left-0 top-0 bottom-0 w-[15%] z-10 cursor-pointer" onClick={handlePrevMeal} />
          <div className="absolute right-0 top-0 bottom-0 w-[15%] z-10 cursor-pointer" onClick={handleNextMeal} />

          <div>
            <AnimatePresence custom={direction}>
              <motion.div
                key={selectedMeal + currentDate.toDateString()}
                className={`absolute w-full h-full ${cardBg} ${cardStyle} rounded-3xl border flex flex-col justify-start`}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                {/* 헤더 */}
                <div className="flex items-center justify-between p-4 px-7">
                  <div className={`text-2xl font-bold ${mealColors[selectedMeal]}`}>
                    {mealNames[selectedMeal]}
                  </div>
                  {currentCalories && (
                    <div className={`text-sm ${textColor} opacity-70`}>
                      {currentCalories}
                    </div>
                  )}
                </div>

                {/* 메뉴 내용 */}
                <div className="flex-1 p-3 flex flex-col justify-center">
                  {loadingMeals ? (
                    <div className={`text-center py-8 ${textColor} opacity-70`}>급식 정보를 불러오는 중...</div>
                  ) : currentMenu.length > 0 ? (
                    <div className="space-y-3.5 text-center flex flex-col items-center">
                      {currentMenu.map((item, i) => (
                        <p
                          onClick={() => goGoogleSearch(item)}
                          key={i}
                          className={`text-xl inline-block font-large tracking-wide cursor-pointer ${
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
                    <div className={`text-center py-20 ${textColor} opacity-50`}>
                      {mealNames[selectedMeal]} 정보가 없습니다
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div
          className={`min-h-[500px] w-[75%] max-w-md mx-auto mt-10 ${timetableCardStyle} rounded-3xl p-8 border ${timetableBorderStyle} ${timetableShadowStyle}`}
        >
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className={`${titleTextColor} font-medium text-lg`}>학년</div>
            <select
              value={settings.grade}
              onChange={(e) => setSettings((prev) => ({ ...prev, grade: e.target.value }))}
              className={`rounded-lg px-4 py-1.5 ${selectStyle} border focus:outline-none`}
            >
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
            </select>
            <div className={`${titleTextColor} font-medium text-lg`}>반</div>
            <select
              value={settings.className}
              onChange={(e) => setSettings((prev) => ({ ...prev, className: e.target.value }))}
              className={`rounded-lg px-4 py-1.5 ${selectStyle} border focus:outline-none`}
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
                    className={`text-base sm:text-lg md:text-xl font-semibold tracking-wide ${
                      subj ? textColor : 'text-gray-400'
                    }`}
                  >
                    {idx + 1}교시 - {subj || ' 없음 -'}
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
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <BottomNav currentTab="meal" onNavigate={onNavigate} />
      </div>
    </div>
  )
}