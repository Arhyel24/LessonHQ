import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import {
  createUser,
  findUserByEmail,
  verifyPassword,
  validateEmail,
  validatePassword,
} from "@/lib/auth";
import { sendWelcomeEmail } from "@/lib/sendEmail";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        action: { label: "Action", type: "text" }, // 'signin' or 'signup'
        name: { label: "Name", type: "text" },
        referralCode: { label: "Referral Code", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        if (!validateEmail(credentials.email)) {
          throw new Error("Invalid email format");
        }

        try {
          if (credentials.action === "signup") {
            // Sign up logic
            if (!credentials.name) {
              throw new Error("Name is required for signup");
            }

            const passwordValidation = validatePassword(credentials.password);
            if (!passwordValidation.isValid) {
              throw new Error(passwordValidation.message);
            }

            const existingUser = await findUserByEmail(credentials.email);
            if (existingUser) {
              throw new Error("User already exists with this email");
            }

            const newUser = await createUser({
              name: credentials.name,
              email: credentials.email,
              password: credentials.password,
              referredBy: credentials.referralCode || undefined,
            });

            // Send welcome email
            try {
              await sendWelcomeEmail(newUser.email, newUser.name);
            } catch (emailError) {
              console.error("Failed to send welcome email:", emailError);
            }

            return {
              id: newUser._id.toString(),
              email: newUser.email,
              name: newUser.name,
              role: newUser.role,
              referralCode: newUser.referralCode,
            };
          } else {
            // Sign in logic
            const user = await findUserByEmail(credentials.email);
            if (!user || !user.password) {
              throw new Error("Invalid credentials");
            }

            const isValidPassword = await verifyPassword(
              credentials.password,
              user.password
            );
            if (!isValidPassword) {
              throw new Error("Invalid credentials");
            }

            return {
              id: user._id.toString(),
              email: user.email,
              name: user.name,
              role: user.role,
              referralCode: user.referralCode,
            };
          }
        } catch (error) {
          console.error("Auth error:", error);
          throw error;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          const existingUser = await findUserByEmail(user.email!);

          if (!existingUser) {
            // Create new user from Google OAuth
            const newUser = await createUser({
              name: user.name!,
              email: user.email!,
              avatar: user.image || undefined,
              oauthProvider: "google",
              oauthId: account.providerAccountId,
            });

            user.id = newUser._id.toString();
            user.role = newUser.role;
            user.referralCode = newUser.referralCode;

            // Send welcome email
            try {
              await sendWelcomeEmail(newUser.email, newUser.name);
            } catch (emailError) {
              console.error("Failed to send welcome email:", emailError);
            }
          } else {
            user.id = existingUser._id.toString();
            user.role = existingUser.role;
            user.referralCode = existingUser.referralCode;
          }
        } catch (error) {
          console.error("Google sign in error:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role || "student";
        token.referralCode = user.referralCode;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.referralCode = token.referralCode as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
