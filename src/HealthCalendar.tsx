import { useMemo, useState } from 'react'
import { HEALTH_RECORDS, type HealthRecord } from './data/healthRecords'

interface Props {
  onSelectRecord: (id: number) => void
}

const TYPE_COLOR: Record<string, string> = {
  '진료': 'var(--ink)',
  '예방접종': 'var(--teal)',
  '처방': 'var(--gold)',
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

function GoogleIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
      <path d="M18.17 10.2c0-.63-.06-1.24-.16-1.83H10v3.46h4.59a3.93 3.93 0 0 1-1.7 2.58v2.14h2.74c1.6-1.48 2.54-3.65 2.54-6.35Z" fill="#4285F4"/>
      <path d="M10 18.5c2.3 0 4.23-.76 5.64-2.06l-2.74-2.14c-.77.52-1.75.82-2.9.82-2.23 0-4.12-1.51-4.79-3.53H2.38v2.2A8.5 8.5 0 0 0 10 18.5Z" fill="#34A853"/>
      <path d="M5.21 11.59A5.12 5.12 0 0 1 4.94 10c0-.55.1-1.08.27-1.59V6.21H2.38A8.5 8.5 0 0 0 1.5 10c0 1.37.33 2.67.88 3.79l2.83-2.2Z" fill="#FBBC05"/>
      <path d="M10 4.88c1.26 0 2.38.43 3.27 1.28l2.45-2.45C14.22 2.34 12.3 1.5 10 1.5A8.5 8.5 0 0 0 2.38 6.21l2.83 2.2C5.88 6.39 7.77 4.88 10 4.88Z" fill="#EA4335"/>
    </svg>
  )
}

function parseRecordDate(d: string): Date {
  const [y, m, day] = d.split('.').map(Number)
  return new Date(y, m - 1, day)
}

function pad2(n: number) {
  return String(n).padStart(2, '0')
}

function toICSDate(d: Date) {
  return `${d.getFullYear()}${pad2(d.getMonth() + 1)}${pad2(d.getDate())}`
}

function icsEscape(s: string) {
  return s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')
}

function buildICS(records: HealthRecord[]) {
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//PETEED//Health Records//KO', 'CALSCALE:GREGORIAN']
  const stamp = `${toICSDate(new Date())}T000000Z`
  records.forEach((rec, i) => {
    const d = parseRecordDate(rec.date)
    const start = toICSDate(d)
    const end = new Date(d)
    end.setDate(d.getDate() + 1)
    const desc = icsEscape([rec.hospital, rec.vet, rec.memo].filter(Boolean).join('\n'))
    lines.push(
      'BEGIN:VEVENT',
      `UID:peteed-health-${i}-${start}@peteed-app`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${start}`,
      `DTEND;VALUE=DATE:${toICSDate(end)}`,
      `SUMMARY:${icsEscape(`[PETEED] ${rec.title}`)}`,
      `DESCRIPTION:${desc}`,
      `LOCATION:${icsEscape(rec.hospital)}`,
      'END:VEVENT',
    )
  })
  lines.push('END:VCALENDAR')
  return lines.join('\r\n')
}

function exportToGoogleCalendar() {
  const ics = buildICS(HEALTH_RECORDS)
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'peteed-health-records.ics'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export default function HealthCalendar({ onSelectRecord }: Props) {
  // Default to the month of the most recent record so there's always
  // something to see at a glance, instead of starting on an empty month.
  const initialMonth = useMemo(() => {
    const latest = HEALTH_RECORDS.reduce((max, rec) => {
      const d = parseRecordDate(rec.date)
      return d > max ? d : max
    }, parseRecordDate(HEALTH_RECORDS[0].date))
    return new Date(latest.getFullYear(), latest.getMonth(), 1)
  }, [])

  const [viewMonth, setViewMonth] = useState(initialMonth)
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [showSyncInfo, setShowSyncInfo] = useState(false)

  const recordsByDay = useMemo(() => {
    const map = new Map<string, { rec: HealthRecord; id: number }[]>()
    HEALTH_RECORDS.forEach((rec, id) => {
      const list = map.get(rec.date) ?? []
      list.push({ rec, id })
      map.set(rec.date, list)
    })
    return map
  }, [])

  const year = viewMonth.getFullYear()
  const month = viewMonth.getMonth()
  const firstWeekday = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const totalCells = Math.ceil((firstWeekday + daysInMonth) / 7) * 7

  const cells: (number | null)[] = []
  for (let i = 0; i < totalCells; i++) {
    const dayNum = i - firstWeekday + 1
    cells.push(dayNum >= 1 && dayNum <= daysInMonth ? dayNum : null)
  }

  const keyFor = (day: number) => `${year}.${pad2(month + 1)}.${pad2(day)}`
  const selectedRecords = selectedKey ? recordsByDay.get(selectedKey) ?? [] : []

  const changeMonth = (delta: number) => {
    setViewMonth(new Date(year, month + delta, 1))
    setSelectedKey(null)
  }

  return (
    <div style={{
      background: '#fff', border: '1px solid var(--hair)', borderRadius: 18,
      padding: '14px 14px 12px', marginBottom: 16,
      boxShadow: '0 8px 18px -14px rgba(22,35,61,.3)',
    }}>
      {/* Header: month nav + Google Calendar sync icon */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={() => changeMonth(-1)} aria-label="이전 달" style={{
            width: 24, height: 24, borderRadius: '50%', border: 'none',
            background: 'var(--paper-2)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--ink-70)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <span style={{ fontFamily: "'Noto Sans KR', sans-serif", fontWeight: 900, fontSize: 14, color: 'var(--ink)', minWidth: 76, textAlign: 'center' }}>
            {year}년 {month + 1}월
          </span>
          <button onClick={() => changeMonth(1)} aria-label="다음 달" style={{
            width: 24, height: 24, borderRadius: '50%', border: 'none',
            background: 'var(--paper-2)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--ink-70)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>

        <button
          onClick={() => { exportToGoogleCalendar(); setShowSyncInfo(true) }}
          title="전체 건강기록을 구글 캘린더로 내보내기"
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            background: '#F3F7FF', border: '1.5px solid #E1EAFB', borderRadius: 20,
            padding: '5px 10px', cursor: 'pointer',
            fontFamily: "'Noto Sans KR', sans-serif", fontSize: 10.5, fontWeight: 700, color: '#3B5BA8',
          }}
        >
          <GoogleIcon />
          캘린더 연동
        </button>
      </div>

      {showSyncInfo && (
        <div style={{
          background: '#F3F7FF', border: '1px solid #E1EAFB', borderRadius: 10,
          padding: '8px 10px', marginBottom: 10, display: 'flex', alignItems: 'flex-start', gap: 6,
        }}>
          <span style={{ fontSize: 12 }}>📅</span>
          <p style={{ margin: 0, fontSize: 10.5, color: '#3B5BA8', lineHeight: 1.5, flex: 1 }}>
            일정 파일(.ics)이 다운로드됐어요. 구글 캘린더 웹에서{' '}
            <b>설정 → 캘린더 가져오기</b>로 열면 전체 건강기록이 등록돼요.
          </p>
          <button onClick={() => setShowSyncInfo(false)} style={{
            background: 'none', border: 'none', cursor: 'pointer', color: '#3B5BA8', fontSize: 13, lineHeight: 1, padding: 2, flexShrink: 0,
          }}>✕</button>
        </div>
      )}

      {/* Weekday header */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 2 }}>
        {WEEKDAYS.map(w => (
          <span key={w} style={{ textAlign: 'center', fontSize: 9.5, fontWeight: 700, color: 'var(--ink-45)', padding: '2px 0' }}>{w}</span>
        ))}
      </div>

      {/* Day grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
        {cells.map((day, i) => {
          if (day === null) return <div key={i} />
          const key = keyFor(day)
          const dayRecords = recordsByDay.get(key)
          const isSelected = selectedKey === key
          return (
            <button
              key={i}
              onClick={() => dayRecords && setSelectedKey(isSelected ? null : key)}
              disabled={!dayRecords}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: 2, padding: '5px 0', borderRadius: 10, border: 'none',
                background: isSelected ? 'var(--gold)' : 'transparent',
                cursor: dayRecords ? 'pointer' : 'default',
                fontFamily: "'Roboto Mono', monospace",
              }}
            >
              <span style={{ fontSize: 11, fontWeight: dayRecords ? 800 : 500, color: isSelected ? '#fff' : dayRecords ? 'var(--ink)' : 'var(--ink-45)' }}>
                {day}
              </span>
              <span style={{ display: 'flex', gap: 2, height: 4 }}>
                {(dayRecords ?? []).slice(0, 3).map((r, di) => (
                  <span key={di} style={{
                    width: 4, height: 4, borderRadius: '50%',
                    background: isSelected ? '#fff' : (TYPE_COLOR[r.rec.type] ?? 'var(--ink)'),
                  }} />
                ))}
              </span>
            </button>
          )
        })}
      </div>

      {/* Selected day's records */}
      {selectedRecords.length > 0 && (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px dashed var(--hair)', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {selectedRecords.map(({ rec, id }) => (
            <div
              key={id}
              onClick={() => onSelectRecord(id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
                padding: '7px 9px', borderRadius: 10, background: 'var(--teal-light)',
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: TYPE_COLOR[rec.type] ?? 'var(--ink)', flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: 11.5, fontWeight: 700, color: 'var(--ink)' }}>{rec.title}</span>
              <span style={{ fontSize: 9.5, color: 'var(--ink-45)', fontWeight: 700 }}>{rec.type}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
