const API_URL = `${import.meta.env.VITE_API_URL}/gallery/album`;

export async function fetchAlbum() {
  const res = await fetch(API_URL);
  if (!res.ok) {
    throw new Error("Failed to load album");
  }

  const data = await res.json();
  return {
    photos: Array.isArray(data?.photos) ? data.photos : [],
    videos: Array.isArray(data?.videos) ? data.videos : [],
    rootPath: data?.root_path || "",
    photosPath: data?.photos_path || "",
    videosPath: data?.videos_path || "",
    total: Number(data?.total || 0),
  };
}
