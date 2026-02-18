
import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";
import {prismaClient} from "@/app/lib/db"
const YT_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[A-Za-z0-9_-]{11}$/;
import { StreamType } from "@prisma/client";


const CreateStreamSchema=z.object({
    creatorId:z.string(),
    url:z.string()
})


//user can create room.

export async function POST(req:NextRequest){
    try{
        const data=CreateStreamSchema.parse(await req.json());
        const isYt=YT_REGEX.test(data.url);
        if(!isYt){
            return NextResponse.json({
                message:"Url Is Wrong"
            },{
                status:411
            })
        }
        const extractedId=data.url.split("?v=")[1];

        await prismaClient.stream.create({
            data:{
                userId:data.creatorId,
                url:data.url,
                extractedId,
                type:StreamType.Youtube
            }
           
        })
    }catch(e){
        return NextResponse.json({
            message:"Credential are wrong acc. to Defined"
        })
    }
} 

//To fetch all the streams

export async function Get(req:NextRequest){
    const creatorId =req.nextUrl.searchParams.get("creatorId");
    const streams=await prismaClient.stream.findMany({
        where:{
            userId:creatorId??""
        }
    })

    return NextResponse.json({
        streams
    })
}