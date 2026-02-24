export default function MechanicCardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 animate-pulse" aria-hidden="true">
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="h-5 w-48 bg-gray-200 rounded mb-2" />
          <div className="h-4 w-32 bg-gray-200 rounded" />
        </div>
        <div className="h-6 w-16 bg-gray-200 rounded-full" />
      </div>

      <div className="flex gap-2 mb-3">
        <div className="h-6 w-14 bg-gray-200 rounded-full" />
        <div className="h-6 w-18 bg-gray-200 rounded-full" />
        <div className="h-6 w-20 bg-gray-200 rounded-full" />
      </div>

      <div className="flex gap-2 mb-3">
        <div className="h-5 w-24 bg-gray-200 rounded" />
        <div className="h-5 w-20 bg-gray-200 rounded" />
      </div>

      <div className="flex justify-between items-center">
        <div className="h-4 w-20 bg-gray-200 rounded" />
        <div className="h-4 w-24 bg-gray-200 rounded" />
      </div>
    </div>
  );
}
