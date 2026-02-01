import { useState, useEffect } from "react";
import MediaGrid from "./MediaGrid";
import MaximizedViewer from "./MaximizedViewer";

export function GallerySection({ platform }) {
  const [items, setItems] = useState([]);
  const [activeItem, setActiveItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:8000/gallery/${platform}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setItems(data);
          setLoading(false);
        } else {
          console.error("Invalid gallery response:", data);
          setItems([]);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error("Gallery fetch failed:", err);
        setItems([]);
        setLoading(false);
      });
  }, [platform]);

  return (
    <>
      {loading && <div>Loading {platform}…</div>}

      <MediaGrid
        items={items}                            // ✅ USE FETCHED ITEMS
        onOpen={setActiveItem}
      />

      {activeItem && (
        <MaximizedViewer
          item={activeItem}
          onClose={() => setActiveItem(null)}
        />
      )}
    </>
  );
}
