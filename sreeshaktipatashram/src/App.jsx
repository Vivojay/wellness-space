import { Routes, Route } from "react-router-dom";
import WellnessWebsite from "./Pages/WellnessWebsite";
import ReadingsPage from "./Pages/ReadingsPage";
import BlogIndex from "./Pages/BlogIndex";
import BlogPost from "./Pages/BlogPost";
import GalleryPage from "./Pages/GalleryPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<WellnessWebsite />} />
      <Route path="/readings" element={<ReadingsPage />} />
      <Route path="/blog" element={<BlogIndex />} />
      <Route path="/blog/:slug" element={<BlogPost />} />
      <Route path="/gallery" element={<GalleryPage />} />
    </Routes>
  );
}

export default App;
