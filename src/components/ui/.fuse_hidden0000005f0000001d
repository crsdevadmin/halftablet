import { cn } from '@/lib/utils'

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn('animate-pulse rounded-lg bg-surface-2', className)} />
}

/** Placeholder matching MedicineCard's layout, for loading grids. */
export function MedicineCardSkeleton() {
  return (
    <div className="card p-0 overflow-hidden">
      <Skeleton className="h-40 rounded-none" />
      <div className="p-4 space-y-2.5">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-6 w-2/5" />
        <Skeleton className="h-9 w-full rounded-xl" />
      </div>
    </div>
  )
}
