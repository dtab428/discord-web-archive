import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
     Card,
     CardHeader,
     CardBody,
     Spacer,
     Spinner,
     Avatar,
     Pagination,
     Button,
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

     const [activeChannel, setActiveChannel] = useState(null);
     const [activeThreads, setActiveThreads] = useState([]);
     const [currentPage, setCurrentPage] = useState(1);
     const [postsPerPage, setPostsPerPage] = useState(2); // default posts per page

     // Function to format the date in 12-hour format with AM/PM
     const formatDate = (dateString) => {
          return format(parseISO(dateString), "MMMM dd, yyyy 'at' h:mm a");
     };

     useEffect(() => {
          if (serverId) {
               setLoading(true);
               Promise.all([
                    fetch(`/api/forums/${serverId}`).then((res) =>
                         res.ok ? res.json() : Promise.reject(res.statusText)
                    ),
                    fetch(`/api/guilds`).then((res) =>
                         res.ok ? res.json() : Promise.reject(res.statusText)
                    ),
               ])
                    .then(([forumData, guilds]) => {
                         const guild = guilds.find((g) => g.id === serverId);
                         const serverAvatar = guild
                              ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`
                              : "";
                         setData({
                              channels: forumData.channels,
                              threads: forumData.threads,
                              serverAvatar: serverAvatar,
                         });
                    })
                    .catch((error) =>
                         console.error("Error fetching data:", error)
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

     console.log(data);
     const handleChannelClick = (channelId) => {
          // Find the channel in the 'channels' array
          const channel = data.channels.find(
               (channel) => channel.id === channelId
          );
          if (channel) {
               // Set the active channel
               setActiveChannel(channel);

               // Assuming data.threads is an array of arrays where each inner array
               // corresponds to threads of a particular channel
               // Find the index of the channel in the 'channels' array
               const channelIndex = data.channels.findIndex(
                    (ch) => ch.id === channelId
               );

               if (channelIndex !== -1 && data.threads[channelIndex]) {
                    // Filter threads where 'parent_id' matches the 'channelId'
                    const filteredThreads = data.threads[channelIndex].filter(
                         (thread) => thread.parent_id === channelId
                    );
                    setActiveThreads(filteredThreads);
               } else {
                    console.error("Threads not found for the channel");
                    setActiveThreads([]);
               }
          } else {
               console.error("Channel not found");
               setActiveThreads([]);
          }
     };

     const handlePageChange = (newPage) => {
          setCurrentPage(newPage);
          // Fetch threads for the new page
     };

     const totalNumberOfPages = Math.ceil(activeThreads.length / postsPerPage);

     return (
          <Container>
               <div style={{ display: "flex", gap: "20px" }}>
                    {/* Channels list on the left */}
                    <div style={{ flex: 1, minWidth: "300px" }}>
                         <div style={{ position: "sticky", top: "20px" }}>
                              {data.channels.map((channel) => (
                                   <Card key={channel.id}>
                                        <CardHeader>
                                             <p>{channel.name}</p>
                                        </CardHeader>
                                        <Button
                                             flat
                                             auto
                                             onClick={() =>
                                                  handleChannelClick(channel.id)
                                             }
                                        >
                                             View Threads
                                        </Button>
                                   </Card>
                              ))}
                         </div>
                    </div>

                    {/* Threads on the right */}
                    <div style={{ flex: 2 }}>
                         {activeChannel && (
                              <>
                                   <h3>Threads in {activeChannel.name}</h3>
                                   {activeThreads
                                        .slice(
                                             (currentPage - 1) * postsPerPage,
                                             currentPage * postsPerPage
                                        )
                                        .map((thread) => (
                                             <Card key={thread.id}>
                                                  <CardHeader>
                                                       <p>{thread.name}</p>{" "}
                                                       {/* Thread title */}
                                                       <p>
                                                            {formatDate(
                                                                 thread
                                                                      .thread_metadata
                                                                      .create_timestamp
                                                            )}
                                                       </p>{" "}
                                                       {/* Thread creation time */}
                                                  </CardHeader>
                                                  <CardBody>
                                                       {thread.messages.map(
                                                            (
                                                                 message,
                                                                 index
                                                            ) => (
                                                                 <div
                                                                      key={
                                                                           index
                                                                      }
                                                                      style={{
                                                                           marginBottom:
                                                                                "1rem",
                                                                      }}
                                                                 >
                                                                      <div
                                                                           style={{
                                                                                display: "flex",
                                                                                alignItems:
                                                                                     "center",
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
                                                                 </div>
                                                            )
                                                       )}
                                                  </CardBody>
                                             </Card>
                                        ))}

                                   <Pagination
                                        total={totalNumberOfPages}
                                        page={currentPage}
                                        onChange={handlePageChange}
                                   />
                              </>
                         )}
                    </div>
               </div>
          </Container>
     );
}
