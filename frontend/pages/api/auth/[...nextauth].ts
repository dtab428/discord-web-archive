// pages/api/[...nextauth].ts
import NextAuth from "next-auth";
import DiscordProvider from "next-auth/providers/discord";

export default NextAuth({
     providers: [
          DiscordProvider({
               clientId: process.env.DISCORD_CLIENT_ID,
               clientSecret: process.env.DISCORD_CLIENT_SECRET,
               token: "https://discord.com/api/oauth2/token",
               userinfo: "https://discord.com/api/users/@me",
               authorization: {
                    params: {
                         scope: "identify email guilds applications.commands.permissions.update",
                    },
               },
          }),
     ],
     session: { strategy: "jwt" },
     callbacks: {
          async jwt({ token, account }) {
               if (account) {
                    token.accessToken = account.access_token;
               }
               return token;
          },
          async session({ session, token, user }) {
               // Add the accessToken to the session
               return {
                    ...session,
                    user: {
                         ...session.user,
                         id: user?.id,
                         name: user?.name,
                    },
                    accessToken: token.accessToken,
               };
          },
     },
});
