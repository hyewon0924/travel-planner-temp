import React from 'react'
import { X, MapPin } from 'lucide-react'
import GoogleMapView from './GoogleMapView'

export default function MapViewModal({ isOpen, onClose, days, activeDay, focusedItem, onSelectSpot }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl overflow-hidden relative">
        {/* Header Bar */}
        <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-white">
                Day {activeDay} 이동 동선 지도
              </h2>
              <p className="text-[11px] text-slate-400">
                순번 마커와 경로선을 확인하고 핀을 클릭해 상세 정보를 확인하세요.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition active:scale-95"
            aria-label="닫기"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Map Container */}
        <div className="flex-1 w-full h-full relative">
          <GoogleMapView
            days={days}
            activeDay={activeDay}
            focusedItem={focusedItem}
            onSelectSpot={onSelectSpot}
          />
        </div>
      </div>
    </div>
  )
}
