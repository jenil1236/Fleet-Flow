import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { compare } from 'bcryptjs';
import Credentials from 'next-auth/providers/credentials';
import { db } from '@/lib/db';

// NextAuth v5 configuration
export const { handlers, signIn, signOut, auth } = NextAuth({
  // Use Prisma adapter for session management
  adapter: PrismaAdapter(db),

  // Use JWT session strategy
  session: {
    strategy: 'jwt',
  },

  // Authentication providers
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // Validate credentials exist
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Find user by email
        const user = await db.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        // Return null if user not found
        if (!user) {
          return null;
        }

        // Compare password with bcrypt
        const isPasswordValid = await compare(
          credentials.password,
          user.password
        );

        // Return null if password is invalid
        if (!isPasswordValid) {
          return null;
        }

        // Return user object (without password) including mustResetPassword flag
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          organizationId: user.organizationId,
          mustResetPassword: user.mustResetPassword,
        };
      },
    }),
  ],

  // Custom pages
  pages: {
    signIn: '/login',
  },

  // Callbacks for JWT and session
  callbacks: {
    // JWT callback: Attach user data to token
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.organizationId = user.organizationId;
        token.mustResetPassword = user.mustResetPassword;
      }
      return token;
    },

    // Session callback: Expose user data in session
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.organizationId = token.organizationId;
        session.user.mustResetPassword = token.mustResetPassword;
      }
      return session;
    },
  },
});
