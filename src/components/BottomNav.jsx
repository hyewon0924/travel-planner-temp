import React from 'react'
import { Map, Building2 } from 'lucide-react'

export default function BottomNav({ activeTab, onChangeTab }) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-[0_-2px_12px_rgba(0,0,0,0.04)] pt-1.5 px-6"
      style={{
        paddingBottom: 'calc(0.4rem + env(safe-area-inset-bottom, 0px))'
      }}
    >
      <div className="max-w-xs mx-auto grid grid-cols-2 gap-4">
        {/* 1. 동선 탭 */}
        <button
          onClick={() => onChangeTab('timeline')}
          className={`flex flex-col items-center justify-center gap-0.5 py-1 transition-all cursor-pointer ${
            activeTab === 'timeline'
              ? 'text-rose-600 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-600 font-medium'
          }`}
        >
          <Map
            className={`w-5 h-5 transition-transform ${
              activeTab === 'timeline' ? 'stroke-[2.4]' : 'stroke-[1.8]'
            }`}
          />
          <span className="text-[11px] tracking-tight">동선</span>
        </button>

        {/* 2. 숙소 탭 */}
        <button
          onClick={() => onChangeTab('hotels')}
          className={`flex flex-col items-center justify-center gap-0.5 py-1 transition-all cursor-pointer ${
            activeTab === 'hotels'
              ? 'text-rose-600 font-bold scale-105'
              : 'text-slate-400 hover:text-slate-600 font-medium'
          }`}
        >
          <Building2
            className={`w-5 h-5 transition-transform ${
              activeTab === 'hotels' ? 'stroke-[2.4]' : 'stroke-[1.8]'
            }`}
          />
          <span className="text-[11px] tracking-tight">숙소</span>
        </button>
      </div>
    </nav>
  )
}
