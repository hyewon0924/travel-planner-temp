import React, { useState } from 'react'
import { Building2, Calendar, Clock, MapPin, ExternalLink, Receipt, Info, Table, LayoutGrid } from 'lucide-react'
import { formatCurrency } from '../utils/helpers'

export default function HotelListView({ hotels = [] }) {
  const [viewMode, setViewMode] = useState('cards') // 'cards' | 'table'

  // 전체 비용 합계 계산
  const totalNights = hotels.reduce((sum, h) => sum + (h.nights || 0), 0)
  const totalHotelCost = hotels.reduce((sum, h) => sum + (h.totalPrice || 0), 0)
  const totalCityTax = hotels.reduce((sum, h) => sum + (h.cityTax || 0), 0)
  const grandTotal = totalHotelCost + totalCityTax

  // 도시별 포인트 컬러 매핑
  const cityColors = {
    '로마': 'bg-rose-50 text-rose-600 border-rose-200',
    '피렌체': 'bg-amber-50 text-amber-700 border-amber-200',
    '베네치아': 'bg-cyan-50 text-cyan-700 border-cyan-200',
    '바르셀로나': 'bg-emerald-50 text-emerald-700 border-emerald-200'
  }

  return (
    <div className="w-full space-y-4 pb-16 animate-fade-in">
      {/* 1. 상단 총 숙박비용 요약 대시보드 */}
      <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 text-white shadow-xl border border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">신혼여행 숙소 요약</h2>
              <p className="text-[11px] text-slate-400">총 4개 도시 · {totalNights}박 일정</p>
            </div>
          </div>

          {/* 뷰 모드 전환 (카드 / 표) */}
          <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'cards'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="카드 뷰"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'table'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="스프레드시트 표 뷰"
            >
              <Table className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 비용 합계 그리드 */}
        <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-slate-800">
          <div className="bg-slate-800/60 p-2.5 rounded-2xl border border-slate-750">
            <span className="text-[11px] text-slate-400 block mb-0.5">총 숙박 비용</span>
            <span className="text-base sm:text-lg font-extrabold text-white">
              ₩{formatCurrency(totalHotelCost)}
            </span>
          </div>
          <div className="bg-slate-800/60 p-2.5 rounded-2xl border border-slate-750">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[11px] text-slate-400">도시세 (현장결제)</span>
            </div>
            <span className="text-base sm:text-lg font-extrabold text-rose-400">
              ₩{formatCurrency(totalCityTax)}
            </span>
          </div>
        </div>

        {/* 총 합계 & 각주 */}
        <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium">총 예상 합계</span>
          <span className="text-base font-black text-emerald-400">
            ₩{formatCurrency(grandTotal)}
          </span>
        </div>

        <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1 bg-slate-800/40 px-2.5 py-1.5 rounded-xl border border-slate-800">
          <Info className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
          <span>도시세는 현지 호텔 체크인 시 현장에서 직접 결제합니다.</span>
        </div>
      </div>

      {/* 2. 카드 뷰 모드 */}
      {viewMode === 'cards' && (
        <div className="space-y-3.5">
          {hotels.map((hotel, index) => (
            <div
              key={hotel.id || index}
              className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col gap-3"
            >
              {/* 상단: 도시 배지, 숙박일, 기타 특징 */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${
                      cityColors[hotel.city] || 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {hotel.city}
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    {hotel.nights}박
                  </span>
                </div>

                {hotel.notes && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                    {hotel.notes}
                  </span>
                )}
              </div>

              {/* 호텔명 */}
              <div>
                <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                  {hotel.name}
                </h3>
                {hotel.englishName && (
                  <p className="text-xs text-slate-400 mt-0.5">{hotel.englishName}</p>
                )}
              </div>

              {/* 체크인 & 체크아웃 정보 */}
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-2xl border border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold mb-0.5">체크인</span>
                  <span className="font-extrabold text-slate-800 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {hotel.checkIn}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold mb-0.5">체크아웃</span>
                  <span className="font-extrabold text-slate-800 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {hotel.checkOut}
                  </span>
                </div>
              </div>

              {/* 비용 명세 */}
              <div className="space-y-1 pt-1 text-xs border-t border-slate-100">
                <div className="flex items-center justify-between text-slate-500">
                  <span>1박 기준</span>
                  <span className="font-semibold text-slate-700">₩{formatCurrency(hotel.pricePerNight)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span>숙박비용 ({hotel.nights}박)</span>
                  <span className="font-bold text-slate-900">₩{formatCurrency(hotel.totalPrice)}</span>
                </div>
                <div className="flex items-center justify-between text-rose-600">
                  <span className="flex items-center gap-1">
                    <Receipt className="w-3 h-3" />
                    도시세 (현장결제)
                  </span>
                  <span className="font-bold">₩{formatCurrency(hotel.cityTax)}</span>
                </div>
              </div>

              {/* 구글 지도 바로가기 버튼 */}
              {hotel.mapUrl && (
                <div className="pt-1">
                  <a
                    href={hotel.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold bg-slate-50 hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-200 hover:border-rose-200 transition-all shadow-2xs active:scale-98"
                    title="구글 지도에서 숙소 위치 보기"
                  >
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    <span>숙소 위치 지도보기</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 3. 스프레드시트 표(테이블) 뷰 모드 */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-slate-100/90 text-slate-700 border-b border-slate-200 font-extrabold text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">체크인</th>
                  <th className="py-2.5 px-3">위치</th>
                  <th className="py-2.5 px-3">숙소</th>
                  <th className="py-2.5 px-3">체크아웃</th>
                  <th className="py-2.5 px-2 text-center">숙박일</th>
                  <th className="py-2.5 px-3 text-right">1박 기준</th>
                  <th className="py-2.5 px-3 text-right bg-blue-50/60">숙박비용</th>
                  <th className="py-2.5 px-3 text-right">도시세</th>
                  <th className="py-2.5 px-3">기타</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {hotels.map((h, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-slate-900">{h.checkIn}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${cityColors[h.city]}`}>
                        {h.city}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{h.name}</td>
                    <td className="py-2.5 px-3 text-slate-600">{h.checkOut}</td>
                    <td className="py-2.5 px-2 text-center font-bold">{h.nights}</td>
                    <td className="py-2.5 px-3 text-right font-medium">₩{formatCurrency(h.pricePerNight)}</td>
                    <td className="py-2.5 px-3 text-right font-extrabold text-slate-900 bg-blue-50/40">
                      ₩{formatCurrency(h.totalPrice)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-rose-600">₩{formatCurrency(h.cityTax)}</td>
                    <td className="py-2.5 px-3">
                      {h.notes ? (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                          {h.notes}
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50 border-t-2 border-slate-200 font-extrabold text-slate-900 text-xs">
                <tr>
                  <td colSpan={4} className="py-3 px-3 text-slate-600">
                    합계 ({totalNights}박)
                  </td>
                  <td className="py-3 px-2 text-center text-slate-900">{totalNights}</td>
                  <td className="py-3 px-3"></td>
                  <td className="py-3 px-3 text-right text-blue-700 bg-blue-100/50">
                    ₩{formatCurrency(totalHotelCost)}
                  </td>
                  <td className="py-3 px-3 text-right text-rose-600">₩{formatCurrency(totalCityTax)}</td>
                  <td className="py-3 px-3 text-[10px] text-slate-400 font-normal">
                    * 도시세 현장결제
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          <div className="p-2.5 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 text-right font-medium">
            * 도시세 현장결제 별도
          </div>
        </div>
      )}
    </div>
  )
}
