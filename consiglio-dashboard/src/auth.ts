import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

export const { handlers, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const adminEmail = process.env.ADMIN_EMAIL
        const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH
        
        if (!adminEmail || !adminPasswordHash) {
          console.error("Missing ADMIN_EMAIL or ADMIN_PASSWORD_HASH env vars")
          return null
        }
        
        if (credentials?.email !== adminEmail) {
          return null
        }
        
        const isValid = await bcrypt.compare(credentials.password as string, adminPasswordHash)
        
        if (!isValid) {
          return null
        }
        
        return {
          id: "1",
          email: adminEmail,
          name: "Admin",
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true,
      },
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
})
