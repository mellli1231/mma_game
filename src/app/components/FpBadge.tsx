interface FpBadgeProps {
  amount: number
  animate?: boolean
}

export function FpBadge({ amount }: FpBadgeProps) {
  return (
    <span className="focu-fp">
      <svg className="focu-fp__coin" width="22" height="22" viewBox="0 0 22 22" aria-hidden="true">
        <circle cx="11" cy="11" r="9" fill="#FFF3C4" stroke="#1F2033" strokeWidth="2" />
        <path d="M7.5 11h7" stroke="#1F2033" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <span className="tabular-nums">{amount}</span>
    </span>
  )
}
