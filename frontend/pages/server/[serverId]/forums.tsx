import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Card, Spacer, Badge, Spinner, Avatar } from "@nextui-org/react";
import Container from "../../../components/container";
import { format, parseISO } from "date-fns";

export default function ServerForums() {
     const router = useRouter();
     const { serverId } = router.query;

     const [data, setData] = useState({ channels: [], threads: [] });
     const [loading, setLoading] = useState(true);

     // Function to format the date
     const formatDate = (dateString) => {
          // Parse the date string into a Date object and format it
          return format(parseISO(dateString), "MMMM dd, yyyy @ HH:mm a");
     };

     useEffect(() => {
          if (serverId) {
               setLoading(true);
               fetch(`/api/forums/${serverId}`)
                    .then((res) =>
                         res.ok ? res.json() : Promise.reject(res.statusText)
                    )
                    .then((data) => {
                         console.log("Forum data:", data);
                         setData(data);
                    })
                    .catch((error) =>
                         console.error("Error fetching forums:", error)
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

     return (
          <Container>
               {data.channels.length > 0 ? (
                    data.channels.map((channel, index) => (
                         <div key={channel.id}>
                              <h3>{channel.name}</h3>
                              {data.threads[index].length > 0 ? (
                                   data.threads[index].map((thread) => (
                                        <Card
                                             key={thread.id}
                                             bordered
                                             shadow={false}
                                             hoverable
                                             css={{ mw: "400px" }}
                                        >
                                             <div
                                                  style={{
                                                       display: "flex",
                                                       alignItems: "center",
                                                  }}
                                             >
                                                  {/* Assuming you have the avatar URL in thread.owner_avatar */}
                                                  <Avatar
                                                       src={thread.owner_avatar}
                                                  />
                                                  <div
                                                       style={{
                                                            marginLeft: "8px",
                                                       }}
                                                  >
                                                       <h4 css={{ m: 0 }}>
                                                            {thread.name}
                                                       </h4>
                                                       <p
                                                            css={{
                                                                 color: "$accents7",
                                                            }}
                                                       >
                                                            {formatDate(
                                                                 thread
                                                                      .thread_metadata
                                                                      .create_timestamp
                                                            )}
                                                       </p>
                                                  </div>
                                             </div>
                                             {/* Render the last message preview */}
                                             <p css={{ color: "$accents8" }}>
                                                  Last message:{" "}
                                                  {thread.messages[0]
                                                       ?.content ||
                                                       "No messages"}
                                             </p>
                                             {/* You can expand here to show more messages */}
                                        </Card>
                                   ))
                              ) : (
                                   <p>No active threads in this forum.</p>
                              )}
                              <Spacer y={2} />
                         </div>
                    ))
               ) : (
                    <p>No forums available for this server.</p>
               )}
          </Container>
     );
}
