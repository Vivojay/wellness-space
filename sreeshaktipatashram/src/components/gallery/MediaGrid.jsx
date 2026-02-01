// components/gallery/MediaGrid.jsx
import MediaTile from "./MediaTile";

export default function MediaGrid({ items = [], onOpen }) {
  if (!Array.isArray(items) || items.length === 0) {
    return <div className="empty-state">No media yet</div>;
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-0 w-full">
      {items.map((item, idx) => (
        <MediaTile
          key={idx}
          item={item}
          onOpen={onOpen}
        />
      ))}
    </div>
  )
}
