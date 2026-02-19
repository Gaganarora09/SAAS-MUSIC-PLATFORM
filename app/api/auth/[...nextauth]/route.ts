import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import {prismaClient} from "@/app/lib/db";

const handler = NextAuth({
  // i want to use google/github
  providers: [
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID??"",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET??""
  }),
   GitHubProvider({
    clientId: process.env.GITHUB_ID??"",
    clientSecret: process.env.GITHUB_SECRET??""
  }),
],
callbacks:{
  async signIn(params){
    console.log(params);
    if(!params.user.email){
      return false;
    }
    try{
      await prismaClient.user.create({
        data:{
          email:params.user.email,
          provider:"Google"
        }

      }) 
    }catch(e){

    }
    return true;
  }
}

});

export { handler as GET, handler as POST }





