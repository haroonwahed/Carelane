import { useLayoutEffect, useState } from "react";
import { MultiTenantDemo } from "./components/examples/MultiTenantDemo";
import { PublicLandingPage } from "./components/public/PublicLandingPage";
import { LoginPage } from "./components/care/LoginPage";
import { LOGIN_URL, PUBLIC_LANDING_URL, LOGOUT_URL, REGISTER_URL } from "./lib/routes";
import { Toaster } from "./components/ui/sonner";
import { ErrorBoundary } from "./components/ui/ErrorBoundary";

/** Keep SPA routing in sync with `window.location` when the shell uses `history.pushState` / `replaceState`. */
function useSyncedPathname(): string {
  const [pathname, setPathname] = useState(
    () => (typeof window !== "undefined" ? window.location.pathname : "/"),
  );
  useLayoutEffect(() => {
    const sync = () => setPathname(window.location.pathname);
    window.addEventListener("popstate", sync);
    const originalPush = history.pushState.bind(history);
    const originalReplace = history.replaceState.bind(history);
    history.pushState = (...args: Parameters<typeof originalPush>) => {
      originalPush(...args);
      sync();
    };
    history.replaceState = (...args: Parameters<typeof originalReplace>) => {
      originalReplace(...args);
      sync();
    };
    return () => {
      window.removeEventListener("popstate", sync);
      history.pushState = originalPush;
      history.replaceState = originalReplace;
    };
  }, []);
  return pathname;
}

export default function App() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") {
      return "light";
    }

    const storedTheme = window.localStorage.getItem("careon-theme");
    if (storedTheme === "light" || storedTheme === "dark") {
      if (storedTheme === "dark") document.documentElement.classList.add("dark");
      return storedTheme;
    }

    document.documentElement.classList.remove("dark");
    return "light";
  });
  const [isDashboardView] = useState(() => new URLSearchParams(window.location.search).get("view") === "dashboard");
  const pathname = useSyncedPathname();
  const isPublicRoute = pathname === PUBLIC_LANDING_URL;
  const normalizedPath = pathname.replace(/\/+$/, "") || "/";
  const isLoginRoute = normalizedPath === LOGIN_URL.replace(/\/+$/, "");
  const isLegacyAuthRoute = [LOGOUT_URL, REGISTER_URL].some(
    u => normalizedPath === u.replace(/\/+$/, ""),
  );
  const effectiveTheme: "light" | "dark" = theme;

  useLayoutEffect(() => {
    window.localStorage.setItem("careon-theme", theme);
    if (effectiveTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [effectiveTheme, theme]);

  // Legacy Django pages (logout, register) — redirect to Django directly
  if (isLegacyAuthRoute) {
    window.location.replace(`http://127.0.0.1:8000${window.location.pathname}${window.location.search}`);
    return null;
  }

  if (isPublicRoute && !isDashboardView) {
    return (
      <div className={effectiveTheme === "dark" ? "dark" : ""}>
        <PublicLandingPage
          onThemeToggle={() => setTheme((currentTheme) => currentTheme === "dark" ? "light" : "dark")}
        />
      </div>
    );
  }

  if (isLoginRoute) {
    return <LoginPage />;
  }

  return (
    <ErrorBoundary>
      <div className={effectiveTheme === "dark" ? "dark" : ""}>
        <MultiTenantDemo
          theme={effectiveTheme}
          onThemeToggle={() => setTheme((currentTheme) => currentTheme === "dark" ? "light" : "dark")}
        />
        <Toaster position="bottom-right" richColors />
      </div>
    </ErrorBoundary>
  );
}
