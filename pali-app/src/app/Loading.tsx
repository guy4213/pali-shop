export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-yellow-400 border-t-transparent animate-spin" />
        <p className="text-sm text-gray-400 font-medium">טוען...</p>
      </div>
    </div>
  )
}