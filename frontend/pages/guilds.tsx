// pages/guilds.tsx
import { useEffect, useState } from "react";
import { Card } from "@nextui-org/react";
import { useSession } from "next-auth/react";
import Container from "../components/container";

export default function GuildsPage() {
     const { data: session, status } = useSession();
     const [guilds, setGuilds] = useState([]);
     const [error, setError] = useState(null);

     useEffect(() => {
          console.log("use effect");
          if (status === "authenticated") {
               fetch("/api/guilds")
                    .then((response) => {
                         if (!response.ok) {
                              return Promise.reject("Failed to fetch guilds");
                         }
                         return response.json();
                    })
                    .then((data) => {
                         console.log("Guilds on frontend:", data);
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
               <h3>My Servers</h3>
               <div>
                    {guilds.map((guild, index) => (
                         <Card key={index}>
                              <p>{guild.name}</p>
                         </Card>
                    ))}
               </div>
          </Container>
     );
}
