import React, { useState, useEffect } from 'react'
import { ChevronUp } from 'lucide-react'
import Header from './components/Header'
import DayTabs from './components/DayTabs'
import TimelineList from './components/TimelineList'
import MapViewModal from './components/MapViewModal'
import travelData from './data/travelPlan.json'

const STORAGE_KEY_VISITED = 'sample_planner_visited_items'

export default function App() {
  const [activeDay, setActiveDay] = useState(1)
  const [focusedItem, setFocusedItem] = useState(null)
  const [isMapModalOpen, setIsMapModalOpen] = useState(false)
  const [showTopBtn, setShowTopBtn] = useState(false)

  // 방문 완료 체크 목록 (localStorage 저장)
  const [visitedItems, setVisitedItems] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_VISITED)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_VISITED, JSON.stringify(visitedItems))
    } catch (e) {
      console.error('Failed to save visited items:', e)
    }
  }, [visitedItems])

  const toggleVisited = (id) => {
    setVisitedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  // 스크롤 감지 및 맨 위로 이동
  useEffect(() => {
    const handleScroll = () => {
      setShowTopBtn(window.scrollY > 200)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Day 변경 시 최상단으로 스크롤
  useEffect(() => {
    scrollToTop()
  }, [activeDay])

  // 카드에서 지도 아이콘 클릭 시 해당 스팟을 포커스하며 모달 오픈
  const handleFocusOnMap = (item) => {
    setFocusedItem(item)
    setIsMapModalOpen(true)
  }

  const { tripInfo, days } = travelData

  return (
    <div
      className="min-h-screen bg-slate-200/80 flex flex-col font-sans selection:bg-secondary-500 selection:text-white"
      style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}
    >
      {/* 1. 상단 스티키 헤더 & Day 탭 */}
      <div className="sticky top-0 z-30 shadow-xs">
        <Header
          title={tripInfo?.title}
          period={
            tripInfo?.startDate && tripInfo?.endDate
              ? `${tripInfo.startDate} ~ ${tripInfo.endDate}`
              : '3박 4일 일정'
          }
          onOpenMapModal={() => {
            setFocusedItem(null)
            setIsMapModalOpen(true)
          }}
        />

        <DayTabs
          days={days || []}
          activeDay={activeDay}
          onSelectDay={setActiveDay}
        />
      </div>

      {/* 2. 본문 타임라인 리스트 */}
      <main className="flex-1 max-w-md w-full mx-auto px-4 py-4">
        <TimelineList
          days={days || []}
          activeDay={activeDay}
          visitedItems={visitedItems}
          onToggleVisited={toggleVisited}
          onFocusOnMap={handleFocusOnMap}
        />
      </main>

      {/* 3. 이동 동선 지도 모달 */}
      <MapViewModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        days={days || []}
        activeDay={activeDay}
        focusedItem={focusedItem}
        onSelectSpot={(spot) => setFocusedItem(spot)}
      />

      {/* 4. 맨 위로 가기 플로팅 버튼 */}
      {showTopBtn && (
        <button
          onClick={scrollToTop}
          className="fixed right-4 bottom-6 z-30 w-10 h-10 rounded-full bg-slate-900 text-white shadow-xl flex items-center justify-center transition-all hover:bg-slate-800 active:scale-95 border border-slate-700"
          aria-label="맨 위로 가기"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      )}
    </div>
  )
}
