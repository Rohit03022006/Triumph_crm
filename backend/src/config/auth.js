import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./database.js";
import { env } from "./env.js";
import { sendEmail } from "../shared/email.js";

export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  trustedOrigins: [env.CLIENT_URL],
  database: prismaAdapter(prisma, { provider: "postgresql" }),

  emailAndPassword: {
    enabled: true,
    disableSignUp: false, // flips to true after Step 3
    async sendResetPassword(url, user) {
      await sendEmail({
        to: user.email,
        subject: "Reset your Triumph CRM password",
        html: `<p>Click <a href="${url}">here</a> to reset your password.</p>`
      });
    }
  },

  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        input: false,
        defaultValue: "EXECUTIVE",
      },
      department: { type: "string", required: false, input: false },
      officeNumber: { type: "string", required: false },
      isActive: {
        type: "boolean",
        required: false,
        input: false,
        defaultValue: true,
      },
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: { enabled: true, maxAge: 60 * 5 },
  },
});
