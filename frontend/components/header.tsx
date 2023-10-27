import Link from "next/link";
import DiscordLoginButton from "./DiscordLoginButton";
import Container from "./container";

export default function Header() {
     return (
          <>
               <Container>
                    <div className="flex items-center justify-between py-5">
                         <div>
                              <h2 className="text-2xl md:text-4xl font-bold tracking-tight md:tracking-tighter leading-tight">
                                   <Link href="/" className="hover:underline">
                                        Blog
                                   </Link>
                                   .
                              </h2>
                         </div>
                         <div className="flex items-center justify-between">
                              <Link
                                   href="/about"
                                   className="hover:underline me-5"
                              >
                                   About
                              </Link>
                              <Link
                                   href="/guilds"
                                   className="hover:underline me-5"
                              >
                                   My Servers
                              </Link>
                              <DiscordLoginButton />
                         </div>
                    </div>
               </Container>
          </>
     );
}
