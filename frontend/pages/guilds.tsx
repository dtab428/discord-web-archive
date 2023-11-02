import { useEffect, useState } from "react";
import { Card, Avatar, Spacer } from "@nextui-org/react";
import { useSession } from "next-auth/react";
import Container from "../components/container";
import Link from "next/link";

export default function GuildsPage() {
     const { data: session, status } = useSession();
     const [guilds, setGuilds] = useState([]);
     const [error, setError] = useState(null);

     useEffect(() => {
          if (status === "authenticated") {
               fetch("/api/guilds")
                    .then((response) => {
                         if (!response.ok) {
                              return Promise.reject("Failed to fetch guilds");
                         }
                         return response.json();
                    })
                    .then((data) => {
                         setGuilds(data);
                    })
                    .catch((error) => setError(error));
          }
     }, [status]);

     if (error) {
          return <Container>Error: {error}</Container>;
     }
     return (
          <Container>
               <h3 className="mb-3">My Servers</h3>
               <div className="flex gap-3">
                    {guilds.map((guild, index) => (
                         <Link href={`/server/${guild.id}/forums`} key={index}>
                              <Card as="a" className="p-5">
                                   {guild.icon ? (
                                        <Avatar
                                             src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`}
                                             size="large"
                                             shape="round"
                                        />
                                   ) : (
                                        <Avatar
                                             text={guild.name.charAt(0)}
                                             size="large"
                                             shape="round"
                                        />
                                   )}
                                   <Spacer y={0.5} />
                                   <p>{guild.name}</p>
                              </Card>
                         </Link>
                    ))}
               </div>
          </Container>
     );
}
