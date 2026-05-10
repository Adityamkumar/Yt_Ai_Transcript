import { YoutubeTranscript } from "youtube-transcript";

export const getTranscriptFromYoutube = async (videoId: string) => {
  try {
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);

    const fullTranscript = transcript
      .map((item) => item.text)
      .join(" ");

    return fullTranscript;
  } catch (error) {
    throw new Error("Failed to fetch transcript");
  }
};