import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
} from "@tanstack/react-router";

function NotFoundComponent() {
  return (
    <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", background: "var(--depth-abyss)", color: "var(--text-primary)", flexDirection: "column", gap: 16, fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ fontSize: 72, fontFamily: "'Syne', sans-serif", fontWeight: 800 }}>404</div>
      <div style={{ fontSize: 18, opacity: 0.6 }}>Page not found</div>
      <Link to="/" style={{ color: "var(--accent-arctic)", textDecoration: "none", fontSize: 14, marginTop: 8 }}>← Go home</Link>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", background: "var(--depth-abyss)", color: "var(--text-primary)", flexDirection: "column", gap: 16, fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ fontSize: 24, fontFamily: "'Syne', sans-serif", fontWeight: 700 }}>Something went wrong</div>
      <button onClick={() => { router.invalidate(); reset(); }} style={{ background: "var(--accent-arctic)", color: "var(--depth-abyss)", border: "none", borderRadius: 999, padding: "10px 20px", cursor: "pointer", fontWeight: 600 }}>
        Try again
      </button>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  );
}
