import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";

import AppShell from "./layouts/AppShell";
import RequireAdmin from "./auth/RequireAdmin";

const WellnessWebsite = lazy(() => import("./pages/WellnessWebsite"));
const ReadingsPage = lazy(() => import("./pages/ReadingsPage"));
const BlogIndex = lazy(() => import("./pages/BlogIndex"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const GalleryPage = lazy(() => import("./pages/GalleryPage"));
const BookingPage = lazy(() => import("./pages/BookingPage"));
const BlogEditor = lazy(() => import("./pages/BlogEditor"));
const DonatePage = lazy(() => import("./pages/DonatePage"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminBlogPreview = lazy(() => import("./pages/AdminBlogPreview"));
const FeedPage = lazy(() => import("./pages/FeedPage"));
const AdminDonations = lazy(() => import("./pages/AdminDonations"));

function RouteFallback() {
  return (
    <div className="min-h-[45vh] grid place-items-center">
      <p className="text-xs tracking-[0.25em] uppercase text-neutral-500">Loading</p>
    </div>
  );
}

function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<WellnessWebsite />} />
          <Route path="/readings" element={<ReadingsPage />} />
          <Route path="/blog" element={<BlogIndex />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/donate" element={<DonatePage />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin/blog"
            element={
              <RequireAdmin>
                <BlogIndex adminView />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/blog/new"
            element={
              <RequireAdmin>
                <BlogEditor />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/blog/edit/:slug"
            element={
              <RequireAdmin>
                <BlogEditor />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/blog/preview/:slug"
            element={
              <RequireAdmin>
                <AdminBlogPreview />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/feed"
            element={
              <RequireAdmin>
                <FeedPage adminView />
              </RequireAdmin>
            }
          />
          <Route
            path="/admin/donations"
            element={
              <RequireAdmin>
                <AdminDonations />
              </RequireAdmin>
            }
          />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
