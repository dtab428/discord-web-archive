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
     Tooltip,
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
          serverName: "",
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
               fetch(`/api/servers/${serverId}`)
                    .then((res) =>
                         res.ok ? res.json() : Promise.reject(res.statusText)
                    )
                    .then((serverDetails) => {
                         setData((prevData) => ({
                              ...prevData,
                              serverAvatar: `https://cdn.discordapp.com/icons/${serverId}/${serverDetails.icon}.png`,
                              serverName:
                                   serverDetails.name || "Unknown Server",
                         }));
                    })
                    .catch((error) =>
                         console.error("Error fetching data:", error)
                    )
                    .finally(() => setLoading(false));
          }
     }, [serverId]);

     // Recalculate totalNumberOfPages when activeThreads changes
     useEffect(() => {
          const newTotalPages = Math.ceil(activeThreads.length / postsPerPage);
          if (currentPage > newTotalPages) {
               setCurrentPage(newTotalPages || 1);
          }
     }, [activeThreads, postsPerPage, currentPage]);

     const fetchChannelsAndThreads = (serverId) => {
          fetch(`/api/forums/${serverId}`)
               .then((res) =>
                    res.ok ? res.json() : Promise.reject(res.statusText)
               )
               .then((forumData) => {
                    setData((prevData) => ({
                         ...prevData,
                         channels: forumData.channels,
                         threads: forumData.threads,
                    }));
               })
               .catch((error) => console.error("Error fetching data:", error));
     };

     useEffect(() => {
          if (serverId) {
               fetchChannelsAndThreads(serverId);
          }
     }, [serverId]); // Fetch channels and threads only when serverId changes

     useEffect(() => {
          if (!router.isReady) return;

          const { channelId, page } = router.query;

          // Set the currentPage to 1 if no page parameter is provided
          const pageNumber = page ? parseInt(page, 10) : 1;
          setCurrentPage(pageNumber);

          if (channelId && data.channels.length > 0) {
               handleChannelClick(channelId, true); // true for isInitialLoad
          }
     }, [router.isReady, router.query, data.channels]);

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

     const handleChannelClick = (channelId, isInitialLoad = false) => {
          // Check if the clicked channel is already active
          if (channelId !== activeChannel?.id) {
               // Determine the page number to use: either from the URL (if initial load) or default to 1
               const urlPageNumber =
                    isInitialLoad && router.query.page
                         ? parseInt(router.query.page, 10)
                         : 1;

               // Update the URL with the appropriate page number
               router.push(
                    `?serverId=${serverId}&channelId=${channelId}&page=${urlPageNumber}`,
                    undefined,
                    { shallow: true }
               );

               // Find the channel in the 'channels' array
               const channel = data.channels.find((ch) => ch.id === channelId);
               if (channel) {
                    // Set the active channel
                    setActiveChannel(channel);

                    // Set the current page based on the URL parameter or reset to 1
                    if (!isInitialLoad) {
                         setCurrentPage(1);
                    } else if (router.query.page) {
                         setCurrentPage(urlPageNumber);
                    }

                    // Assuming data.threads is an array of arrays for each channel
                    const channelIndex = data.channels.findIndex(
                         (ch) => ch.id === channelId
                    );
                    if (channelIndex !== -1 && data.threads[channelIndex]) {
                         // Filter threads for the selected channel
                         const filteredThreads = data.threads[
                              channelIndex
                         ].filter((thread) => thread.parent_id === channelId);
                         setActiveThreads(filteredThreads);
                    } else {
                         console.error("Threads not found for the channel");
                         setActiveThreads([]);
                    }
               } else {
                    console.error("Channel not found");
                    setActiveThreads([]);
               }
          }
     };

     const handlePageChange = (newPage) => {
          // Fetch threads for the new page
          setCurrentPage(newPage);
          router.push(
               `?serverId=${serverId}&channelId=${activeChannel?.id}&page=${newPage}`,
               undefined,
               { shallow: true }
          );
     };

     const totalNumberOfPages = Math.ceil(activeThreads.length / postsPerPage);

     const toggleThread = (threadId) => {
          setExpandedThreadId(expandedThreadId === threadId ? null : threadId);
     };

     if (loading) {
          return (
               <Container>
                    <Spinner />
               </Container>
          );
     }

     return (
          <Container>
               {/* Hero section */}
               <div
                    style={{
                         display: "flex",
                         alignItems: "center",
                         marginBottom: "20px",
                    }}
               >
                    <Avatar
                         src={data.serverAvatar}
                         size="lg"
                         css={{ marginRight: "10px" }}
                         className="me-2"
                    />
                    <h1 className="text-md">{data.serverName}</h1>
               </div>
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
                                        className="my-1"
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
                                                  className="me-1"
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
                                                  <h4 style={{ margin: 0 }}>
                                                       {/* Replace with actual username or other content */}
                                                       {
                                                            thread.messages[
                                                                 thread.messages
                                                                      .length -
                                                                      1
                                                            ].author.username
                                                       }
                                                  </h4>
                                                  <Tooltip
                                                       content={formatDate(
                                                            thread.messages[
                                                                 thread.messages
                                                                      .length -
                                                                      1
                                                            ].timestamp
                                                       )}
                                                  >
                                                       <p
                                                            style={{
                                                                 margin: 0,
                                                                 cursor: "pointer",
                                                            }}
                                                       >
                                                            {formatDistanceToNow(
                                                                 new Date(
                                                                      thread.messages[
                                                                           thread
                                                                                .messages
                                                                                .length -
                                                                                1
                                                                      ].timestamp
                                                                 ),
                                                                 {
                                                                      addSuffix:
                                                                           true,
                                                                 }
                                                            )}
                                                       </p>
                                                  </Tooltip>
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
                                             {expandedThreadId === thread.id ? (
                                                  thread.messages
                                                       .slice()
                                                       .reverse()
                                                       .map(
                                                            (
                                                                 message,
                                                                 index
                                                            ) => (
                                                                 <div
                                                                      key={
                                                                           index
                                                                      }
                                                                      style={{
                                                                           display: "flex",

                                                                           marginTop:
                                                                                "1rem",
                                                                      }}
                                                                 >
                                                                      <div
                                                                           style={{
                                                                                width: "32px",
                                                                                height: "32px",
                                                                           }}
                                                                           className="me-1"
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
                                                                                     borderRadius:
                                                                                          "50%",
                                                                                }}
                                                                           />
                                                                      </div>

                                                                      <div>
                                                                           <div className="flex items-center">
                                                                                <strong>
                                                                                     {
                                                                                          message
                                                                                               .author
                                                                                               .username
                                                                                     }
                                                                                </strong>
                                                                                <p
                                                                                     className="ms-1"
                                                                                     style={{
                                                                                          fontSize:
                                                                                               "0.75rem",
                                                                                          color: "#888",
                                                                                     }}
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
                                                                           <p>
                                                                                {
                                                                                     message.content
                                                                                }
                                                                           </p>
                                                                      </div>
                                                                 </div>
                                                            )
                                                       )
                                             ) : (
                                                  <div
                                                       style={{
                                                            display: "flex",
                                                            marginTop: "1rem",
                                                       }}
                                                  >
                                                       <div
                                                            style={{
                                                                 width: "32px",
                                                                 height: "32px",
                                                            }}
                                                            className="me-1"
                                                       >
                                                            <Avatar
                                                                 src={getAvatarUrl(
                                                                      thread
                                                                           .messages[
                                                                           thread
                                                                                .messages
                                                                                .length -
                                                                                1
                                                                      ].author
                                                                           .id,
                                                                      thread
                                                                           .messages[
                                                                           thread
                                                                                .messages
                                                                                .length -
                                                                                1
                                                                      ].author
                                                                           .avatar,
                                                                      thread
                                                                           .messages[
                                                                           thread
                                                                                .messages
                                                                                .length -
                                                                                1
                                                                      ].author
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
                                                       </div>

                                                       <div>
                                                            <div className="flex items-center">
                                                                 <strong>
                                                                      {
                                                                           thread
                                                                                .messages[
                                                                                thread
                                                                                     .messages
                                                                                     .length -
                                                                                     1
                                                                           ]
                                                                                .author
                                                                                .username
                                                                      }
                                                                 </strong>
                                                                 <p
                                                                      className="ms-1"
                                                                      style={{
                                                                           fontSize:
                                                                                "0.75rem",
                                                                           color: "#888",
                                                                      }}
                                                                 >
                                                                      {formatDistanceToNow(
                                                                           new Date(
                                                                                thread.messages[
                                                                                     thread
                                                                                          .messages
                                                                                          .length -
                                                                                          1
                                                                                ].timestamp
                                                                           ),
                                                                           {
                                                                                addSuffix:
                                                                                     true,
                                                                           }
                                                                      )}
                                                                 </p>
                                                            </div>
                                                            <p>
                                                                 {
                                                                      thread
                                                                           .messages[
                                                                           thread
                                                                                .messages
                                                                                .length -
                                                                                1
                                                                      ].content
                                                                 }
                                                            </p>
                                                       </div>
                                                  </div>
                                             )}
                                             <Button
                                                  flat
                                                  onClick={() =>
                                                       toggleThread(thread.id)
                                                  }
                                                  className="mt-3"
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
                                                  {/* Dynamic message count */}
                                                  <span>
                                                       💬{" "}
                                                       {
                                                            thread.total_message_sent
                                                       }
                                                  </span>

                                                  {/* Dynamic member count */}
                                                  <span
                                                       style={{
                                                            marginLeft: "10px",
                                                       }}
                                                  >
                                                       👥 {thread.member_count}
                                                  </span>
                                             </div>
                                        </div>
                                   </Card>
                              ))}
                         {totalNumberOfPages > 1 && (
                              <Pagination
                                   total={totalNumberOfPages}
                                   page={currentPage}
                                   onChange={handlePageChange}
                              />
                         )}
                    </div>
               </div>
          </Container>
     );
}
