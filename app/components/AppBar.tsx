"use client";


import { signIn, signOut, useSession } from "next-auth/react"
import { Providers } from "../Provider";

export const Appbar = () =>{
    const session = useSession()

    return (
        <div>
            <button onClick={()=> signIn()}>signIn</button>
            <button onClick={() => signOut()}>Sign Out</button>

            <div>
                {JSON.stringify(session)}
            </div>
        </div>
    )
}