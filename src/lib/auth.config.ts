import type { NextAuthConfig } from "next-auth";
import type { Role } from "@prisma/client";

export const authConfig = {
  pages: {
    signIn: "/acceso",
  },
  session: { strategy: "jwt" },
  trustHost: true,
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = request.nextUrl;
      const isAppRoute = pathname.startsWith("/app");
      const isPortalRoute = pathname.startsWith("/portal");

      if (!isLoggedIn) return false;
      if (isAppRoute) return auth?.user?.role === "THERAPIST";
      if (isPortalRoute) return auth?.user?.role === "PATIENT";
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as Role;
        session.user.id = token.sub as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
