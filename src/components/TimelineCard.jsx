import React from 'react'
import { MapPin, Check, Coins, ExternalLink } from 'lucide-react'
import { getCategoryInfo, formatCurrency } from '../utils/helpers'

export default function TimelineCard({
  item,
  index,
  isVisited,
  onToggleVisited,
  onFocusOnMap,
  isLast
}) {
  const categoryInfo = getCategoryInfo(item.category)
  const hasCoords = Boolean(item.coords && item.coords.lat && item.coords.lng)

  // 소요시간 추출 (duration 필드 또는 memo의 '(소요시간: ...)' 패턴)
  const duration =
    item.duration ||
    item.memo?.match(/소요시간:\s*([^)]+)/)?.[1]?.trim()

  // 메모 내용이 오직 '(소요시간: ...)' 뿐인 경우 메모 박스 중복 노출 방지
  const displayMemo = item.memo
    ? item.memo.replace(/^\(소요시간:\s*[^)]+\)$/, '').trim()
    : ''

  return (
    <div className="relative flex items-start gap-3 sm:gap-4 group mb-4 w-full">
      {/* 1. 좌측 타임라인: 세로 연결선 + 번호 원형 노드 + 시간 뱃지 */}
      <div className="flex flex-col items-center flex-shrink-0 w-14 sm:w-16 relative self-stretch">
        {/* 수직 연결선 (끊김 없이 전체를 관통하는 진한 네이비/블랙 경로 선) */}
        <div
          className={`w-[2.5px] absolute ${
            index === 0 ? 'top-3' : 'top-0'
          } ${
            isLast ? 'bottom-6' : '-bottom-4'
          } left-1/2 -translate-x-1/2 transition-colors z-0 ${
            isVisited ? 'bg-emerald-300' : 'bg-slate-900'
          }`}
        />

        {/* 1) 순번 번호 원형 노드 (기존 대비 70% 크기로 아담하게 축소: 24px) */}
        <button
          onClick={() => onToggleVisited(item.id)}
          className={`w-6 h-6 rounded-full flex items-center justify-center font-extrabold text-[11px] transition-all z-10 shadow-xs ring-2 ${
            isVisited
              ? 'bg-emerald-500 text-white shadow-emerald-200 ring-emerald-300'
              : 'bg-[#181f38] text-white hover:bg-slate-800 hover:scale-105 ring-white'
          }`}
          title={isVisited ? '방문 완료 취소' : '방문 완료 체크'}
        >
          {isVisited ? <Check className="w-3 h-3 stroke-[3]" /> : index + 1}
        </button>

        {/* 2) 시간 & 소요시간 뱃지 박스 */}
        <div
          className={`mt-1.5 z-10 flex flex-col items-center justify-center px-2 py-1 rounded-xl border text-center shadow-xs transition-colors ${
            isVisited
              ? 'bg-emerald-50/90 border-emerald-200 text-emerald-800'
              : 'bg-[#eef2f7] border-[#d6e0ea] text-slate-900'
          }`}
        >
          <span className="font-extrabold text-xs sm:text-[13px] tracking-tight leading-tight whitespace-nowrap">
            {item.time}
          </span>
          {duration && (
            <span className="text-[10px] font-bold text-slate-500 mt-0.5 leading-none whitespace-nowrap">
              ({duration})
            </span>
          )}
        </div>
      </div>

      {/* 2. 우측: 카드 본문 컨테이너 (min-w-0으로 내부 텍스트 길이에 따른 너비 늘어남 방지) */}
      <div
        className={`flex-1 min-w-0 p-4 rounded-2xl bg-white border transition-all duration-200 shadow-sm ${
          isVisited
            ? 'border-emerald-100 bg-slate-50/70 opacity-75'
            : 'border-slate-200/80 hover:shadow-md hover:border-slate-300'
        }`}
      >
        {/* 상단: 시간대 & 카테고리 뱃지 */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[11px] font-bold text-slate-400">
            {item.timePeriod || ''}
          </span>

          <span
            className="px-2.5 py-0.5 rounded-full text-[11px] font-bold border transition-colors"
            style={categoryInfo.badgeStyle}
          >
            {item.categoryLabel || categoryInfo.label}
          </span>
        </div>

        {/* 중앙: 장소/제목 */}
        <div className="flex items-start justify-between gap-2 min-w-0">
          <h3
            className={`text-base font-extrabold text-slate-900 leading-snug break-words min-w-0 flex-1 ${
              isVisited ? 'line-through text-slate-400' : ''
            }`}
          >
            {item.title}
          </h3>

          {/* 위치 핀 버튼 (지도로 포커스 - 카테고리 테마 색상과 연동) */}
          {hasCoords && !item.hideOnMap && (
            <button
              onClick={() => onFocusOnMap(item)}
              className="flex-shrink-0 p-1.5 rounded-xl border transition-all hover:scale-105 active:scale-95 shadow-2xs"
              style={{
                backgroundColor: `${categoryInfo.color}14`,
                borderColor: `${categoryInfo.color}35`,
                color: categoryInfo.color
              }}
              title="지도에서 위치 보기"
            >
              <MapPin className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* 상세 위치 주소 */}
        {item.location && (
          <p className="text-xs text-slate-500 mt-1 min-w-0">
            <span className="block truncate">{item.location}</span>
          </p>
        )}

        {/* 메모 */}
        {displayMemo && (
          <div className="mt-2 text-xs text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100 leading-relaxed break-keep whitespace-pre-line">
            {typeof displayMemo === 'string' ? displayMemo.replace(/\\n/g, '\n') : displayMemo}
          </div>
        )}

        {/* 링크 목록 (라벨 클릭 시 바로 이동) */}
        {item.links && item.links.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-2">
            {item.links.map((link, i) => {
              const url = typeof link === 'string' ? link : link.url
              const label = typeof link === 'string' ? link : (link.label || link.url)

              return (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 p-2 rounded-xl text-xs font-medium bg-sky-50/60 hover:bg-sky-100/70 text-sky-700 hover:text-sky-800 border border-sky-100 hover:border-sky-200 transition-all shadow-xs active:scale-95 group/link"
                  title={`${label} 바로가기`}
                >
                  <span>{label}</span>
                  <ExternalLink className="w-3 h-3 text-sky-400 group-hover/link:text-sky-500 transition-colors" />
                </a>
              )
            })}
          </div>
        )}

        {/* 하단: 비용 표시 */}
        {item.cost ? (
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1">
              <Coins className="w-3.5 h-3.5" />
              예상 비용
            </span>
            <span className="font-bold text-slate-800">
              {typeof item.cost === 'string' && (item.cost.includes('€') || item.cost.includes('₩') || item.cost.includes('$'))
                ? item.cost
                : `₩ ${formatCurrency(item.cost)}`}
            </span>
          </div>
        ) : null}

        {/* 하단: mapUrl 지도보기 버튼 (너비 100% 꽉 차게) */}
        {item.mapUrl && (
          <div className={`mt-2.5 ${!item.cost ? 'pt-2.5 border-t border-slate-100' : ''}`}>
            <a
              href={item.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-50 hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-200 hover:border-rose-200 transition-all shadow-xs active:scale-98"
              title="구글 지도에서 위치 보기"
            >
              <MapPin className="w-3.5 h-3.5 text-rose-500" />
              <span>지도보기</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
