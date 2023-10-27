// pages/api/guilds.ts
import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";

interface Guild {
     owner: boolean;
     name: string;
     // ... other properties of a guild
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
     const session = await getSession({ req });

     if (!session) {
          res.status(401).send({
               error: "You must be signed in to view the protected content on this page.",
          });
          return;
     }

     const guildsResponse = await fetch(
          "https://discord.com/api/v10/users/@me/guilds",
          {
               headers: {
                    Authorization: `Bearer ${(session as any).accessToken}`,
               },
          }
     );

     if (!guildsResponse.ok) {
          console.error(await guildsResponse.text());
          res.status(guildsResponse.status).send({
               error: "Failed to fetch guilds",
          });
          return;
     }

     const guilds: Guild[] = await guildsResponse.json();
     const ownedGuilds = guilds.filter((guild) => guild.owner);

     res.send(ownedGuilds);
};

export default handler;
