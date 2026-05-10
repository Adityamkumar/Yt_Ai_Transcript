export const extractVideoId = (url: string): string => {
  const regex =
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/;

  const match = url.match(regex);

  if (!match) {
    throw new Error("Invalid YouTube URL");
  }

  return match[1]!;
};