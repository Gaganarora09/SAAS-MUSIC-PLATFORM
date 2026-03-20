import { prismaClient } from "@/app/lib/db";
import { NextRequest, NextResponse } from "next/server";

// GET current playing stream
export async function GET(req: NextRequest) {
  const creatorId = req.nextUrl.searchParams.get("creatorId");
  const stream = await prismaClient.stream.findFirst({
    where: { userId: creatorId ?? "", active: false }, // active:false = currently playing
  });
  return NextResponse.json({ stream });
}

// SET current playing stream
export async function POST(req: NextRequest) {
  const { streamId, creatorId } = await req.json();
  
  // reset all streams to active:true
  await prismaClient.stream.updateMany({
    where: { userId: creatorId },
    data: { active: true }
  });

  // mark current as active:false (playing)
  await prismaClient.stream.update({
    where: { id: streamId },
    data: { active: false }
  });

  return NextResponse.json({ message: "Now playing updated" });
}