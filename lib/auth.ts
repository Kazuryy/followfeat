import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { genericOAuth } from "better-auth/plugins";
import { prisma } from "./db";

const adminEmails = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim())
  .filter(Boolean);

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "sqlite" }),

  plugins: [
    genericOAuth({
      config: [
        {
          providerId: "authentik",
          clientId: process.env.AUTHENTIK_CLIENT_ID!,
          clientSecret: process.env.AUTHENTIK_CLIENT_SECRET!,
          discoveryUrl: `${process.env.AUTHENTIK_ISSUER}/.well-known/openid-configuration`,
          scopes: ["openid", "email", "profile"],
        },
      ],
    }),
  ],

  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "user",
        fieldName: "role",
      },
      banned: {
        type: "boolean",
        defaultValue: false,
        fieldName: "banned",
      },
    },
  },

  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          return {
            data: {
              ...user,
              role: adminEmails.includes(user.email ?? "") ? "admin" : "user",
            },
          };
        },
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
