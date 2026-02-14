import { Routes, Route } from "react-router-dom";
import WellnessWebsite from "./pages/WellnessWebsite";
import ReadingsPage from "./pages/ReadingsPage";
import BlogIndex from "./pages/BlogIndex";
import BlogPost from "./pages/BlogPost";
import GalleryPage from "./pages/GalleryPage";
import BookingPage from "./pages/BookingPage";
import BlogEditor from "./pages/BlogEditor";
import AppShell from "./layouts/AppShell";

function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<WellnessWebsite />} />
        <Route path="/readings" element={<ReadingsPage />} />
        <Route path="/blog" element={<BlogIndex />} />
        <Route path="/blog/new" element={<BlogEditor />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/blog/edit/:slug" element={<BlogEditor />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/booking" element={<BookingPage />} />
      </Route>
    </Routes>
  );
}

export default App;
