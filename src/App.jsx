import React, { useState, useEffect, useRef } from 'react'
import { ChevronUp } from 'lucide-react'
import Header from './components/Header'
import DayTabs from './components/DayTabs'
import TimelineList from './components/TimelineList'
import HotelListView from './components/HotelListView'
import BottomNav from './components/BottomNav'
import MapViewModal from './components/MapViewModal'
import travelData from './data/travelPlan.json'

const STORAGE_KEY_VISITED = 'sample_planner_visited_items'
const STORAGE_KEY_ACTIVE_DAY = 'travel_planner_active_day'
const STORAGE_KEY_MAIN_TAB = 'travel_planner_main_tab'
const STORAGE_KEY_SCROLL_POSITIONS = 'travel_planner_scroll_positions'

export default function App() {
  const { tripInfo, days } = travelData

  // 1. 하단 바텀 탭 상태 ('timeline' | 'hotels')
  const [mainTab, setMainTab] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MAIN_TAB)
      if (saved === 'hotels' || saved === 'timeline') return saved
    } catch {}
    return 'timeline'
  })

  // 2. 마지막으로 보던 Day 복원 (기본값: 1)
  const [activeDay, setActiveDay] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ACTIVE_DAY)
      if (saved !== null) {
        const parsed = isNaN(Number(saved)) ? saved : Number(saved)
        if (parsed === 'all' || days?.some((d) => d.day === parsed)) {
          return parsed
        }
      }
    } catch {}
    return 1
  })

  // 2. Day별 스크롤 위치 저장소 (메모리 및 localStorage 연동)
  const scrollPositionsRef = useRef((() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SCROLL_POSITIONS)
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })())

  const isInitialMountRef = useRef(true)
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

  // 3. 브라우저 스크롤 이벤트 감지 및 현재 Day 스크롤 위치 기록
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY
      setShowTopBtn(currentY > 200)

      if (!isInitialMountRef.current) {
        scrollPositionsRef.current[activeDay] = currentY
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    // 앱 백그라운드 전환, 탭 닫기, 홈화면 나갈 때 상태 영구 저장
    const handleSaveState = () => {
      try {
        localStorage.setItem(
          STORAGE_KEY_SCROLL_POSITIONS,
          JSON.stringify(scrollPositionsRef.current)
        )
        localStorage.setItem(STORAGE_KEY_ACTIVE_DAY, String(activeDay))
      } catch (e) {
        console.error('Failed to save scroll state:', e)
      }
    }

    window.addEventListener('visibilitychange', handleSaveState)
    window.addEventListener('pagehide', handleSaveState)
    window.addEventListener('beforeunload', handleSaveState)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('visibilitychange', handleSaveState)
      window.removeEventListener('pagehide', handleSaveState)
      window.removeEventListener('beforeunload', handleSaveState)
      handleSaveState()
    }
  }, [activeDay])

  // 4. 앱 첫 실행 시: 브라우저 기본 스크롤 복원 억제 및 마지막 스크롤 위치로 복원
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }

    // DOM 렌더링 완료 후 저장된 스크롤 위치로 즉시 복원
    const timer = setTimeout(() => {
      const targetY = scrollPositionsRef.current[activeDay] || 0
      if (targetY > 0) {
        window.scrollTo({ top: targetY, behavior: 'instant' })
      }
      isInitialMountRef.current = false
    }, 80)

    return () => clearTimeout(timer)
  }, [])

  // 5. 사용자가 Day를 변경했을 때: 현재 위치 저장 후 새 Day의 스크롤 위치로 복원/이동
  const handleSelectDay = (newDay) => {
    if (newDay === activeDay) return

    scrollPositionsRef.current[activeDay] = window.scrollY
    try {
      localStorage.setItem(
        STORAGE_KEY_SCROLL_POSITIONS,
        JSON.stringify(scrollPositionsRef.current)
      )
      localStorage.setItem(STORAGE_KEY_ACTIVE_DAY, String(newDay))
    } catch {}

    setActiveDay(newDay)

    setTimeout(() => {
      const savedPos = scrollPositionsRef.current[newDay] || 0
      window.scrollTo({ top: savedPos, behavior: savedPos === 0 ? 'smooth' : 'instant' })
    }, 50)
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    scrollPositionsRef.current[activeDay] = 0
  }

  // 카드에서 지도 아이콘 클릭 시 해당 스팟을 포커스하며 모달 오픈
  const handleFocusOnMap = (item) => {
    setFocusedItem(item)
    setIsMapModalOpen(true)
  }

  const handleSelectMainTab = (tab) => {
    setMainTab(tab)
    try {
      localStorage.setItem(STORAGE_KEY_MAIN_TAB, tab)
    } catch {}
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div
      className="min-h-screen bg-slate-200/80 flex flex-col font-sans selection:bg-secondary-500 selection:text-white"
      style={{ paddingBottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))' }}
    >
      {/* 1. 상단 스티키 헤더 & Day 탭 (동선 탭일 때만 DayTabs 표시) */}
      <div className="sticky top-0 z-30 shadow-xs">
        <Header
          title={tripInfo?.title}
          period={
            tripInfo?.startDate && tripInfo?.endDate
              ? `${tripInfo.startDate} ~ ${tripInfo.endDate}`
              : '10박 11일 일정'
          }
          onOpenMapModal={() => {
            setFocusedItem(null)
            setIsMapModalOpen(true)
          }}
        />

        {mainTab === 'timeline' && (
          <DayTabs
            days={days || []}
            activeDay={activeDay}
            onSelectDay={handleSelectDay}
          />
        )}
      </div>

      {/* 2. 본문: 숙소 정보 또는 타임라인 리스트 */}
      <main className="flex-1 max-w-md w-full mx-auto px-4 py-4">
        {mainTab === 'hotels' ? (
          <HotelListView hotels={tripInfo?.hotels || []} />
        ) : (
          <TimelineList
            days={days || []}
            activeDay={activeDay}
            visitedItems={visitedItems}
            onToggleVisited={toggleVisited}
            onFocusOnMap={handleFocusOnMap}
          />
        )}
      </main>

      {/* 3. 하단 바텀 네비게이션 (동선 / 숙소) */}
      <BottomNav activeTab={mainTab} onChangeTab={handleSelectMainTab} />

      {/* 4. 이동 동선 지도 모달 */}
      <MapViewModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        days={days || []}
        activeDay={activeDay}
        focusedItem={focusedItem}
        onSelectSpot={(spot) => setFocusedItem(spot)}
      />

      {/* 5. 맨 위로 가기 플로팅 버튼 (홈 화면 PWA safe-area-inset 대응으로 바텀 탭 위에 항상 노출) */}
      {showTopBtn && (
        <button
          onClick={scrollToTop}
          className="fixed right-4 z-30 w-10 h-10 rounded-full bg-slate-900 text-white shadow-xl flex items-center justify-center transition-all hover:bg-slate-800 active:scale-95 border border-slate-700"
          style={{
            bottom: 'calc(4.5rem + env(safe-area-inset-bottom, 0px))'
          }}
          aria-label="맨 위로 가기"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      )}
    </div>
  )
}
