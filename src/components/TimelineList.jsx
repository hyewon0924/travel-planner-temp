import React from 'react'
import TimelineCard from './TimelineCard'
import { Calendar } from 'lucide-react'

export default function TimelineList({
  days,
  activeDay,
  visitedItems,
  onToggleVisited,
  onFocusOnMap
}) {
  const currentDayData = days.find((d) => d.day === activeDay) || days[0]
  const schedules = currentDayData?.schedules || []

  return (
    <div className="w-full space-y-4 pb-16">
      {schedules.length > 0 ? (
        <div className="pt-2 w-full">
          {schedules.map((schedule, idx) => (
            <TimelineCard
              key={schedule.id}
              item={schedule}
              index={idx}
              isVisited={visitedItems.includes(schedule.id)}
              onToggleVisited={onToggleVisited}
              onFocusOnMap={onFocusOnMap}
              isLast={idx === schedules.length - 1}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[35vh] text-center p-8 bg-white/70 rounded-3xl border border-slate-200 shadow-xs my-4 space-y-2">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
            <Calendar className="w-6 h-6" />
          </div>
          <p className="text-xs font-bold text-slate-500">
            Day {activeDay} 일정이 등록되지 않았습니다.
          </p>
        </div>
      )}
    </div>
  )
}
