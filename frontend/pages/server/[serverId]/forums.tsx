import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
     Card,
     CardHeader,
     CardBody,
     Spacer,
     Spinner,
     Avatar,
} from "@nextui-org/react";
import Container from "../../../components/container";
import { format, parseISO } from "date-fns";

export default function ServerForums() {
     const router = useRouter();
     const { serverId } = router.query;

     const [data, setData] = useState({
          channels: [],
          threads: [],
          serverAvatar: "",
     });
     const [loading, setLoading] = useState(true);

     // Function to format the date in 12-hour format with AM/PM
     const formatDate = (dateString) => {
          return format(parseISO(dateString), "MMMM dd, yyyy 'at' h:mm a");
     };

     useEffect(() => {
          if (serverId) {
               setLoading(true);
               // Fetching forums data
               fetch(`/api/forums/${serverId}`)
                    .then((res) =>
                         res.ok ? res.json() : Promise.reject(res.statusText)
                    )
                    .then((forumData) => {
                         setData((prevData) => ({
                              ...prevData,
                              channels: forumData.channels,
                              threads: forumData.threads,
                         }));
                    })
                    .catch((error) =>
                         console.error("Error fetching forums:", error)
                    );

               // Fetching guilds data to get the server avatar
               fetch(`/api/guilds`)
                    .then((res) =>
                         res.ok ? res.json() : Promise.reject(res.statusText)
                    )
                    .then((guilds) => {
                         // Assuming each guild object in the array has an id and icon property
                         const guild = guilds.find((g) => g.id === serverId);
                         if (guild) {
                              setData((prevData) => ({
                                   ...prevData,
                                   serverAvatar: `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`,
                              }));
                         }
                    })
                    .catch((error) =>
                         console.error("Error fetching guilds:", error)
                    )
                    .finally(() => setLoading(false));
          }
     }, [serverId]);

     if (loading) {
          return (
               <Container>
                    <Spinner />
               </Container>
          );
     }

     console.log(data);

     // Function to get the avatar URL
     const getAvatarUrl = (userId, avatarHash, discriminator) => {
          if (avatarHash) {
               return `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.png`;
          } else {
               // Return default avatar if user has no avatar hash
               return `https://cdn.discordapp.com/embed/avatars/${
                    discriminator % 5
               }.png`;
          }
     };

     return (
          <Container>
               {data.serverAvatar && (
                    <Avatar
                         src={data.serverAvatar}
                         size="xl"
                         css={{ margin: "0 auto" }}
                    />
               )}
               {data.channels.length > 0 ? (
                    data.channels.map((channel, index) => (
                         <div key={channel.id}>
                              <h3>{channel.name}</h3>
                              {data.threads[index].length > 0 ? (
                                   data.threads[index].map((thread) => (
                                        <div
                                             key={thread.id}
                                             style={{ marginBottom: "2rem" }}
                                        >
                                             <Card>
                                                  <CardHeader>
                                                       {/* <Avatar
                                                            src={
                                                                 thread.owner_avatar ||
                                                                 "/fallback-avatar.png"
                                                            }
                                                            color="primary"
                                                           
                                                       /> */}
                                                       <div>
                                                            <h4>
                                                                 {thread.name}
                                                            </h4>
                                                            <p>
                                                                 {formatDate(
                                                                      thread
                                                                           .thread_metadata
                                                                           .create_timestamp
                                                                 )}
                                                            </p>
                                                       </div>
                                                  </CardHeader>
                                                  {thread.messages
                                                       .slice()
                                                       .reverse()
                                                       .map((message) => (
                                                            <CardBody
                                                                 key={
                                                                      message.id
                                                                 }
                                                            >
                                                                 <div
                                                                      style={{
                                                                           display: "flex",
                                                                           alignItems:
                                                                                "center",
                                                                           marginBottom:
                                                                                "1rem",
                                                                      }}
                                                                 >
                                                                      <Avatar
                                                                           src={getAvatarUrl(
                                                                                message
                                                                                     .author
                                                                                     .id,
                                                                                message
                                                                                     .author
                                                                                     .avatar,
                                                                                message
                                                                                     .author
                                                                                     .discriminator
                                                                           )}
                                                                           color="primary"
                                                                           size="sm"
                                                                           css={{
                                                                                marginRight:
                                                                                     "1rem",
                                                                           }}
                                                                      />
                                                                      <div>
                                                                           <p>
                                                                                <strong>
                                                                                     {
                                                                                          message
                                                                                               .author
                                                                                               .username
                                                                                     }
                                                                                </strong>

                                                                                :{" "}
                                                                                {
                                                                                     message.content
                                                                                }
                                                                           </p>
                                                                           <p
                                                                                style={{
                                                                                     fontSize:
                                                                                          "0.75rem",
                                                                                     color: "#888",
                                                                                }}
                                                                           >
                                                                                {formatDate(
                                                                                     message.timestamp
                                                                                )}
                                                                           </p>
                                                                      </div>
                                                                 </div>
                                                            </CardBody>
                                                       ))}
                                             </Card>
                                             <Spacer y={1} />
                                        </div>
                                   ))
                              ) : (
                                   <p>No active threads in this forum.</p>
                              )}
                         </div>
                    ))
               ) : (
                    <p>No forums available for this server.</p>
               )}
          </Container>
     );
}
