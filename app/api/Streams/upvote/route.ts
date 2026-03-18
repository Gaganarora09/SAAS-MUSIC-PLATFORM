
import {prismaClient} from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextRequest,NextResponse } from "next/server";
import {z} from "zod";

const UpvoteSchema=z.object({
    streamId:z.string(),
})

//Upvote a song

export async function POST(req:NextRequest){
    const session=await getServerSession(authOptions);
    console.log("Session:", session); 
  console.log("Email:", session?.user?.email); 
    const user=await prismaClient.user.findFirst({
        where:{
            email:session?.user?.email ??""
        }
    })
    if(!user){
        return NextResponse.json({
            message:"Unauthorized/Login first"
        },{
            status:403
        })
    }
    try{
        const data=UpvoteSchema.parse(await req.json());
        await prismaClient.upvote.create({
            data:{
                userId:user.id,
                streamId:data.streamId
            }
        })
        return NextResponse.json({
            message:"Upvoted successfully"
        },{
            status:200
        })
    }
    catch(e){
        return NextResponse.json({
            message:"Unauthorized"
        },{
            status:403
        })
    }
}