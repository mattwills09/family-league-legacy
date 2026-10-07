import type { LucideIcon } from 'lucide-react';

interface DetailCardProps {
  label: string
  value: string | number
  icon?: LucideIcon
}

export function DetailCard({
  label,
  value,
  icon: Icon,
}: DetailCardProps) {
  return (
    <div className="detail-card">
      <div className="detail-card-label">
        {Icon && <Icon className="icon icon-sm" />}
        <span>{label}</span>
      </div>

      <strong>{value}</strong>
    </div>
  )
}