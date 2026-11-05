import { lazy, Suspense } from "react";
import { MotionConfig } from "framer-motion";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ContentProvider } from "./lib/content";
import PublicLayout from "./components/PublicLayout";
import Home from "./pages/Home";

const AdminRoot = lazy(() => import("./pages/AdminRoot"));

function AdminFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink text-cream">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-rose-900/15 border-t-rose-500" />
    </div>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <ContentProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route index element={<Home />} />
            </Route>
            <Route
              path="/admin"
              element={
                <Suspense fallback={<AdminFallback />}>
                  <AdminRoot />
                </Suspense>
              }
            />
          </Routes>
        </BrowserRouter>
      </ContentProvider>
    </MotionConfig>
  );
}
