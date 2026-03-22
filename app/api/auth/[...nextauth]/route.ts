import NextAuth, { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { prismaClient } from "@/app/lib/db";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? ""
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID ?? "",
      clientSecret: process.env.GITHUB_SECRET ?? ""
    }),
  ],
  
  callbacks: {
    async signIn(params) {
      if (!params.user.email) return false;
      try {
        await prismaClient.user.upsert({
          where: { email: params.user.email },
          update: {},
          create: {
            email: params.user.email,
            provider: params.account?.provider === "github" ? "Github" : "Google"
          }
        });
        return true;
      } catch(e) {
        console.error("signinerror",e);
        return true; 
      }
    },
   async session({ session, token }) {
  if (session.user) {
    try {
      const dbUser = await prismaClient.user.findUnique({
        where: { email: session.user.email! }
      });
      if (dbUser) {
        (session.user as any).id = dbUser.id; // ← cast to any
      }
    } catch(e) {
      console.error("session error:", e);
    }
  }
  return session;
},
    // async redirect({ url, baseUrl }) {
    //   // Always redirect to /dashboard after sign-in
    //   return "/dashboard";
    // }
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }

