import { Routes, Route } from "react-router-dom";
import WellnessWebsite from "./pages/WellnessWebsite";
import ReadingsPage from "./pages/ReadingsPage";
import BlogIndex from "./pages/BlogIndex";
import BlogPost from "./pages/BlogPost";
import GalleryPage from "./pages/GalleryPage";
import BookingPage from "./pages/BookingPage";
import BlogEditor from "./pages/BlogEditor";
import DonatePage from "./pages/DonatePage";
import AppShell from "./layouts/AppShell";
import AdminLogin from "./pages/AdminLogin";
import AdminBlogPreview from "./pages/AdminBlogPreview";
import RequireAdmin from "./auth/RequireAdmin";
import FeedPage from "./pages/FeedPage";

function App() {
  return (
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
      </Route>
    </Routes>
  );
}

export default App;
