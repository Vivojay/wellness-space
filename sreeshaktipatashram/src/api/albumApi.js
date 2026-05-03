const API_URL = `${import.meta.env.VITE_API_URL}/gallery/album`;
const STREAM_URL = `${API_URL}/stream`;

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

export async function streamAlbum({ onMeta, onItem, onDone, signal } = {}) {
  const res = await fetch(STREAM_URL, {
    headers: {
      Accept: "application/x-ndjson",
    },
    signal,
  });

  if (!res.ok || !res.body) {
    throw new Error("Failed to stream album");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (!line.trim()) continue;
      const event = JSON.parse(line);
      if (event.type === "meta") {
        onMeta?.(event);
      } else if (event.type === "item") {
        onItem?.(event.item);
      } else if (event.type === "done") {
        onDone?.(event.counts);
      }
    }
  }

  if (buffer.trim()) {
    const event = JSON.parse(buffer);
    if (event.type === "done") {
      onDone?.(event.counts);
    }
  }
}
