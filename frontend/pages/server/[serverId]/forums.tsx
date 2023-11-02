import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Card, Spacer, Badge, Spinner } from "@nextui-org/react";
import Container from "../../../components/container";

export default function ServerForums() {
     const router = useRouter();
     const { serverId } = router.query;

     const [forums, setForums] = useState([]);
     const [loading, setLoading] = useState(true);

     useEffect(() => {
          if (serverId) {
               setLoading(true);
               fetch(`/api/forums/${serverId}`)
                    .then((res) =>
                         res.ok ? res.json() : Promise.reject(res.statusText)
                    )
                    .then(async (data) => {
                         console.log(data);
                         const lastMessagePromises = data.channels.map(
                              (channel) =>
                                   channel.last_message_id
                                        ? fetch(
                                               `/api/messages/${channel.last_message_id}`
                                          ).then((res) => res.json())
                                        : Promise.resolve(null)
                         );

                         const lastMessages = await Promise.all(
                              lastMessagePromises
                         );
                         console.log("Last Messages:", lastMessages);

                         const userPromises = lastMessages.map((message) =>
                              message && message.author
                                   ? fetch(
                                          `/api/users/${message.author.id}`
                                     ).then((res) => res.json())
                                   : Promise.resolve(null)
                         );

                         const users = await Promise.all(userPromises);
                         console.log("Users:", users);

                         const transformedForums = data.channels.map(
                              (channel, index) => {
                                   const message = lastMessages[index]
                                        ? lastMessages[index][0]
                                        : null; // Get the first message from the array
                                   return {
                                        title: channel.name,
                                        description: message
                                             ? message.content
                                             : "No content available",
                                        id: channel.id,
                                        threads: channel.last_message_id
                                             ? [
                                                    {
                                                         title: "Last Message",
                                                         id: channel.last_message_id,
                                                         lastReplyDate: message
                                                              ? new Date(
                                                                     Date.parse(
                                                                          message.timestamp
                                                                     )
                                                                )
                                                              : new Date(),
                                                         replyCount: 1,
                                                         username:
                                                              message &&
                                                              message.author
                                                                   ? message
                                                                          .author
                                                                          .username
                                                                   : "Unknown",
                                                         avatar:
                                                              message &&
                                                              message.author &&
                                                              message.author
                                                                   .avatar
                                                                   ? `https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.png`
                                                                   : "Default Avatar URL",
                                                         content: message
                                                              ? message.content
                                                              : "No content",
                                                    },
                                               ]
                                             : [],
                                   };
                              }
                         );

                         setForums(transformedForums);
                         console.log("Transformed forums:", transformedForums);
                    })
                    .catch(console.error)
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

     return (
          <Container>
               {forums &&
                    forums.length > 0 &&
                    forums.map((forum) => (
                         <div key={forum.id}>
                              <h4>{forum.title}</h4>
                              <small>{forum.description}</small>
                              <Spacer y={1} />
                              {forum.threads &&
                                   forum.threads.length > 0 &&
                                   forum.threads.map((thread) => (
                                        <Card key={thread.id}>
                                             <div className="flex items-center">
                                                  <img
                                                       src={thread.avatar}
                                                       alt={`${thread.username}'s avatar`}
                                                       width="40"
                                                       height="40"
                                                       className="mr-2 rounded-full"
                                                  />
                                                  <h5>
                                                       {thread.title} by{" "}
                                                       {thread.username}
                                                  </h5>
                                             </div>
                                             <div className="flex justify-between">
                                                  <small>
                                                       Last reply:{" "}
                                                       {new Date(
                                                            thread.lastReplyDate
                                                       ).toLocaleDateString()}
                                                  </small>
                                                  <Badge>
                                                       {thread.replyCount}{" "}
                                                       replies
                                                  </Badge>
                                             </div>
                                        </Card>
                                   ))}
                              <Spacer y={2} />
                         </div>
                    ))}
               {forums && forums.length === 0 && (
                    <p>No forums available for this server.</p>
               )}
          </Container>
     );
}
