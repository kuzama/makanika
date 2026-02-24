export default function MechanicDetailSkeleton() {
  return (
    <div className="max-w-4xl mx-auto p-4 animate-pulse" aria-hidden="true">
      {/* Header */}
      <div className="bg-white rounded-lg p-6 mb-6 border border-gray-200">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="h-7 w-64 bg-gray-200 rounded mb-2" />
            <div className="h-4 w-40 bg-gray-200 rounded mb-1" />
            <div className="h-4 w-32 bg-gray-200 rounded" />
          </div>
          <div className="h-8 w-20 bg-gray-200 rounded-full" />
        </div>
        <div className="h-16 w-full bg-gray-200 rounded" />
      </div>

      {/* Map placeholder */}
      <div className="h-64 bg-gray-200 rounded-lg mb-6" />

      {/* Details */}
      <div className="bg-white rounded-lg p-6 mb-6 border border-gray-200">
        <div className="h-5 w-32 bg-gray-200 rounded mb-3" />
        <div className="flex gap-2 mb-4">
          <div className="h-6 w-16 bg-gray-200 rounded-full" />
          <div className="h-6 w-20 bg-gray-200 rounded-full" />
          <div className="h-6 w-14 bg-gray-200 rounded-full" />
        </div>
        <div className="h-5 w-28 bg-gray-200 rounded mb-3" />
        <div className="flex gap-2">
          <div className="h-6 w-24 bg-gray-200 rounded-full" />
          <div className="h-6 w-20 bg-gray-200 rounded-full" />
        </div>
      </div>

      {/* Reviews placeholder */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="h-5 w-24 bg-gray-200 rounded mb-4" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="mb-4 pb-4 border-b border-gray-100 last:border-b-0">
            <div className="h-4 w-32 bg-gray-200 rounded mb-2" />
            <div className="h-4 w-full bg-gray-200 rounded mb-1" />
            <div className="h-4 w-3/4 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
