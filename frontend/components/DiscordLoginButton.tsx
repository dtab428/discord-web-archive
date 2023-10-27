import { signIn } from "next-auth/react";
import { Button } from "@nextui-org/react";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import { Avatar, AvatarGroup, AvatarIcon } from "@nextui-org/react";

export default function DiscordLoginButton() {
     const { data: session, status } = useSession();
     const loading = status === "loading";

     return (
          <>
               {loading && <p>Loading...</p>}
               {!loading && !session && (
                    <Button color="primary" onClick={() => signIn("discord")}>
                         Sign in with Discord
                    </Button>
               )}
               {session && (
                    <div className="flex items-center justify-end">
                         <Avatar
                              className="me-3"
                              isBordered
                              src={session.user.image}
                              alt={`${session.user.name}'s avatar`}
                         />
                         <p>{session.user.name}</p>
                         <Button
                              className="ms-3"
                              color="secondary"
                              onClick={() => signOut()}
                         >
                              Sign out
                         </Button>
                    </div>
               )}
          </>
     );
}
