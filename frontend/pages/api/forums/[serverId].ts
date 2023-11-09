import { getSession } from "next-auth/react";
import { NextApiRequest, NextApiResponse } from "next";
import { Session } from "next-auth";

interface Message {
     id: string;
     content: string;
     author: {
          username: string;
          avatar: string;
          id: string;
     };
     // ... other fields ...
}

interface CustomSession extends Session {
     accessToken?: string;
}

async function fetchThreads(
     guildId: string,
     channelId: string,
     botToken: string
) {
     // Active threads in the guild
     const activeThreadsResponse = await fetch(
          `https://discord.com/api/v10/guilds/${guildId}/threads/active`,
          {
               headers: {
                    Authorization: `Bot ${botToken}`,
               },
          }
     );

     const activeThreads = activeThreadsResponse.ok
          ? await activeThreadsResponse.json()
          : { threads: [] };

     // Archived private threads in the channel that the user is a member of
     const archivedPrivateUserThreadsResponse = await fetch(
          `https://discord.com/api/v10/channels/${channelId}/users/@me/threads/archived/private`,
          {
               headers: {
                    Authorization: `Bot ${botToken}`,
               },
          }
     );

     const archivedPrivateUserThreads = archivedPrivateUserThreadsResponse.ok
          ? await archivedPrivateUserThreadsResponse.json()
          : { threads: [] };

     // Archived public threads in the channel
     const archivedPublicThreadsResponse = await fetch(
          `https://discord.com/api/v10/channels/${channelId}/threads/archived/public`,
          {
               headers: {
                    Authorization: `Bot ${botToken}`,
               },
          }
     );

     const archivedPublicThreads = archivedPublicThreadsResponse.ok
          ? await archivedPublicThreadsResponse.json()
          : { threads: [] };

     // Archived private threads in the channel
     const archivedPrivateThreadsResponse = await fetch(
          `https://discord.com/api/v10/channels/${channelId}/threads/archived/private`,
          {
               headers: {
                    Authorization: `Bot ${botToken}`,
               },
          }
     );

     const archivedPrivateThreads = archivedPrivateThreadsResponse.ok
          ? await archivedPrivateThreadsResponse.json()
          : { threads: [] };

     // Combine all threads into one array
     const allThreads = [
          ...activeThreads.threads,
          ...archivedPrivateUserThreads.threads,
          ...archivedPublicThreads.threads,
          ...archivedPrivateThreads.threads,
     ];

     return allThreads;
}

export default async function handler(
     req: NextApiRequest,
     res: NextApiResponse
) {
     const { serverId } = req.query;

     const session: CustomSession | null = await getSession({ req });

     if (!session || !session.accessToken) {
          res.status(401).send({
               error: "Authentication session not found or missing token.",
          });
          return;
     }

     const channelsResponse = await fetch(
          `https://discord.com/api/v10/guilds/${serverId}/channels`,
          {
               headers: {
                    Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
               },
          }
     );

     if (!channelsResponse.ok) {
          res.status(channelsResponse.status).send({
               error: "Failed to fetch channels",
          });
          return;
     }

     const channels = await channelsResponse.json();
     const communityTextChannels = channels.filter(
          (channel) => channel.type === 15 // Replace with the correct type for Community Text Channels
     );

     // Fetch threads for all community text channels
     const threadsByChannelPromises = communityTextChannels.map((channel) =>
          fetchThreads(
               serverId as string,
               channel.id,
               process.env.DISCORD_BOT_TOKEN!
          )
     );

     const threadsByChannel = await Promise.all(threadsByChannelPromises);

     // Log the total number of threads fetched for each channel
     threadsByChannel.forEach((threads, index) => {
          console.log(
               `Channel ID: ${communityTextChannels[index].id} fetched a total of ${threads.length} threads.`
          );
     });

     res.status(200).json({
          channels: communityTextChannels,
          threads: threadsByChannel,
     });
}
