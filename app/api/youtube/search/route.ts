export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query) {
      return Response.json([]);
    }

    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&maxResults=7&key=${process.env.YOUTUBE_API_KEY}`
    );

    if (!res.ok) {
      console.error("YouTube API failed:", res.status);
      return Response.json([]);
    }

    const data = await res.json();

    if (!data.items) {
      console.error("Invalid YouTube response:", data);
      return Response.json([]);
    }

    const cleaned = data.items.map((item: any) => ({
      videoId: item.id?.videoId,
      title: item.snippet?.title,
      thumbnail: item.snippet?.thumbnails?.medium?.url,
    })).filter((v: any) => v.videoId);

    return Response.json(cleaned);

  } catch (err) {
    console.error("API crashed:", err);
    return Response.json([]);
  }
}