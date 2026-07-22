import { type ReactNode } from 'react'

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="text-center py-16 px-4">
      {icon && <div className="mx-auto mb-5 text-faint [&>svg]:mx-auto">{icon}</div>}
      <h2 className="font-display font-bold text-xl text-fg mb-2">{title}</h2>
      {description && <p className="text-sm text-muted max-w-sm mx-auto mb-6">{description}</p>}
      {action}
    </div>
  )
}
