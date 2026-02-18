import {prismaClient} from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest,NextResponse } from "next/server";
import {z} from "zod";

const UpvoteSchema=z.object({
    streamId:z.string(),
})

export async function Post(req:NextResponse){
    const session=await getServerSession();
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
        await prismaClient.upvote.delete({
            where:{
                userId_streamId:{
                     userId:user.id,
                     streamId:data.streamId
                }
               
            }
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