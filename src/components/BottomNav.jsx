import React from 'react'
import { Calendar, Map } from 'lucide-react'

export default function BottomNav({ onOpenMapModal }) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg pt-2 px-6"
      style={{
        paddingBottom: 'calc(0.6rem + env(safe-area-inset-bottom, 0px))'
      }}
    >
      <div className="max-w-md mx-auto flex items-center justify-around">
        {/* 일정 탭 */}
        <button
          className="flex flex-col items-center gap-1 py-1 px-4 text-slate-900 font-extrabold"
        >
          <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-slate-900 text-white shadow-sm">
            <Calendar className="w-4 h-4" />
          </div>
          <span className="text-[11px]">일정 타임라인</span>
        </button>

        {/* 동선 지도 탭 */}
        <button
          onClick={onOpenMapModal}
          className="flex flex-col items-center gap-1 py-1 px-4 text-slate-500 font-semibold hover:text-slate-800 transition"
        >
          <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-slate-100 text-slate-600 border border-slate-200">
            <Map className="w-4 h-4" />
          </div>
          <span className="text-[11px]">동선 지도</span>
        </button>
      </div>
    </nav>
  )
}
