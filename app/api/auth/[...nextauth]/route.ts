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
  callbacks: {
    async session({ session, user }: { session: any; user: any }) {
      if (session?.user) {
        session.user.id = user.id;
      }
      return session;
    },
    async signIn({ user, account }: { user: any; account: any }) {
      if (account?.provider === "google") {
        // Check if this is a new user by looking for existing profile
        const existingProfile = await prisma.profile.findUnique({
          where: { userId: user.id },
        });

        // Create or update profile
        await prisma.profile.upsert({
          where: { userId: user.id },
          update: {
            fullName: user.name || "",
            email: user.email || "",
            avatarUrl: user.image || "",
            membershipTier: "free",
          },
          create: {
            userId: user.id,
            fullName: user.name || "",
            email: user.email || "",
            avatarUrl: user.image || "",
            membershipTier: "free",
          },
        });

        // Create default settings
        await prisma.settings.upsert({
          where: { userId: user.id },
          update: {},
          create: {
            userId: user.id,
            aiMemoryEnabled: true,
            moodAnalysisEnabled: true,
            summaryGenerationEnabled: true,
          },
        });

        // Initialize Pinecone namespace for new users
        if (!existingProfile) {
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
      }
      return true;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
