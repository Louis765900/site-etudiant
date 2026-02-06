export default function DashboardLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="h-8 w-64 bg-gray-200 rounded-lg animate-pulse"></div>
        <div className="h-5 w-40 bg-gray-100 rounded-lg animate-pulse mt-2"></div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div className="h-4 w-24 bg-gray-100 rounded animate-pulse"></div>
            <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mt-2"></div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="h-6 w-40 bg-gray-200 rounded animate-pulse mb-4"></div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 py-3">
                <div className="w-2 h-2 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 w-48 bg-gray-100 rounded animate-pulse"></div>
                  <div className="h-3 w-24 bg-gray-50 rounded animate-pulse mt-1"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4"></div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="py-3">
                <div className="h-4 w-32 bg-gray-100 rounded animate-pulse"></div>
                <div className="h-3 w-24 bg-gray-50 rounded animate-pulse mt-1"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
