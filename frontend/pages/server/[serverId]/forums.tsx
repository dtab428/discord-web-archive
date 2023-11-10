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
import Container from "../../../components/container"; // Using your custom Container
import { format, parseISO } from "date-fns";

export default function ServerForums() {
     const router = useRouter();
     const { serverId } = router.query;

     const [data, setData] = useState({ channels: [], threads: [] });
     const [loading, setLoading] = useState(true);

     // Function to format the date
     const formatDate = (dateString) => {
          return format(parseISO(dateString), "MMMM dd, yyyy 'at' HH:mm");
     };

     useEffect(() => {
          if (serverId) {
               setLoading(true);
               fetch(`/api/forums/${serverId}`)
                    .then((res) =>
                         res.ok ? res.json() : Promise.reject(res.statusText)
                    )
                    .then((data) => {
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
                         <div key={channel.id} style={{ marginBottom: "2rem" }}>
                              <h3>{channel.name}</h3>
                              {data.threads[index].length > 0 ? (
                                   data.threads[index].map((thread) => (
                                        <Card
                                             key={thread.id}
                                             bordered
                                             css={{ marginBottom: "1.5rem" }}
                                        >
                                             <CardHeader>
                                                  <Avatar
                                                       src={
                                                            thread.owner_avatar ||
                                                            "/fallback-avatar.png"
                                                       }
                                                       color="primary"
                                                       bordered
                                                  />
                                                  <div>
                                                       <h4>{thread.name}</h4>
                                                       <p>
                                                            {formatDate(
                                                                 thread
                                                                      .thread_metadata
                                                                      .create_timestamp
                                                            )}
                                                       </p>
                                                  </div>
                                             </CardHeader>
                                             {thread.messages.map((message) => (
                                                  <CardBody key={message.id}>
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
                                                                 src={
                                                                      message
                                                                           .author
                                                                           .avatar ||
                                                                      "/fallback-avatar.png"
                                                                 }
                                                                 color="primary"
                                                                 size="sm"
                                                                 bordered
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
