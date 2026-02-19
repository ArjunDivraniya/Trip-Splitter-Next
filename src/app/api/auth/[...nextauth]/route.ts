import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

// Backend URL from environment - all routes are constructed in this file
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://smartsplit-app-cv3e.onrender.com";
const API_URL = `${BACKEND_URL}/api`;

export const authOptions: NextAuthOptions = {
  providers: [
    // Credentials Provider - Login with Email/Password via Express Backend
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        try {
          // Call Express Backend Login Endpoint
          const response = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
            credentials: "include",
          });

          const data = await response.json();

          if (!response.ok || !data.success) {
            throw new Error(data.message || "Login failed");
          }

          // Return user object with token
          return {
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            image: data.user.profileImage,
            token: data.token,
          };
        } catch (error: any) {
          console.error("Backend login error:", error);
          throw new Error(error.message || "Backend authentication failed");
        }
      },
    }),

    // Google OAuth Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),
  ],

  callbacks: {
    // JWT Callback - Store token in JWT
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        // Store backend JWT token if from credentials provider
        if ((user as any).token) {
          token.backendToken = (user as any).token;
        }
      }

      // Handle Google OAuth
      if (account?.provider === "google") {
        token.provider = "google";
      }

      return token;
    },

    // Session Callback - Return user info in session
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
      }
      // Store backend token in session for API calls
      (session as any).backendToken = token.backendToken;
      (session as any).provider = token.provider;
      return session;
    },

    // Sign-in Callback - Sync Google OAuth users with backend
    async signIn({ user, account, profile }) {
      // If Google OAuth, try to create/sync user with backend
      if (account?.provider === "google" && profile) {
        try {
          const registerResponse = await fetch(
            `${API_URL}/auth/register`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                email: profile.email,
                name: profile.name,
                // For Google OAuth, we use a placeholder password
                // Backend should handle social logins differently
                password: `google_${profile.sub || profile.id}`,
              }),
              credentials: "include",
            }
          );

          if (!registerResponse.ok) {
            console.log(
              "User might already exist or backend error:",
              await registerResponse.text()
            );
            // Continue anyway - user signup might fail if duplicate
          }
        } catch (error) {
          console.error("Error syncing Google user with backend:", error);
          // Continue with sign-in even if sync fails
        }
      }

      return true;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    updateAge: 24 * 60 * 60, // 24 hours
  },

  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
