// pages/api/guilds.ts
import { Session } from "next-auth";
import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";

interface Guild {
     owner: boolean;
     name: string;
}

interface CustomSession extends Session {
     accessToken: string;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
     const session: CustomSession | null = (await getSession({
          req,
     })) as CustomSession | null;

     console.log(session);

     if (!session) {
          res.status(401).send({
               error: "You must be signed in to view the protected content on this page.",
          });
          return;
     }

     console.log("Access Token:", session.accessToken); // Debugging line

     const guildsResponse = await fetch(
          "https://discord.com/api/users/@me/guilds",
          {
               headers: {
                    Authorization: `Bearer ${session.accessToken}`,
               },
          }
     );

     if (!guildsResponse.ok) {
          const errorText = await guildsResponse.text();
          console.error(errorText);
          res.status(guildsResponse.status).send({
               error: errorText || "Failed to fetch guilds",
          });
          return;
     }

     const guilds: Guild[] = await guildsResponse.json();
     // console.log("Received guilds:", guilds);
     const ownedGuilds = guilds.filter((guild) => guild.owner);

     res.send(ownedGuilds);
};

export default handler;
