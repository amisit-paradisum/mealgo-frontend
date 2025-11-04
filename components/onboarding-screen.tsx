"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface OnboardingScreenProps {
  onNext: () => void
}

export function OnboardingScreen({ onNext }: OnboardingScreenProps) {
  const [school, setSchool] = useState("")

  return (
    <div className="flex flex-col min-h-screen px-[17px] pt-[39px]">
      
      {/* 1. 상단 콘텐츠 (고정 영역) */}
      <div> 
        <h1 className="text-[22px] font-bold text-white mb-[17px]">학교를 입력해주세요</h1>
        <div className="relative mb-8">
          <Input
            value={school}
            onChange={(e) => setSchool(e.target.value)}
            placeholder="학교이름을 검색해주세요"
            className="w-full h-[66px] text-[14px] bg-black border-1 border-white rounded-[8px] text-white placeholder:text-white"
          />
          <img src="/icons/MdSearch.svg" alt="검색 아이콘" className="absolute right-4 top-1/2 -translate-y-1/2 text-white w-[40px] h-[40px]" />
        </div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center opacity-[0.24]">
          <img src="/logos/mealgo_logo.svg" alt="mealgo logo w-[114.58] h-[104.23]"/>
          <h1 className="text-[34px] font-medium text-white ">mealgo</h1>
      </div>
      <div className="pb-8">
        <Button
          onClick={onNext}
          disabled={!school.trim()}
          className={`w-full h-14 rounded-[8px] font-bold text-base ${
              school.trim()
                ? "bg-black text-white hover:bg-black/90"
                : "bg-gray-300 text-white cursor-not-allowed"
            }`}
        >
          NEXT
        </Button>
      </div>
    </div>
  )
}