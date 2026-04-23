// Authentication temporarily disabled — open-access demo mode.
// Anyone with the link can access every route without signing in.
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
