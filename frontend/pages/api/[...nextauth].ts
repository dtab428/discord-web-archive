// [...nextauth].ts
import NextAuth from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { Session } from "next-auth"; // Import Session here

interface CustomSession extends Session {
     accessToken?: string;
}

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
               console.log("i get here");
               console.log("account", account);
               console.log("token", token);
               // if (account) {
               //   console.log(token.accessToken);
               //   token.accessToken = account.access_token;
               // }
               return token;
          },
          async session({ session, token, user }) {
               console.log(token);
               return {
                    ...session,
                    user: {
                         ...session.user,
                         id: user.id,
                         name: user.name,
                    },
               };
          },
     },
});
