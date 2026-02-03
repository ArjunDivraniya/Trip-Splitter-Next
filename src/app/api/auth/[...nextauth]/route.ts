import NextAuth, {
  type Account,
  type NextAuthOptions,
  type Profile,
  type Session,
  type User as NextAuthUser,
} from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

export const authOptions: NextAuthOptions = {
  debug: process.env.NODE_ENV === "development",
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(
        credentials: Record<"email" | "password", string> | undefined
      ) {
        if (!credentials?.email || !credentials?.password) {
          console.log("No credentials provided");
          return null;
        }

        try {
          await dbConnect();
          const user = await User.findOne({ email: credentials.email }).select(
            "+password"
          );

          if (!user) {
            console.log("User not found:", credentials.email);
            return null;
          }

          const isMatch = await bcrypt.compare(credentials.password, user.password);
          if (!isMatch) {
            console.log("Password mismatch for:", credentials.email);
            return null;
          }

          console.log("Auth successful for:", credentials.email);
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            image: user.profileImage || undefined,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({
      user,
      account,
      profile,
    }: {
      user: NextAuthUser;
      account: Account | null;
      profile?: Profile;
    }) {
        // For Google OAuth
        if (account?.provider === "google") {
          const email =
            user.email || (profile && "email" in profile ? profile.email : undefined);
          if (!email) return false;

          await dbConnect();

          // Check if user already exists
          let existingUser = await User.findOne({ email });

          if (existingUser) {
            // Update profile image if Google has one
            if (!existingUser.profileImage && user.image) {
              existingUser.profileImage = user.image;
              await existingUser.save();
            }
            user.id = existingUser._id.toString();
            return true;
          }

          // Create new user if doesn't exist. Store `password: null` for OAuth users
          try {
            const name =
              user.name || (profile && "name" in profile ? profile.name : undefined);
            const picture =
              user.image || (profile && "picture" in profile ? profile.picture : undefined);

            const newUser = await User.create({
              name: name || (email ? email.split("@")[0] : "User"),
              email,
              password: null,
              authProvider: "google",
              profileImage: picture || "",
            });

            user.id = newUser._id.toString();
            return true;
          } catch (error) {
            console.error("Error creating user:", error);
            return false;
          }
        }

      // For credentials provider
      return true;
    },
    async jwt({ token, user }: { token: JWT; user?: NextAuthUser | null }) {
      if (user?.id) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user && token?.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Always send users to the dashboard after successful sign-in
      return `${baseUrl}/dashboard`;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
