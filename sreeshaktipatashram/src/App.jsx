import { Routes, Route } from "react-router-dom";
import WellnessWebsite from "./Pages/WellnessWebsite";
import ReadingsPage from "./Pages/ReadingsPage";
import BlogIndex from "./Pages/BlogIndex";
import BlogPost from "./Pages/BlogPost";
import GalleryPage from "./Pages/GalleryPage";
import BookingPage from "./Pages/BookingPage";
import BlogEditor from "./Pages/BlogEditor";
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
