export default async function handler(req, res) {
     const {
          query: { channelId },
     } = req;

     try {
          const response = await fetch(
               `https://discord.com/api/v10/channels/${channelId}/messages`,
               {
                    headers: {
                         Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
                         "Content-Type": "application/json",
                    },
               }
          );

          if (!response.ok) {
               throw new Error("Failed to fetch the messages.");
          }

          const data = await response.json();
          return res.status(200).json(data);
     } catch (error) {
          return res.status(500).json({ error: error.message });
     }
}
