import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[60vh]">
      <Loader2 size={36} className="animate-spin text-yellow-500" />
    </div>
  )
}
