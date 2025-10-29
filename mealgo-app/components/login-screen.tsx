"use client"

import { Button } from "@/components/ui/button"
import Image from "next/image"; // Image 컴포넌트는 이미 임포트되어 있습니다.

interface LoginScreenProps {
  onNext: () => void
}

export function LoginScreen({ onNext }: LoginScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-[17px]">
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <img src="/logos/mealgo_logo.svg" className="h-20 flex-1 m-auto" alt="mealgo logo" />
          <h1 className="text-3xl font-medium text-white ">mealgo</h1>
          <p className="text-white text-[12px] font-medium">통합로그인</p>
        </div>
      </div>

      <div className="w-full pb-[33px]">
        <Button
          onClick={onNext}
          className="w-full bg-white text-black hover:bg-gray-100 h-14 rounded-[5px] font-[600] text-base flex items-center justify-center gap-3"
        >
          <Image 
            src="/logos/google.png" 
            alt="구글 이미지" 
            width={20} 
            height={20}
          />
          구글 로그인
        </Button>
      </div>
    </div>
  )
}