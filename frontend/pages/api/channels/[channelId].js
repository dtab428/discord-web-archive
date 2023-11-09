// pages/api/channels/[channelId].js

export default async function handler(req, res) {
     const {
          query: { channelId },
     } = req;

     try {
          const url = `https://discord.com/api/v10/channels/${channelId}/messages`;
          const response = await fetch(url, {
               headers: {
                    Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
                    "Content-Type": "application/json",
               },
          });

          if (!response.ok) {
               // Log the full error response if not ok
               const errorResponse = await response.text();
               console.error("Error response body:", errorResponse);
               throw new Error("Failed to fetch the messages.");
          }

          const data = await response.json();

          if (data.length === 0) {
               console.log("No messages found for channel:", channelId);
          }

          return res.status(200).json(data);
     } catch (error) {
          console.error("Error fetching messages:", error);
          return res.status(500).json({ error: error.message });
     }
}
