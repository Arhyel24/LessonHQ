export const isValidYouTubeUrl = (url: string): boolean => {
  const regex =
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/;
  return regex.test(url);
};

export const getYouTubeThumbnail = (url: string): string => {
  const videoId = extractYouTubeVideoId(url);
  return videoId ? `https://img.youtube.com/vi/${videoId}/0.jpg` : "";
};

// Extracts the YouTube video ID from the URL
export const extractYouTubeVideoId = (url: string): string | null => {
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)(?:&[\w=?-]*)?/
  );
  return match ? match[1] : null;
};

// Removes query parameters and returns the clean base video URL
export const cleanYouTubeUrl = (url: string): string => {
  const videoId = extractYouTubeVideoId(url);
  return videoId ? `https://www.youtube.com/watch?v=${videoId}` : url;
};
