// pages/api/servers/[serverId].js
export default async function handler(req, res) {
     const { serverId } = req.query;

     const serverResponse = await fetch(
          `https://discord.com/api/v10/guilds/${serverId}`,
          {
               headers: {
                    Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
               },
          }
     );

     if (!serverResponse.ok) {
          res.status(serverResponse.status).send({
               error: "Failed to fetch server details",
          });
          return;
     }

     const server = await serverResponse.json();
     res.status(200).json({
          name: server.name,
          icon: server.icon,
     });
}
