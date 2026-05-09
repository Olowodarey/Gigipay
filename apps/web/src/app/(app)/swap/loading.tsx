export default function SwapLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-lg mx-auto px-4 py-16 animate-pulse">
        <div className="text-center mb-10 space-y-4">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-muted" />
          <div className="mx-auto h-10 w-24 rounded-lg bg-muted" />
          <div className="mx-auto h-5 w-64 rounded bg-muted" />
        </div>
        <div className="rounded-xl border bg-card p-8 space-y-4 text-center">
          <div className="mx-auto w-8 h-8 rounded bg-muted" />
          <div className="mx-auto h-5 w-32 rounded bg-muted" />
          <div className="mx-auto h-4 w-72 rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}
