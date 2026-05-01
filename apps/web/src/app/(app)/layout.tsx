// Force dynamic rendering for all pages in this route group
export const dynamic = "force-dynamic";

/**
 * Layout wrapper for the (app) route group.
 * Forces dynamic rendering on all child pages to prevent stale wallet state.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
