"use client"

import { Button } from "@/components/ui/button"
import { Calendar, UtensilsCrossed, Flame } from "lucide-react"

interface BottomNavProps {
  currentTab: "meal" | "diet" | "bookmark"
  onNavigate: (screen: "meal" | "diet" | "bookmark") => void
}

export function BottomNav({ currentTab, onNavigate }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#0f0a1e] border-t border-white/10">
      <div className="flex items-center justify-around px-6 py-4 max-w-md mx-auto">
        <Button
          variant="ghost"
          className={`flex flex-col items-center gap-1 ${currentTab === "bookmark" ? "text-white" : "text-white/50"}`}
          onClick={() => onNavigate("bookmark")}
        >
          <Calendar className="w-6 h-6" />
          <span className="text-xs">내 시간표</span>
        </Button>

        <Button
          variant="ghost"
          className={`flex flex-col items-center gap-1 ${currentTab === "meal" ? "text-purple-400" : "text-white/50"}`}
          onClick={() => onNavigate("meal")}
        >
          <UtensilsCrossed className="w-6 h-6" />
          <span className="text-xs">오늘 급식</span>
        </Button>

        <Button
          variant="ghost"
          className={`flex flex-col items-center gap-1 ${currentTab === "diet" ? "text-purple-400" : "text-white/50"}`}
          onClick={() => onNavigate("diet")}
        >
          <Flame className="w-6 h-6" />
          <span className="text-xs">다이어트</span>
        </Button>
      </div>
    </div>
  )
}
