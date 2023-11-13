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
import { format, parseISO, formatDistanceToNow } from "date-fns";

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
     const [expandedThreadId, setExpandedThreadId] = useState(null); // Added for expandable threads

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

     const toggleThread = (threadId) => {
          setExpandedThreadId(expandedThreadId === threadId ? null : threadId);
     };

     return (
          <Container>
               <div style={{ display: "flex", gap: "20px" }}>
                    {/* Channels list on the left */}
                    <div style={{ flex: "1", minWidth: "300px" }}>
                         <div style={{ position: "sticky", top: "20px" }}>
                              {data.channels.map((channel) => (
                                   <Button
                                        key={channel.id}
                                        flat
                                        auto
                                        color={
                                             activeChannel?.id === channel.id
                                                  ? "primary"
                                                  : "default"
                                        }
                                        onClick={() =>
                                             handleChannelClick(channel.id)
                                        }
                                        css={{
                                             marginBottom: "10px",
                                             width: "100%",
                                             justifyContent: "flex-start",
                                             color:
                                                  activeChannel?.id ===
                                                  channel.id
                                                       ? "white"
                                                       : "inherit",
                                             backgroundColor:
                                                  activeChannel?.id ===
                                                  channel.id
                                                       ? "#0070f3"
                                                       : "transparent",
                                        }}
                                   >
                                        {channel.name}
                                   </Button>
                              ))}
                         </div>
                    </div>

                    {/* Threads on the right */}
                    <div style={{ flex: 3 }}>
                         {activeThreads
                              .slice(
                                   (currentPage - 1) * postsPerPage,
                                   currentPage * postsPerPage
                              )
                              .map((thread) => (
                                   <Card
                                        className="my-5"
                                        key={thread.id}
                                        css={{
                                             marginBottom: "$8",
                                             overflow: "hidden",
                                        }}
                                   >
                                        <CardHeader
                                             css={{
                                                  display: "flex",
                                                  flexDirection: "column",
                                                  alignItems: "flex-start",
                                                  justifyContent:
                                                       "space-between",
                                             }}
                                        >
                                             <Avatar
                                                  src={getAvatarUrl(
                                                       thread.messages[
                                                            thread.messages
                                                                 .length - 1
                                                       ].author.id,
                                                       thread.messages[
                                                            thread.messages
                                                                 .length - 1
                                                       ].author.avatar,
                                                       thread.messages[
                                                            thread.messages
                                                                 .length - 1
                                                       ].author.discriminator
                                                  )}
                                                  color="primary"
                                                  size="md"
                                                  css={{
                                                       marginBottom: "1rem",
                                                       borderRadius: "50%",
                                                  }}
                                             />
                                             <div
                                                  style={{
                                                       display: "flex",
                                                       justifyContent:
                                                            "space-between",
                                                       width: "100%",
                                                  }}
                                             >
                                                  <h4
                                                       style={{
                                                            margin: 0,
                                                       }}
                                                  >
                                                       {
                                                            thread.messages[0]
                                                                 .author
                                                                 .username
                                                       }
                                                  </h4>
                                                  <p style={{ margin: 0 }}>
                                                       {formatDistanceToNow(
                                                            new Date(
                                                                 thread.messages[0].timestamp
                                                            ),
                                                            {
                                                                 addSuffix:
                                                                      true,
                                                            }
                                                       )}
                                                  </p>
                                             </div>
                                        </CardHeader>
                                        <CardBody
                                             onClick={() =>
                                                  toggleThread(thread.id)
                                             }
                                        >
                                             <h3 className="text-md d-block block">
                                                  <strong>{thread.name}</strong>
                                             </h3>
                                             {thread.messages
                                                  .slice(
                                                       0,
                                                       expandedThreadId ===
                                                            thread.id
                                                            ? thread.messages
                                                                   .length
                                                            : 1
                                                  )
                                                  .reverse()
                                                  .map((message, index) => (
                                                       <div
                                                            key={index}
                                                            style={{
                                                                 display: "flex",
                                                                 alignItems:
                                                                      "center",
                                                                 marginTop:
                                                                      "1rem",
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
                                                                      borderRadius:
                                                                           "50%",
                                                                 }}
                                                            />
                                                            <div>
                                                                 <strong>
                                                                      {
                                                                           message
                                                                                .author
                                                                                .username
                                                                      }
                                                                 </strong>
                                                                 <p>
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
                                                                      title={formatDate(
                                                                           message.timestamp
                                                                      )}
                                                                      data-date={
                                                                           message.timestamp
                                                                      }
                                                                 >
                                                                      {formatDistanceToNow(
                                                                           new Date(
                                                                                message.timestamp
                                                                           ),
                                                                           {
                                                                                addSuffix:
                                                                                     true,
                                                                           }
                                                                      )}
                                                                 </p>
                                                            </div>
                                                       </div>
                                                  ))}
                                             <Button
                                                  flat
                                                  onClick={() =>
                                                       toggleThread(thread.id)
                                                  }
                                                  css={{
                                                       width: "100%",
                                                       justifyContent: "center",
                                                       padding: "10px",
                                                       color:
                                                            expandedThreadId ===
                                                            thread.id
                                                                 ? "red"
                                                                 : "blue",
                                                  }}
                                             >
                                                  {expandedThreadId ===
                                                  thread.id
                                                       ? "Collapse Thread"
                                                       : "Expand Thread"}
                                             </Button>
                                        </CardBody>
                                        <div
                                             style={{
                                                  display: "flex",
                                                  alignItems: "center",
                                                  justifyContent:
                                                       "space-between",
                                                  padding: "0.5rem 1rem",
                                                  background: "#f5f5f5",
                                             }}
                                        >
                                             <div
                                                  style={{
                                                       display: "flex",
                                                       alignItems: "center",
                                                  }}
                                             >
                                                  {/* Reactions and comment count */}
                                                  <span>👍 12</span>
                                                  <span>❤️ 96</span>
                                                  {/* ... other reactions */}
                                             </div>
                                             <div>
                                                  {/* Comment and share counts */}
                                                  <span>💬 13</span>
                                                  <span>🔗 17</span>
                                             </div>
                                        </div>
                                   </Card>
                              ))}
                         <Pagination
                              total={totalNumberOfPages}
                              page={currentPage}
                              onChange={handlePageChange}
                         />
                    </div>
               </div>
          </Container>
     );
}
