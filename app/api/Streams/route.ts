
import {NextRequest,NextResponse} from "next/server";
import {z} from "zod";

const CreateStreamSchema=z.object({
    creatorId:String,
    url:String
})

export async function POST(req:NextRequest){
    try{
        const data=CreateStreamSchema.parse(await req.json());
    }catch(e){
        return NextResponse.json({
            message:"Credential are wrong acc. to Defined"
        })
    }
}