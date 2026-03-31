'use client'

import { useState, useEffect } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

type DayCount = { date: string; count: number }

export function ScanChart({ data }: { data: DayCount[] }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  return (
    <div className="h-56 rounded-md bg-beige px-2 py-2">
      {mounted && <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#6b8f3e33" />
          <XAxis
            dataKey="date"
            tickFormatter={(v: string) => {
              const parts = v.split('-')
              return `${parts[1]}/${parts[2]}`
            }}
            tick={{ fontSize: 11, fill: '#2c2c2c99' }}
            interval="preserveStartEnd"
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11, fill: '#2c2c2c99' }}
          />
          <Tooltip
            contentStyle={{ fontSize: 12, borderColor: '#6b8f3e', background: '#fafaf7' }}
            labelFormatter={(v) => String(v)}
          />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#3a5a2a"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: '#3a5a2a' }}
          />
        </LineChart>
      </ResponsiveContainer>}
    </div>
  )
}
