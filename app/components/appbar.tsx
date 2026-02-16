"use client";
import {signIn,signOut,useSession} from "next-auth/react";
import useSWR from 'swr'

export default function Appbar(){
    const session=useSession();

    return <div>
        {session.data?.user && <button className="m-2 p-2 bg-blue-400"  onClick={()=>signOut()}>Logout</button>}
        {!session.data?.user && <button className="m-2 p-2 bg-blue-400" onClick={()=>signIn()}>Signin</button>}
    </div>
}