import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { initializeUserNamespace } from "@/lib/pinecone";

const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt" as const,
  },
  callbacks: {
    async jwt({
      token,
      user,
      account,
    }: {
      token: any;
      user: any;
      account: any;
    }) {
      // Initial sign in
      if (account && user) {
        try {
          // Check if profile already exists
          const existingProfile = await prisma.profile.findUnique({
            where: { userId: user.id },
          });

          if (!existingProfile) {
            // Create profile
            await prisma.profile.create({
              data: {
                userId: user.id,
                fullName: user.name || "",
                email: user.email || "",
                avatarUrl: user.image || "",
                membershipTier: "free",
              },
            });

            // Create default settings
            await prisma.settings.create({
              data: {
                userId: user.id,
                aiMemoryEnabled: true,
                moodAnalysisEnabled: true,
                summaryGenerationEnabled: true,
              },
            });

            // Create default subscription
            await prisma.subscription.create({
              data: {
                userId: user.id,
                plan: "free",
                status: "active",
              },
            });

            // Initialize Pinecone namespace for new users
            try {
              await initializeUserNamespace(user.id);
              console.log(
                `Pinecone namespace initialized for new user: ${user.id}`
              );
            } catch (error) {
              console.error(
                `Failed to initialize Pinecone namespace for user ${user.id}:`,
                error
              );
              // Don't block signup if Pinecone initialization fails
            }
          }
        } catch (error) {
          console.error("Error during JWT callback:", error);
        }
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session?.user) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
    error: "/",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST, authOptions };
