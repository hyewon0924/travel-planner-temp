import React, { useState, useEffect, useRef, useMemo } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapPin, Clock, ExternalLink } from 'lucide-react'
import { getCategoryInfo } from '../utils/helpers'

export default function GoogleMapView({ days, activeDay, focusedItem, onSelectSpot }) {
  const mapContainerRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const layerGroupRef = useRef(null)

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

  return (
    <div className="w-full h-full relative">
      {/* 지도 컨테이너 */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* 선택된 장소 하단 오버레이 카드 */}
      {selectedSpot && (
        <div className="absolute bottom-4 left-4 right-4 z-[400] max-w-md mx-auto bg-slate-900/95 backdrop-blur-md text-white p-3.5 rounded-2xl border border-slate-700 shadow-2xl animate-fade-in">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="w-5 h-5 rounded-full bg-rose-600 text-white font-extrabold text-[10px] flex items-center justify-center">
                {selectedSpot.seqNumber || '•'}
              </span>
              <span className="text-xs text-rose-400 font-bold">
                {selectedSpot.categoryLabel || '일정'}
              </span>
              <span className="text-[11px] text-slate-400 flex items-center gap-0.5">
                <Clock className="w-3 h-3" />
                {selectedSpot.timePeriod} {selectedSpot.time}
              </span>
            </div>
            <h4 className="text-sm font-bold text-white truncate">
              {selectedSpot.title}
            </h4>
            {selectedSpot.location && (
              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                {selectedSpot.location}
              </p>
            )}
          </div>

          {/* 외부 지도앱 링크 (너비 100% 꽉 차게) */}
          {selectedSpot.mapUrl && (
            <div className="mt-2.5 pt-2.5 border-t border-slate-800">
              <a
                href={selectedSpot.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-all active:scale-98"
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
