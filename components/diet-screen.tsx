"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BottomNav } from "@/components/bottom-nav"
import { TagDeleteModal } from "@/components/tag-delete-modal"

interface DietScreenProps {
  onNavigate: (screen: "meal" | "diet" | "bookmark" | "settings") => void
}

interface CalorieData {
  date: string
  totalCalorie: number
  percentage: number
}

export function DietScreen({ onNavigate }: DietScreenProps) {
  const [percentage, setPercentage] = useState("100")
  const [note, setNote] = useState("")
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [todayCalorie, setTodayCalorie] = useState(0)
  const [yesterdayCalorie, setYesterdayCalorie] = useState(0)
  const [loading, setLoading] = useState(true)
  const [consumedPercentage, setConsumedPercentage] = useState(100)
  const [calorieHistory, setCalorieHistory] = useState<CalorieData[]>([])

  const API_KEY = 'fd185d8332d34309a4d21107f1927ffe'
  const ATPT_OFCDC_SC_CODE = 'G10'
  const SD_SCHUL_CODE = '7430310'

  // 오늘과 어제 날짜 계산
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const formatDate = (date: Date) => {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}${m}${d}`
  }

  const formatDisplayDate = (date: Date) => {
    return `${date.getMonth() + 1}월 ${date.getDate()}일`
  }

  // 칼로리 정보 가져오기
  useEffect(() => {
    const fetchCalorieData = async () => {
      setLoading(true)
      try {
        // 오늘 칼로리
        const todayData = await fetchDayCalorie(formatDate(today))
        setTodayCalorie(todayData)

        // 어제 칼로리
        const yesterdayData = await fetchDayCalorie(formatDate(yesterday))
        setYesterdayCalorie(yesterdayData)

        // 저장된 섭취 기록 불러오기
        const saved = localStorage.getItem('calorieHistory')
        if (saved) {
          try {
            const history = JSON.parse(saved)
            setCalorieHistory(history)
            
            // 오늘 섭취 기록 찾기
            const todayRecord = history.find((h: CalorieData) => h.date === formatDate(today))
            if (todayRecord) {
              setConsumedPercentage(todayRecord.percentage)
              setPercentage(String(todayRecord.percentage))
            }
          } catch {}
        }
      } catch (error) {
        console.error('칼로리 정보 불러오기 실패:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCalorieData()
  }, [])

  // 특정 날짜의 칼로리 가져오기
  const fetchDayCalorie = async (date: string) => {
    try {
      const res = await fetch(
        `https://open.neis.go.kr/hub/mealServiceDietInfo?KEY=${API_KEY}&Type=json&ATPT_OFCDC_SC_CODE=${ATPT_OFCDC_SC_CODE}&SD_SCHUL_CODE=${SD_SCHUL_CODE}&MLSV_YMD=${date}`
      )
      const data = await res.json()
      
      if (data.mealServiceDietInfo) {
        const meals = data.mealServiceDietInfo[1].row
        let totalCalorie = 0
        
        for (const meal of meals) {
          // CAL_INFO에서 칼로리 추출 (예: "600 Kcal" -> 600)
          if (meal.CAL_INFO) {
            const calMatch = meal.CAL_INFO.match(/[\d.]+/)
            if (calMatch) {
              totalCalorie += parseFloat(calMatch[0])
            }
          }
        }
        
        return totalCalorie
      }
      return 0
    } catch {
      return 0
    }
  }

  // 칼로리 계산 및 저장
  const handleCalculate = () => {
    const inputPercentage = parseFloat(percentage)
    
    if (isNaN(inputPercentage) || inputPercentage < 0 || inputPercentage > 100) {
      alert('0~100 사이의 숫자를 입력해주세요')
      return
    }

    setConsumedPercentage(inputPercentage)

    // 기록 저장
    const newRecord: CalorieData = {
      date: formatDate(today),
      totalCalorie: todayCalorie,
      percentage: inputPercentage
    }

    const updatedHistory = calorieHistory.filter(h => h.date !== formatDate(today))
    updatedHistory.push(newRecord)
    
    setCalorieHistory(updatedHistory)
    localStorage.setItem('calorieHistory', JSON.stringify(updatedHistory))

    if (note.trim()) {
      localStorage.setItem(`note_${formatDate(today)}`, note)
    }

    alert('저장되었습니다!')
  }

  // 실제 섭취 칼로리 계산
  const actualConsumedCalorie = Math.round((todayCalorie * consumedPercentage) / 100)
  const actualYesterdayCalorie = yesterdayCalorie

  // 어제와의 차이 계산
  const calorieDiff = actualConsumedCalorie - actualYesterdayCalorie
  const percentDiff = yesterdayCalorie > 0 
    ? Math.round(((calorieDiff) / yesterdayCalorie) * 100)
    : 0

  const isLess = calorieDiff < 0
  const emoji = <img src="/logos/fireball.svg" className="h-30 flex-2" alt="mealgo logo" />

  return (  
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#000000] to-[#4325A5]">
      <div className="flex-1 px-6 pt-12 pb-24">
        <h2 className="text-lg font-medium text-white mb-4">
          {formatDisplayDate(today)} 급식은 어제 급식보다
        </h2>

        <div className="bg-black/50 backdrop-blur-sm rounded-3xl p-8 mb-4 relative overflow-hidden border-2 border-white/20">
          {loading ? (
            <div className="text-center py-8 text-white/70">
              <p>칼로리 정보를 불러오는 중...</p>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-6xl font-bold text-white mb-2">
                  {Math.abs(percentDiff)}%
                </p>
                <p className={`${isLess ? 'text-blue-400' : 'text-red-400'} text-sm`}>
                  <span className="font-semibold">{Math.abs(calorieDiff).toFixed(1)}kcal</span> {isLess ? '줄어듦' : '늘어남'}
                </p>
<p className="text-white/50 text-xs mt-2">
  어제: {actualYesterdayCalorie.toFixed(1)}kcal → 오늘: {actualConsumedCalorie.toFixed(1)}kcal
</p>
              </div>
              <div className="text-6xl">{emoji}</div>
            </div>
          )}
        </div>

        <div className="bg-black/50 backdrop-blur-sm rounded-3xl p-6 border-2 border-white/20">
          <h4 className="text-purple-700  text-xl font-bold mb-2">칼로리 계산기</h4>
          <p className="text-white/60 text-sm mb-4">
          오늘 급식 총 칼로리: <span className="font-bold text-white">{todayCalorie.toFixed(1)}kcal</span>
          </p>

          <div className="flex gap-3 mb-4">
            <div className="flex-1 relative">
              <Input
                type="number"
                value={percentage}
                onChange={(e) => setPercentage(e.target.value)}
                className="w-full h-12 bg-transparent border-2 text-white text-center text-lg font-medium"
                placeholder="0-100"
                min="0"
                max="100"
              />
            </div>
            <Button 
              onClick={handleCalculate}
              className="h-12 px-8 bg-white text-black hover:bg-gray-100 rounded-xl font-bold"
            >
              확인
            </Button>
          </div>

          <div className="bg-white/10 rounded-xl p-3 mb-4">
            <p className="text-white/70 text-xs mb-1">예상 섭취 칼로리</p>
            <p className="text-white text-2xl font-bold">
              {Math.round((todayCalorie * parseFloat(percentage || '0')) / 100)}kcal
            </p>
          </div>
        </div>

        {/* 최근 기록 표시 */}
        {calorieHistory.length > 0 && (
          <div className="mt-6">
            <h4 className="text-white/70 text-sm mb-3">최근 기록</h4>
            <div className="space-y-2">
              {calorieHistory.slice(-3).reverse().map((record, idx) => (
                <div 
                  key={idx}
                  className="bg-white/5 rounded-xl p-3 flex justify-between items-center"
                >
                  <div>
                    <p className="text-white font-medium">
                      {record.date.substring(4, 6)}월 {record.date.substring(6, 8)}일
                    </p>
                    <p className="text-white/60 text-sm">
                      {record.percentage}% 섭취 ({Math.round((record.totalCalorie * record.percentage) / 100)}kcal)
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      <BottomNav currentTab="diet" onNavigate={onNavigate} />
      </div>


      {showDeleteModal && <TagDeleteModal onClose={() => setShowDeleteModal(false)} />}
    </div>
  )
}