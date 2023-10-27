import NextAuth from "next-auth";
import DiscordProvider from "next-auth/providers/discord";

export default NextAuth({
     providers: [
          DiscordProvider({
               clientId: process.env.DISCORD_CLIENT_ID,
               clientSecret: process.env.DISCORD_CLIENT_SECRET,
               scope: "identify guilds", // include the guilds scope
          }),
     ],
     callbacks: {
          session: async (session, user) => {
               session.accessToken = user.accessToken;
               return session;
          },
          jwt: async (token, user, account, profile, isNewUser) => {
               if (account?.accessToken) {
                    token.accessToken = account.accessToken;
               }
               return token;
          },
     },
     // ...rest of your NextAuth configuration
});
