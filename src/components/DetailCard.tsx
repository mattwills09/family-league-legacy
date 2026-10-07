interface DetailCardProps {
  label: string
  value: string | number
}

export function DetailCard({ label, value }: DetailCardProps) {
  return (
    <div className="stat-card">
      <span>{ label }</span>
      <strong>{ value }</strong>
    </div>
  )
}