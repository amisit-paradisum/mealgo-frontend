"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar } from "lucide-react"

interface DateModalProps {
  onClose: () => void
}

export function DateModal({ onClose }: DateModalProps) {
  const [date, setDate] = useState("2025년 10월 11일")

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center px-6 z-50">
      <div className="bg-white rounded-3xl p-6 w-full max-w-sm">
        <h2 className="text-xl font-bold text-gray-900 text-center mb-6">날짜 설정</h2>

        <div className="relative mb-6">
          <Input
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full h-14 bg-gray-100 border-0 rounded-xl text-gray-900 px-4"
          />
          <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        </div>

        <Button
          onClick={onClose}
          className="w-full bg-black text-white hover:bg-gray-900 h-14 rounded-xl font-bold text-base"
        >
          확인
        </Button>
      </div>
    </div>
  )
}
