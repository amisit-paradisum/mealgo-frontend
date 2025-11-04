"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface OnboardingGradeScreenProps {
  onNext: () => void
}

export function OnboardingGradeScreen({ onNext }: OnboardingGradeScreenProps) {
  const [grade, setGrade] = useState(0)
  const [classNum, setClassNum] = useState(0)
  // ⭐️ classCount를 사용하여 반의 개수를 설정합니다. (현재 4개)
  let classCount = 10; 

  // ⭐️ classCount 수만큼 옵션을 생성하는 배열을 만듭니다.
  const classOptions = Array.from({ length: classCount }, (_, i) => i + 1);

  return (
    <div className="flex flex-col min-h-screen px-[17px] pt-[39px]">
      <div> 
        <h1 className="text-[24px] font-bold text-white mb-[22px]">학년과 반을 알려주세요</h1>
        <div className="relative mb-[10px]">
          <p className="text-[16px] font-medium text-white mb-[8px]">학년</p>
          <select
            value={grade}
            onChange={(e) => setGrade(Number(e.target.value))}
            className="w-full h-[66px] text-[14px] px-[20px] bg-black border border-white rounded-[8px] text-white appearance-none pr-12"
          >
            <option value={0} disabled hidden>학년을 알려주세요</option>
            <option value={1}>1학년</option>
            <option value={2}>2학년</option>
            <option value={3}>3학년</option>
          </select>
          <img
            src="/icons/dropdown.svg"
            alt="드롭다운 아이콘"
            className="absolute right-4 top-[65%] -translate-y-1/2 w-[13.3px] h-[7.66px]"
          />
        </div>
        <div className="relative">
          <p className="text-[16px] font-medium text-white mb-[8px]">반</p> {/* ⭐️ 텍스트 수정 */}
          <select
            value={classNum}
            onChange={(e) => setClassNum(Number(e.target.value))}
            className="w-full h-[66px] text-[14px] px-[20px] bg-black border border-white rounded-[8px] text-white appearance-none pr-12"
          >
            <option value={0} disabled hidden>반을 알려주세요</option>
            {/* ⭐️ classCount에 따라 동적으로 옵션 생성 */}
            {classOptions.map((num) => (
              <option key={num} value={num}>{num}반</option>
            ))}
          </select>
          <img
            src="/icons/dropdown.svg"
            alt="드롭다운 아이콘"
            className="absolute right-4 top-[65%] -translate-y-1/2 w-[13.3px] h-[7.66px]"
          />
        </div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center opacity-[0.24]">
          <img src="/logos/mealgo_logo.svg" alt="mealgo logo w-[114.58] h-[104.23]"/>
          <h1 className="text-[34px] font-medium text-white ">mealgo</h1>
      </div>
      <div className="pb-8">
        <Button
          onClick={onNext}
          disabled={grade === 0 || classNum === 0}
          className="w-full bg-black text-white hover:bg-black/90 h-14 rounded-[8px] font-bold text-base"
        >
          NEXT
        </Button>
      </div>
    </div>
  )
}