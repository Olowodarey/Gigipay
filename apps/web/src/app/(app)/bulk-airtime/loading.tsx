export default function BulkAirtimeLoading() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 py-8 md:py-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-3xl animate-pulse">
          {/* Back link skeleton */}
          <div className="h-4 w-36 rounded bg-muted mb-6" />

          <div className="rounded-xl border bg-card p-6 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="h-6 w-32 rounded bg-muted" />
              <div className="flex gap-2">
                <div className="h-8 w-24 rounded-md bg-muted" />
                <div className="h-8 w-28 rounded-md bg-muted" />
              </div>
            </div>
            <div className="h-4 w-80 rounded bg-muted" />

            {/* Token row */}
            <div className="flex gap-3">
              <div className="flex-1 h-9 rounded-md bg-muted" />
              <div className="h-9 w-40 rounded-md bg-muted" />
            </div>

            {/* Recipient rows */}
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="grid grid-cols-[1fr_120px_100px_36px] gap-2"
              >
                <div className="h-9 rounded-md bg-muted" />
                <div className="h-9 rounded-md bg-muted" />
                <div className="h-9 rounded-md bg-muted" />
                <div className="h-9 w-9 rounded-md bg-muted" />
              </div>
            ))}

            {/* Button */}
            <div className="h-11 w-full rounded-md bg-muted" />
          </div>
        </div>
      </div>
    </div>
  );
}
