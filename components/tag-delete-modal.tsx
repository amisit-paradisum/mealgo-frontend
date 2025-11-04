"use client"

import { Button } from "@/components/ui/button"

interface TagDeleteModalProps {
  onClose: () => void
}

export function TagDeleteModal({ onClose }: TagDeleteModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center px-6 z-50">
      <div className="bg-white rounded-3xl p-6 w-full max-w-sm">
        <h2 className="text-xl font-bold text-gray-900 text-center mb-4">알림</h2>
        <p className="text-gray-700 text-center mb-8">정말로 '우동' 태그를 삭제하겠습니까?</p>

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
