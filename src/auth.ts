import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        username: { label: "Pseudo", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.username) return null;

        const user = await prisma.user.findUnique({
          where: { username: credentials.username as string },
        });
        if (!user) return null;

        return { id: user.id, name: user.username, role: user.role };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { id: string; name: string; role: string }).role;
        token.username = (user as { id: string; name: string; role: string }).name;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.name = token.username as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
});
