"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Bookmark, MoreVertical } from "lucide-react"
import { BottomNav } from "@/components/bottom-nav"
import { DateModal } from "@/components/date-modal"

interface MealScreenProps {
  onNavigate: (screen: "meal" | "diet" | "bookmark" | "settings") => void
}

interface MealData {
  breakfast: string[]
  lunch: string[]
  dinner: string[]
}

export function MealScreen({ onNavigate }: MealScreenProps) {
  const [showDateModal, setShowDateModal] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedMeal, setSelectedMeal] = useState<'breakfast' | 'lunch' | 'dinner'>('lunch')
  const [mealData, setMealData] = useState<MealData | null>(null)
  const [loading, setLoading] = useState(true)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  
  // API 설정 (실제 값으로 변경하세요)
  const API_KEY = 'fd185d8332d34309a4d21107f1927ffe'
  const ATPT_OFCDC_SC_CODE = 'G10'
  const SD_SCHUL_CODE = '7430310'

  const days = ['일', '월', '화', '수', '목', '금', '토']
  
  const mealNames = {
    breakfast: '조식',
    lunch: '중식',
    dinner: '석식'
  }

  // 급식 데이터 가져오기
  useEffect(() => {
    const fetchMealData = async () => {
      setLoading(true)
      
      const year = currentDate.getFullYear()
      const month = String(currentDate.getMonth() + 1).padStart(2, '0')
      const day = String(currentDate.getDate()).padStart(2, '0')
      const mlsvYmd = `${year}${month}${day}`

      try {
        const response = await fetch(
          `https://open.neis.go.kr/hub/mealServiceDietInfo?KEY=${API_KEY}&Type=json&ATPT_OFCDC_SC_CODE=${ATPT_OFCDC_SC_CODE}&SD_SCHUL_CODE=${SD_SCHUL_CODE}&MLSV_YMD=${mlsvYmd}`
        )
        
        const data = await response.json()
        
        if (data.mealServiceDietInfo) {
          const meals = data.mealServiceDietInfo[1].row
          const organized: MealData = {
            breakfast: [],
            lunch: [],
            dinner: []
          }

          meals.forEach(meal => {
            const menuItems = meal.DDISH_NM
              .split('<br/>')
              .map(item => item.replace(/\d+\./g, '').replace(/\([^)]*\)/g, '').trim())
              .filter(item => item.length > 0)

            if (meal.MMEAL_SC_NM === '조식') {
              organized.breakfast = menuItems
            } else if (meal.MMEAL_SC_NM === '중식') {
              organized.lunch = menuItems
            } else if (meal.MMEAL_SC_NM === '석식') {
              organized.dinner = menuItems
            }
          })

          setMealData(organized)
        } else {
          // 샘플 데이터
          setMealData({
            breakfast: ['흰쌀밥', '된장찌개', '제육볶음', '시금치나물', '배추김치', '우유'],
            lunch: ['참쌀밥', '맑은콩나물국', '묵은지찜닭', '참부리감자만두', '배추김치', '과일주스'],
            dinner: ['흑미밥', '미역국', '고등어구이', '계란찜', '총각김치', '요구르트']
          })
        }
      } catch (err) {
        console.error('급식 데이터 로딩 실패:', err)
        // 에러 시 샘플 데이터
        setMealData({
          breakfast: ['흰쌀밥', '된장찌개', '제육볶음', '시금치나물', '배추김치', '우유'],
          lunch: ['참쌀밥', '맑은콩나물국', '묵은지찜닭', '참부리감자만두', '배추김치', '과일주스'],
          dinner: ['흑미밥', '미역국', '고등어구이', '계란찜', '총각김치', '요구르트']
        })
      } finally {
        setLoading(false)
      }
    }

    fetchMealData()
  }, [currentDate])

  // 스와이프 감지
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe) {
      // 왼쪽으로 스와이프 (다음 식사)
      if (selectedMeal === 'breakfast') {
        setSelectedMeal('lunch')
      } else if (selectedMeal === 'lunch') {
        setSelectedMeal('dinner')
      } else if (selectedMeal === 'dinner') {
        // 석식에서 다음날 조식으로
        const nextDay = new Date(currentDate)
        nextDay.setDate(nextDay.getDate() + 1)
        setCurrentDate(nextDay)
        setSelectedMeal('breakfast')
      }
    }

    if (isRightSwipe) {
      // 오른쪽으로 스와이프 (이전 식사)
      if (selectedMeal === 'breakfast') {
        // 조식에서 전날 석식으로
        const prevDay = new Date(currentDate)
        prevDay.setDate(prevDay.getDate() - 1)
        setCurrentDate(prevDay)
        setSelectedMeal('dinner')
      } else if (selectedMeal === 'lunch') {
        setSelectedMeal('breakfast')
      } else if (selectedMeal === 'dinner') {
        setSelectedMeal('lunch')
      }
    }

    setTouchStart(0)
    setTouchEnd(0)
  }

  const getCurrentMealMenu = () => {
    if (!mealData) return []
    return mealData[selectedMeal] || []
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* 메인 컨텐츠 영역 - 다크 그라데이션 배경 */}
      <div className="flex-1 pt-5 pb-24 bg-gradient-to-b from-[#000000] to-[#4325A5] relative flex flex-col">
        
        {/* 헤더 영역 - flex로 정렬 */}
        <div className="flex justify-end mb-4">
          <div className="flex">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
              <Bookmark className="w-5 h-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-white/10" 
              onClick={() => onNavigate("settings")}
            >
              <MoreVertical className="w-5 h-5" />
            </Button>
          </div>
        </div>
        
        {/* 날짜 및 학교명 헤더 - 중앙 정렬 */}
        <div className="text-center mb-2">
          <h1 className="text-xl font-bold text-white mb-1">
            {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월 {currentDate.getDate()}일
          </h1>
          <p className="text-white/50 text-xs">
            대덕소프트웨어마이스터고등학교
          </p>
        </div>

        {/* 식사 종류 표시 */}
        <div className="text-center mb-4">
          <p className="text-white/70 text-sm">
            {mealNames[selectedMeal]}
          </p>
          <p className="text-white/40 text-xs mt-1">
          </p>
        </div>

        {/* 급식 메뉴 카드 컨테이너 - 세로 가운데 정렬 */}
        <div 
          className="flex items-center justify-center "
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* 급식 메뉴 카드 - 보라색 글로우 효과 */}
          <div className="relative bg-[#1a1a2e] backdrop-blur-sm rounded-3xl p-5 w-[80%] border border-white/20 shadow-[0_0_10px_rgba(255,255,255,0.4),0_10px_20px_rgba(255,255,255,0.2)]">
            
            {loading ? (
              <div className="text-center py-8 text-white/70">
                급식 정보를 불러오는 중...
              </div>
            ) : getCurrentMealMenu().length > 0 ? (
              <>
                {/* 급식 메뉴 리스트 */}
                <div className="space-y-2.5 text-center flex flex-col mt-10 h-[100%]">
                  {getCurrentMealMenu().map((item, index) => (
                    <p 
                      key={index} 
                      className={`text-lg font-medium tracking-wide ${
                        index === getCurrentMealMenu().length - 1 ? 'text-[#5B9FFF]' : 'text-white'
                      }`}
                    >
                      {item}
                    </p>
                  ))}
                </div>

                {/* 칼로리 정보 - 구분선과 함께 */}
                <div className="relative mt-20 pt-5 border-t border-white/10">
                  <p className="text-white/70 text-center text-base">
                    980 kcal
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-white/50">
                {mealNames[selectedMeal]} 정보가 없습니다
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 하단 네비게이션 바 */}
      <BottomNav currentTab="meal" onNavigate={onNavigate} />

      {/* 날짜 선택 모달 (조건부 렌더링) */}
      {showDateModal && (
        <DateModal onClose={() => setShowDateModal(false)} />
      )}
    </div>
  )
}