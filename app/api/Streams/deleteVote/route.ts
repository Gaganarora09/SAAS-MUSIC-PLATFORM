import { prismaClient } from "@/app/lib/db"; 
import {NextRequest} from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { streamId } = await req.json();

    if (!streamId) {
      return Response.json({ error: "Missing streamId" }, { status: 400 });
    }

    await prismaClient.upvote.deleteMany({
      where: {
        streamId: streamId,
      },
    });

    return Response.json({ message: "Upvotes deleted" });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}