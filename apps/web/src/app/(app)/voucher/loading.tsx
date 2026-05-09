export default function VoucherLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-16 animate-pulse">
        {/* Header skeleton */}
        <div className="text-center mb-14 space-y-4">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-muted" />
          <div className="mx-auto h-10 w-40 rounded-lg bg-muted" />
          <div className="mx-auto h-5 w-96 rounded bg-muted" />
          <div className="mx-auto h-5 w-72 rounded bg-muted" />
        </div>
        {/* Cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border bg-card p-6 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-muted" />
              <div className="h-5 w-32 rounded bg-muted" />
              <div className="space-y-2">
                <div className="h-4 w-full rounded bg-muted" />
                <div className="h-4 w-4/5 rounded bg-muted" />
              </div>
              <div className="h-9 w-full rounded-md bg-muted" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
