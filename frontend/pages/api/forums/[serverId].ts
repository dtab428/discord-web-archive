// pages/api/forums/[serverId].ts
import { Session } from "next-auth";
import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";

interface Channel {
     id: string;
     type: number;
     name: string;
     // ... other fields ...
}

interface CustomSession extends Session {
     accessToken: string;
}

export default async function handler(
     req: NextApiRequest,
     res: NextApiResponse
) {
     const { serverId } = req.query;

     const session: CustomSession | null = (await getSession({
          req,
     })) as CustomSession | null;

     if (!session || !session.accessToken) {
          res.status(401).send({
               error: "Authentication session not found or missing token.",
          });
          return;
     }

     const channelsResponse = await fetch(
          `https://discord.com/api/v10/guilds/${serverId}/channels`,
          {
               method: "GET",
               headers: {
                    Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`, // Using Bot for bot auth
                    "Content-Type": "application/json",
               },
          }
     );

     if (!channelsResponse.ok) {
          const errorData = await channelsResponse.json();
          console.error("Error fetching channels:", errorData);
          res.status(channelsResponse.status).send({
               error: errorData.message || "Failed to fetch channels",
          });
          return;
     }

     const channels: Channel[] = await channelsResponse.json();
     //  console.log(channels);
     // Filtering for Community Text channels (type 16 based on API docs)
     const communityTextChannels = channels.filter(
          (channel) => channel.type === 15
     );

     // Fetch the latest messages for each community text channel
     const messagesPromises = communityTextChannels.map(async (channel) => {
          const messagesResponse = await fetch(
               `https://discord.com/api/v10/channels/${channel.id}/messages`, // Fetching messages for a specific channel
               {
                    method: "GET",
                    headers: {
                         Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
                         "Content-Type": "application/json",
                    },
               }
          );
          if (!messagesResponse.ok) {
               const errorData = await messagesResponse.json();
               console.error(
                    "Error fetching messages for channel:",
                    channel.id,
                    errorData
               );
               return null; // or handle this differently based on your needs
          }
          return await messagesResponse.json();
     });

     const allMessages = await Promise.all(messagesPromises);

     res.status(200).json({
          channels: communityTextChannels,
          messages: allMessages,
     });
}
