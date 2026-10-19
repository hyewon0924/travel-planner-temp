import React, { useState, useEffect, useRef, useMemo } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapPin, Clock, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react'
import { getCategoryInfo } from '../utils/helpers'

export default function GoogleMapView({ days, activeDay, focusedItem, onSelectSpot }) {
  const mapContainerRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const layerGroupRef = useRef(null)
  const touchStartXRef = useRef(null)

  // 현재 Day의 유효한 지도 좌표 목록 필터링 (목록 카드 번호와 1:1 일치)
  const validSpots = useMemo(() => {
    const list = []
    const targetDays = activeDay === 'all' ? days : days.filter((d) => d.day === activeDay)

    targetDays.forEach((d) => {
      d.schedules.forEach((s, sIdx) => {
        const hasCoords = Boolean(s.coords && s.coords.lat && s.coords.lng)
        if (!s.hideOnMap && hasCoords) {
          list.push({
            ...s,
            day: d.day,
            dayDate: d.date,
            seqNumber: sIdx + 1 // 목록 카드 번호(1, 2, 3...)와 1:1 일치
          })
        }
      })
    })
    return list
  }, [days, activeDay])

  const [selectedSpot, setSelectedSpot] = useState(null)

  useEffect(() => {
    if (focusedItem) {
      // seqNumber가 포함된 validSpot을 찾아 설정하여 하단 팝업에도 번호가 정상 표시되도록 처리
      const match = validSpots.find((s) => s.id === focusedItem.id)
      if (match) {
        setSelectedSpot(match)
      } else if (focusedItem.coords && !focusedItem.hideOnMap) {
        setSelectedSpot(focusedItem)
      }
    } else if (validSpots.length > 0) {
      setSelectedSpot(validSpots[0])
    } else {
      setSelectedSpot(null)
    }
  }, [focusedItem, activeDay, validSpots])

  // 현재 선택된 장소의 인덱스 및 이전/다음 스팟 계산
  const currentSpotIndex = useMemo(() => {
    if (!selectedSpot) return -1
    return validSpots.findIndex((s) => s.id === selectedSpot.id)
  }, [validSpots, selectedSpot])

  const hasPrev = currentSpotIndex > 0
  const hasNext = currentSpotIndex >= 0 && currentSpotIndex < validSpots.length - 1

  const prevSpot = hasPrev ? validSpots[currentSpotIndex - 1] : null
  const nextSpot = hasNext ? validSpots[currentSpotIndex + 1] : null

  const handlePrevSpot = () => {
    if (hasPrev) {
      const target = validSpots[currentSpotIndex - 1]
      setSelectedSpot(target)
      if (onSelectSpot) onSelectSpot(target)
    }
  }

  const handleNextSpot = () => {
    if (hasNext) {
      const target = validSpots[currentSpotIndex + 1]
      setSelectedSpot(target)
      if (onSelectSpot) onSelectSpot(target)
    }
  }

  // 키보드 좌우 방향키로 동선 넘기기 지원
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') handlePrevSpot()
      else if (e.key === 'ArrowRight') handleNextSpot()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [hasPrev, hasNext, currentSpotIndex, validSpots])

  // 터치 스와이프 제스처 지원 (모바일에서 좌우로 쓸어넘기기)
  const handleTouchStart = (e) => {
    touchStartXRef.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e) => {
    if (touchStartXRef.current === null) return
    const touchEndX = e.changedTouches[0].clientX
    const diff = touchEndX - touchStartXRef.current
    if (diff > 45) {
      // 오른쪽으로 넘김 -> 이전 동선
      handlePrevSpot()
    } else if (diff < -45) {
      // 왼쪽으로 넘김 -> 다음 동선
      handleNextSpot()
    }
    touchStartXRef.current = null
  }

  // Leaflet 지도 초기화
  useEffect(() => {
    if (!mapContainerRef.current) return

    if (!mapInstanceRef.current) {
      // 로마 중심 기본 좌표 (또는 첫 번째 유효 스팟 위치)
      const defaultCenter = validSpots[0]?.coords
        ? [validSpots[0].coords.lat, validSpots[0].coords.lng]
        : [41.9028, 12.4964]
      const map = L.map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: 13,
        zoomControl: false
      })

      // 타일 레이어 (OpenStreetMap)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map)

      // 줌 컨트롤 우하단에 배치
      L.control.zoom({ position: 'bottomright' }).addTo(map)

      layerGroupRef.current = L.layerGroup().addTo(map)
      mapInstanceRef.current = map
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  // 마커 및 경로선 업데이트
  useEffect(() => {
    const map = mapInstanceRef.current
    const layerGroup = layerGroupRef.current
    if (!map || !layerGroup) return

    layerGroup.clearLayers()

    if (validSpots.length === 0) return

    const latLngs = []

    validSpots.forEach((spot) => {
      const { lat, lng } = spot.coords
      latLngs.push([lat, lng])

      const isSelected = selectedSpot?.id === spot.id
      const categoryInfo = getCategoryInfo(spot.category)

      // 커스텀 원형 마커 아이콘
      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            width: ${isSelected ? '36px' : '28px'};
            height: ${isSelected ? '36px' : '28px'};
            background-color: ${isSelected ? '#fb0442' : categoryInfo.iconColor || '#3b82f6'};
            color: white;
            font-weight: 800;
            font-size: ${isSelected ? '14px' : '11px'};
            border-radius: 9999px;
            border: 2px solid white;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            transition: transform 0.2s;
            cursor: pointer;
          ">
            ${spot.seqNumber}
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      })

      const marker = L.marker([lat, lng], { icon: customIcon })
      marker.on('click', () => {
        setSelectedSpot(spot)
        if (onSelectSpot) onSelectSpot(spot)
      })

      marker.addTo(layerGroup)
    })

    // 경로 폴리라인 그리기
    if (latLngs.length > 1) {
      L.polyline(latLngs, {
        color: '#fb0442',
        weight: 3.5,
        opacity: 0.85,
        dashArray: '6, 8',
        lineCap: 'round'
      }).addTo(layerGroup)
    }

    // 모든 마커가 보이도록 지도 영역 맞추기
    if (latLngs.length > 0) {
      const bounds = L.latLngBounds(latLngs)
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 })
    }
  }, [validSpots, selectedSpot, onSelectSpot])

  // 선택된 스팟으로 지도 부드럽게 이동
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map || !selectedSpot?.coords) return

    map.panTo([selectedSpot.coords.lat, selectedSpot.coords.lng], {
      animate: true,
      duration: 0.5
    })
  }, [selectedSpot])

  const currentCategoryInfo = selectedSpot ? getCategoryInfo(selectedSpot.category) : null

  return (
    <div className="w-full h-full relative select-none">
      {/* 지도 컨테이너 */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* 지도 좌우 플로팅 이전/다음 버튼 (화면 어디서나 즉시 넘기기) */}
      {validSpots.length > 1 && (
        <>
          <button
            onClick={handlePrevSpot}
            disabled={!hasPrev}
            className={`absolute left-3 top-1/2 -translate-y-1/2 z-[300] w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              hasPrev
                ? 'bg-slate-900/80 hover:bg-slate-900 text-white shadow-xl backdrop-blur-md border border-slate-700/80 hover:scale-110 active:scale-95 cursor-pointer'
                : 'opacity-0 pointer-events-none'
            }`}
            title={prevSpot ? `이전: ${prevSpot.title}` : ''}
            aria-label="이전 장소로 이동"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={handleNextSpot}
            disabled={!hasNext}
            className={`absolute right-3 top-1/2 -translate-y-1/2 z-[300] w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              hasNext
                ? 'bg-slate-900/80 hover:bg-slate-900 text-white shadow-xl backdrop-blur-md border border-slate-700/80 hover:scale-110 active:scale-95 cursor-pointer'
                : 'opacity-0 pointer-events-none'
            }`}
            title={nextSpot ? `다음: ${nextSpot.title}` : ''}
            aria-label="다음 장소로 이동"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* 선택된 장소 하단 오버레이 카드 (슬림하고 직관적인 내비게이션) */}
      {selectedSpot && (
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="absolute bottom-4 left-4 right-4 z-[400] max-w-md mx-auto bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-3xl border border-slate-700/80 shadow-2xl animate-fade-in flex flex-col gap-2.5"
        >
          {/* 1. 상단 내비게이션 바: [ ‹ 이전 ]  [ 순번/전체 + 프로그레스 도트 ]  [ 다음 › ] */}
          <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-800">
            {/* 이전 버튼 */}
            <button
              onClick={handlePrevSpot}
              disabled={!hasPrev}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                hasPrev
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 active:scale-95 shadow-xs cursor-pointer border border-slate-700'
                  : 'text-slate-600 opacity-25 cursor-not-allowed bg-slate-800/40 border border-transparent'
              }`}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>이전</span>
            </button>

            {/* 중앙: 3 / 6 순번 및 미니 프로그레스 도트 */}
            <div className="flex flex-col items-center gap-1">
              <div className="text-xs font-extrabold text-slate-200 tracking-wider">
                <span className="text-rose-400">{currentSpotIndex + 1}</span>
                <span className="text-slate-500 font-normal mx-1">/</span>
                <span>{validSpots.length}</span>
              </div>
              <div className="flex items-center gap-1">
                {validSpots.map((_, i) => (
                  <span
                    key={i}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      i === currentSpotIndex
                        ? 'w-4 bg-rose-500'
                        : 'w-1 bg-slate-700'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* 다음 버튼 */}
            <button
              onClick={handleNextSpot}
              disabled={!hasNext}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                hasNext
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 active:scale-95 shadow-xs cursor-pointer border border-slate-700'
                  : 'text-slate-600 opacity-25 cursor-not-allowed bg-slate-800/40 border border-transparent'
              }`}
            >
              <span>다음</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 2. 장소 상세 정보 */}
          <div className="min-w-0 pt-0.5">
            <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
              <span
                className="w-5 h-5 rounded-full text-white font-extrabold text-[11px] flex items-center justify-center flex-shrink-0 shadow-xs"
                style={{ backgroundColor: currentCategoryInfo?.color || '#fb0442' }}
              >
                {selectedSpot.seqNumber || currentSpotIndex + 1}
              </span>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full border"
                style={currentCategoryInfo?.badgeStyle}
              >
                {selectedSpot.categoryLabel || currentCategoryInfo?.label || '일정'}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {selectedSpot.timePeriod} {selectedSpot.time}
              </span>
            </div>

            <h3 className="text-base font-extrabold text-white truncate">
              {selectedSpot.title}
            </h3>
            {selectedSpot.location && (
              <p className="text-xs text-slate-400 truncate mt-0.5">
                {selectedSpot.location}
              </p>
            )}
          </div>

          {/* 3. 다음 행선지 힌트 (어디로 가는지 직관적 확인) */}
          {nextSpot && (
            <div className="flex items-center gap-1.5 text-[11px] bg-slate-800/60 border border-slate-700/50 px-2.5 py-1.5 rounded-xl text-slate-400">
              <span className="text-slate-500 font-bold flex-shrink-0">다음 동선</span>
              <span className="text-slate-300 font-medium truncate">{nextSpot.title}</span>
              <ChevronRight className="w-3 h-3 text-slate-500 ml-auto flex-shrink-0" />
            </div>
          )}

          {/* 4. 외부 지도앱 링크 버튼 (너비 100% 꽉 차게) */}
          {selectedSpot.mapUrl && (
            <div className="pt-0.5">
              <a
                href={selectedSpot.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-all active:scale-98"
                title="지도앱에서 길찾기 및 위치 보기"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>지도앱 바로가기</span>
                <ExternalLink className="w-3 h-3 opacity-80" />
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
