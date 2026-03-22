
import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {prismaClient} from "@/app/lib/db"
import youtubesearchapi from "youtube-search-api";
var YT_REGEX = /^(?:(?:https?:)?\/\/)?(?:www\.)?(?:m\.)?(?:youtu(?:be)?\.com\/(?:v\/|embed\/|watch(?:\/|\?v=))|youtu\.be\/)((?:\w|-){11})(?:\S+)?$/;

import { StreamType } from "@prisma/client";


const CreateStreamSchema=z.object({
    creatorId:z.string(),
    url:z.string()
})


//user can create room.

export async function POST(req:NextRequest){
    try{
        const data=await CreateStreamSchema.parse(await req.json());
        console.log(`[POST /api/Streams] Attempting to add song for creatorId: ${data.creatorId}, url: ${data.url}`);
        const isYt=data.url.match(YT_REGEX);
        if(!isYt){
            return NextResponse.json({
                message:"Url Is Wrong"
            },{
                status:411
            })
        }
        const extractedId = data.url.split("?v=")[1]?.split("&")[0];
        const res= await youtubesearchapi.GetVideoDetails(extractedId);
        const thumbnails=res.thumbnail.thumbnails;
        thumbnails.sort((a :{width:number},b:{width:number})=>a.width<b.width?-1:1);

        if(!extractedId){
            return NextResponse.json({
                message:"Invalid YouTube URL format"
            },{
                status:411
            })
        }

        const stream=await prismaClient.stream.create({
            data:{
                userId:data.creatorId,
                url:data.url,
                extractedId,
                type:StreamType.Youtube,
                title:res.title??"Cant find video",
                smallImg:(thumbnails.length>1?thumbnails[thumbnails.length-2]:thumbnails[thumbnails.length-1])?.url??"",
                bigImg:thumbnails[thumbnails.length-1]?.url??"https://plus.unsplash.com/premium_photo-1673967831980-1d377baaded2?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Y2F0c3xlbnwwfHwwfHx8MA%3D%3D",
            }
        });
        // Log the current queue after adding
        const queue = await prismaClient.stream.findMany({
            where: { userId: data.creatorId },
            orderBy: { createdAt: "asc" }
        });
        console.log(`[POST /api/Streams] Added stream for user ${data.creatorId}. Current queue:`, queue.map(q => ({id: q.id, title: q.title, active: q.active})));
        return NextResponse.json({
            message:"Added stream",
            id:stream.id
        })
    }catch(e){
        console.error("Error details:", e);
        return NextResponse.json({
            message:"Error creating stream",
            error: e instanceof Error ? e.message : "Unknown error"
        },{
            status:500
        })
    }
} 

//To fetch all the streams

export async function GET(req:NextRequest){
    const creatorId = req.nextUrl.searchParams.get("creatorId");
    if (!creatorId) {
        return NextResponse.json({ message: "Missing creatorId" }, { status: 400 });
    }

    // Get currently playing stream (active: false)
    const currentlyPlaying = await prismaClient.stream.findFirst({
        where: {
            userId: creatorId,
            active: false
        },
        include: { upvotes: true }
    });

    // Get queue (active: true)
    const queue = await prismaClient.stream.findMany({
        where: {
            userId: creatorId,
            active: true
        },
        include: { upvotes: true },
        orderBy: { createdAt: "asc" }
    });

    // Log the current queue and now playing
    console.log(`[GET /api/Streams] For user ${creatorId}: nowPlaying:`, currentlyPlaying?.title, 'queue:', queue.map(q => q.title));

    return NextResponse.json({
        currentlyPlaying,
        queue
    });
}