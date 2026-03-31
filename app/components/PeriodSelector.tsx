import Link from 'next/link'

const PERIODS = [
  { label: '7 days', value: '7' },
  { label: '30 days', value: '30' },
  { label: '90 days', value: '90' },
] as const

export function PeriodSelector({ current }: { current: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-semibold uppercase tracking-widest text-green-forest/60 font-serif mr-1">
        Period
      </span>
      {PERIODS.map(({ label, value }) => {
        const isActive = current === value
        return (
          <Link
            key={value}
            href={`?period=${value}`}
            className={[
              'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-green-forest text-white'
                : 'bg-beige border border-green-olive/40 text-green-forest hover:bg-green-olive/10',
            ].join(' ')}
          >
            {label}
          </Link>
        )
      })}
    </div>
  )
}
