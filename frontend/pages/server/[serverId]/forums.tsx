import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Card, Spacer, Text, Badge, Spinner } from "@nextui-org/react";
import Container from "../../../components/container";

export default function ServerForums() {
     const router = useRouter();
     const { serverId } = router.query;

     const [data, setData] = useState({ channels: [], threads: [] });
     const [loading, setLoading] = useState(true);

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
                                             <h4 css={{ m: 0 }}>
                                                  {thread.name}
                                             </h4>
                                             <p css={{ color: "$accents7" }}>
                                                  {
                                                       thread.thread_metadata
                                                            .create_timestamp
                                                  }
                                             </p>
                                             {/* You can add more thread details here */}
                                        </Card>
                                   ))
                              ) : (
                                   <Text>No active threads in this forum.</Text>
                              )}
                              <Spacer y={2} />
                         </div>
                    ))
               ) : (
                    <Text>No forums available for this server.</Text>
               )}
          </Container>
     );
}
