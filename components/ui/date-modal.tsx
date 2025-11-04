import React, { useState } from "react";

interface DateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (date: string) => void;
}

const DateModal: React.FC<DateModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-80 text-center">
        <h2 className="text-lg font-semibold mb-4">날짜 설정</h2>

        <div className="relative mb-6">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 text-center text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
        </div>

        <button
          onClick={() => {
            onConfirm(selectedDate);
            onClose();
          }}
          className="w-full bg-black text-white py-2 rounded-md font-semibold hover:bg-gray-800 transition"
        >
          확인
        </button>
      </div>
    </div>
  );
};

export default DateModal;
