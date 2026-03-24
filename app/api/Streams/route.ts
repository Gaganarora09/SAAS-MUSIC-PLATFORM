import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prismaClient } from "@/app/lib/db";
import { StreamType } from "@prisma/client";

const YT_REGEX = /^(?:(?:https?:)?\/\/)?(?:www\.)?(?:m\.)?(?:youtu(?:be)?\.com\/(?:v\/|embed\/|watch(?:\/|\?v=))|youtu\.be\/)((?:\w|-){11})(?:\S+)?$/;

const CreateStreamSchema = z.object({
  creatorId: z.string(),
  url: z.string()
});

export async function POST(req: NextRequest) {
  try {
    const data = CreateStreamSchema.parse(await req.json());
    const isYt = data.url.match(YT_REGEX);
    if (!isYt) {
      return NextResponse.json({ message: "Url Is Wrong" }, { status: 411 });
    }

    // const extractedId = data.url.split("?v=")[1]?.split("&")[0];



// that precious was not extracting the link the youtube>si= it was only working for youtube?v=
    const urlObj = new URL(data.url.startsWith("http") ? data.url : `https://${data.url}`);
const extractedId = urlObj.searchParams.get("v") || data.url.split("youtu.be/")[1]?.split("?")[0];




    if (!extractedId) {
      return NextResponse.json({ message: "Invalid YouTube URL format" }, { status: 411 });
    }

    // Use YouTube oEmbed API instead of youtubesearchapi
    const oembedRes = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${extractedId}&format=json`
    );
    const oembedData = await oembedRes.json();
    const title = oembedData.title ?? "YouTube Video";

    const stream = await prismaClient.stream.create({
      data: {
        userId: data.creatorId,
        url: data.url,
        extractedId,
        type: StreamType.Youtube,
        title,
        smallImg: `https://img.youtube.com/vi/${extractedId}/hqdefault.jpg`,
        bigImg: `https://img.youtube.com/vi/${extractedId}/maxresdefault.jpg`,
      }
    });

    return NextResponse.json({ message: "Added stream", id: stream.id });
  } catch(e) {
    console.error("Error details:", e);
    return NextResponse.json({
      message: "Error creating stream",
      error: e instanceof Error ? e.message : "Unknown error"
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const creatorId = req.nextUrl.searchParams.get("creatorId");
    if (!creatorId) {
      return NextResponse.json({ message: "Missing creatorId" }, { status: 400 });
    }
    const streams = await prismaClient.stream.findMany({
      where: { userId: creatorId },
      include: { upvotes: true }
    });
    return NextResponse.json({ streams });
  } catch(e) {
    console.error("GET streams error:", e);
    return NextResponse.json({
      message: "Error fetching streams",
      error: e instanceof Error ? e.message : "Unknown error"
    }, { status: 500 });
  }
}