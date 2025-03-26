import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcrypt";
import prisma from "@/lib/prisma";

const handler = NextAuth({
    providers: [
      CredentialsProvider({
          name: 'Credentials',
          credentials: {
            name: {label: "Name", type: "text", placeholder: "kiran", required: true},
            email: { label: "Email", type: "email", placeholder: "xyz@gmail.com", required: true },
            password: { label: "Password", type: "password", required: true }
          },
          // TODO: User credentials type from next-aut
          async authorize(credentials: any) {
            // Do zod validation, OTP validation here
            const hashedPassword = await bcrypt.hash(credentials.password, 10);
            const existingUser = await prisma.user.findFirst({
                where: {
                    email: credentials.email
                }
            });

            if (existingUser) {
                const passwordValidation = await bcrypt.compare(credentials.password, existingUser.password || "");
                if (passwordValidation) {
                    return {
                        id: existingUser.id.toString(),
                        name: existingUser.name,
                        email: existingUser.email
                    }
                }
                return null;
            }

            try {
                const user = await prisma.user.create({
                    data: {
                        name: credentials.name,
                        email: credentials.email,
                        password: hashedPassword
                    }
                });
            
                return {
                    id: user.id.toString(),
                    name: user.name,
                    email: user.email
                }
            } catch(e) {
                console.log("This is error")
                console.error(e);
            }

            return null
          },
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || ""
        })
    ],
    secret: process.env.JWT_SECRET ,
    callbacks: {
        async signIn({ user, account }) {
            if (account?.provider === "google") {
              const existingUser = await prisma.user.findUnique({
                where: { email: user.email || "" }
              });
      
              if (!existingUser) {
                await prisma.user.create({
                  data: {
                    name: user.name || "",
                    email: user.email || "",
                    image: user.image || "",
                    password: null  
                  }
                });
              }
            }
            return true;
          },        
        // TODO: can u fix the type here? Using any is bad
        async session({ token, session }: any) {
            session.user.id = token.sub

            return session
        },
        async redirect() {
            return `${process.env.NEXTAUTH_URL}/`;  
          }
    }
  })

  export { handler as GET, handler as POST };





  