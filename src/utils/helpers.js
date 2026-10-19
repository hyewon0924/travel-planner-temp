export const CATEGORY_CONFIG = {
  flight: {
    label: '항공',
    bg: 'bg-primary-950 text-primary-500 border-primary-900',
    iconColor: '#09abf6ff',
    markerColor: '#09abf6ff'
  },
  transit: {
    label: '교통',
    bg: 'bg-background-950 text-background-400 border-background-800',
    iconColor: '#33a355ff',
    markerColor: '#33a355ff'
  },
  hotel: {
    label: '숙소',
    bg: 'bg-text-950 text-text-400 border-text-900',
    iconColor: '#140c5a',
    markerColor: '#140c5a'
  },
  food: {
    label: '식당',
    bg: 'bg-secondary-950 text-secondary-500 border-secondary-900',
    iconColor: '#fb0442',
    markerColor: '#fb0442'
  },
  cafe: {
    label: '카페',
    bg: 'bg-secondary-950 text-secondary-600 border-secondary-900',
    iconColor: '#fc9c36ff',
    markerColor: '#fc9c36ff'
  },
  shopping: {
    label: '쇼핑',
    bg: 'bg-accent-950 text-accent-500 border-accent-900',
    iconColor: '#f6098f',
    markerColor: '#f6098f'
  },
  sightseeing: {
    label: '관광',
    bg: 'bg-primary-950 text-primary-600 border-primary-900',
    iconColor: '#533af8',
    markerColor: '#533af8'
  },
  activity: {
    label: '액티비티',
    bg: 'bg-background-900 text-text-200 border-background-800',
    iconColor: '#8abf2eff',
    markerColor: '#8abf2eff'
  }
}

export const getCategoryInfo = (category) => {
  const config = CATEGORY_CONFIG[category] || {
    label: '기타',
    bg: '',
    iconColor: '#3b3b3f',
    markerColor: '#3b3b3f'
  }

  // 6자리 또는 8자리 HEX 색상 코드 정규화 (#RRGGBB)
  const rawColor = config.iconColor || config.markerColor || '#3b82f6'
  const hex = '#' + rawColor.replace('#', '').slice(0, 6)

  return {
    ...config,
    color: hex,
    badgeStyle: {
      backgroundColor: `${hex}18`,
      color: hex,
      borderColor: `${hex}40`
    }
  }
}

export const formatCurrency = (amount) => {
  if (!amount || amount === 0) return '0'
  if (typeof amount === 'string') return amount
  return new Intl.NumberFormat('ko-KR').format(amount)
}
