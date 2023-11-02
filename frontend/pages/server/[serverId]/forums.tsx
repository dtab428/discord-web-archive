// pages/server/[serverId]/forums.tsx
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Card, Spacer, Badge } from "@nextui-org/react";
import Container from "../../../components/container";

export default function ServerForums() {
     const router = useRouter();
     const { serverId } = router.query;

     const [forums, setForums] = useState([]);

     useEffect(() => {
          if (serverId) {
               fetch(`/api/forums/${serverId}`)
                    .then((res) => res.json())
                    .then((data) => {
                         console.log(data);
                         // Transform data to match the expected structure
                         const transformedForums = data.channels.map(
                              (channel) => {
                                   return {
                                        title: channel.name,
                                        description:
                                             channel.topic || "No description", // using topic as description
                                        id: channel.id,
                                        threads: channel.last_message_id
                                             ? [
                                                    {
                                                         title: "Last Message",
                                                         id: channel.last_message_id,
                                                         lastReplyDate:
                                                              new Date(), // You might want to fetch the actual date from the API
                                                         replyCount: 1, // This is a placeholder, you might want to fetch the actual count from the API
                                                    },
                                               ]
                                             : [],
                                   };
                              }
                         );

                         setForums(transformedForums);
                    })
                    .catch(console.error);
          }
     }, [serverId]);

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
                                        <Card key={thread.id} hoverable>
                                             <h5>{thread.title}</h5>
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
