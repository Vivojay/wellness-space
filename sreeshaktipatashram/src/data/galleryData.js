export const galleryData = {
  instagram: [
    {
      type: "video", // was "image", but it is actually a video
      media: ["/src/assets/videos/20231027_154553.mp4"], // must be an array
      caption: "Instagram caption",
      platform: "instagram",
      externalUrl: "https://instagram.com"
    },
    {
      type: "image",
      media: ["/src/assets/images/sample1.jpg"],
      caption: "Another IG post",
      platform: "instagram",
      externalUrl: "https://instagram.com"
    }
  ],
  youtube: [
    {
      type: "video",
      media: ["https://www.youtube.com/embed/dQw4w9WgXcQ"], // or URL to hosted mp4
      caption: "YouTube video",
      platform: "youtube",
      externalUrl: "https://youtube.com"
    }
  ],
  x: [
    {
      type: "image",
      media: ["https://example.com/x-post.jpg"],
      caption: "X post caption",
      platform: "x",
      externalUrl: "https://x.com"
    }
  ],
  facebook: [
    {
      type: "image",
      media: ["https://example.com/fb-post.jpg"],
      caption: "FB post caption",
      platform: "facebook",
      externalUrl: "https://facebook.com"
    }
  ]
};
