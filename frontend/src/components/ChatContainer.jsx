import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime, decryptMessage } from "../lib/utils";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    // Add 'users' and 'groups' to destructuring so you can use them for avatar/name lookups
    users, 
    groups,
  } = useChatStore(); 
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  useEffect(() => {
    // Crucial: Check if selectedUser exists and pass isGroup status to getMessages
    if (selectedUser?._id) { 
        getMessages(selectedUser._id, selectedUser.isGroup); // Pass selectedUser.isGroup
    }

    subscribeToMessages();

    return () => unsubscribeFromMessages();
  }, [selectedUser?._id, selectedUser?.isGroup, getMessages, subscribeToMessages, unsubscribeFromMessages]); // Add selectedUser.isGroup to dependencies

  useEffect(() => {
    if (messageEndRef.current && messages.length > 0) { // Only scroll if there are messages
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Handle case where no user is selected
  if (!selectedUser) {
    return (
      <div className="flex-1 flex items-center justify-center text-zinc-500">
        Select a chat to start conversation
      </div>
    );
  }

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          // Determine the actual senderId for comparison
          // If senderId is an object (populated), use its _id; otherwise, use the string ID.
          const currentSenderId = typeof message.senderId === 'object' && message.senderId !== null
                                  ? message.senderId._id
                                  : message.senderId;

          // Determine if the message is from the current authenticated user
          const isMyMessage = currentSenderId === authUser._id;

          // Determine the profile picture and sender name for display
          let senderProfilePic = "/avatar.png";
          let senderName = "Unknown";

          if (isMyMessage) {
              senderProfilePic = authUser.profilePic || "/avatar.png";
              senderName = authUser.fullName || "You";
          } else {
              // If senderId is populated (object), use its details
              if (typeof message.senderId === 'object' && message.senderId !== null) {
                  senderProfilePic = message.senderId.profilePic || "/avatar.png";
                  senderName = message.senderId.fullName || "Unknown User";
              } else {
                  // If senderId is just an ID string, find the user from the `users` list
                  const sender = users.find(u => u._id === currentSenderId);
                  if (sender) {
                      senderProfilePic = sender.profilePic || "/avatar.png";
                      senderName = sender.fullName || "Unknown User";
                  }
                  // For group chats, if the sender is not current user, try to get their details from `selectedUser.members`
                  // This assumes `selectedUser` (if a group) has its `members` array populated.
                  if (selectedUser.isGroup && selectedUser.members) {
                      const groupMember = selectedUser.members.find(member => member._id === currentSenderId);
                      if (groupMember) {
                          senderProfilePic = groupMember.profilePic || "/avatar.png";
                          senderName = groupMember.fullName || "Unknown Member";
                      }
                  }
              }
          }

          return (
            <div
              key={message._id}
              className={`chat ${isMyMessage ? "chat-end" : "chat-start"}`}
            >
              <div className=" chat-image avatar">
                <div className="size-10 rounded-full border">
                  <img
                    src={senderProfilePic} // Use the determined senderProfilePic
                    alt="profile pic"
                  />
                </div>
              </div>
              <div className="chat-header mb-1">
                {/* Only show sender name if it's a group chat AND not your message */}
                {selectedUser.isGroup && !isMyMessage && (
                    <span className="text-sm opacity-90 mr-2 font-semibold">
                        {senderName} {/* Use the determined senderName */}
                    </span>
                )}
                <time className="text-xs opacity-50 ml-1">
                  {formatMessageTime(message.createdAt)}
                </time>
              </div>
              <div className={`chat-bubble flex flex-col ${isMyMessage ? "chat-bubble-primary" : ""}`}>
                {message.image && (
                  <img
                    src={message.image}
                    alt="Attachment"
                    className="sm:max-w-[200px] rounded-md mb-2"
                  />
                )}
                {message.voiceNoteUrl && (
                <audio controls src={message.voiceNoteUrl} className="w-full max-w-xs" />
              )}
                {message.text && <p>{decryptMessage(message.text)}</p>}
              </div>
            </div>
          );
        })}
        {/* Ref for auto-scrolling to the latest message */}
        <div ref={messageEndRef} />
      </div>

      <MessageInput />
    </div>
  );
};
export default ChatContainer;




// const ChatContainer = () => {
//   const {
//     messages,
//     getMessages,
//     isMessagesLoading,
//     selectedUser,
//     subscribeToMessages,
//     unsubscribeFromMessages,
//   } = useChatStore(); //gives the status of all the vars mentioned
//   const { authUser } = useAuthStore();
//   const messageEndRef = useRef(null);

//   useEffect(() => {
//     getMessages(selectedUser._id); //to get the messages between us and the selected user

//     subscribeToMessages();

//     return () => unsubscribeFromMessages();
//   }, [selectedUser._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

//   useEffect(() => {
//     if (messageEndRef.current && messages) {
//       messageEndRef.current.scrollIntoView({ behavior: "smooth" });
//     }
//   }, [messages]);

//   if (isMessagesLoading) {
//     return (
//       <div className="flex-1 flex flex-col overflow-auto">
//         <ChatHeader />
//         <MessageSkeleton />
//         <MessageInput />
//       </div>
//     );
//   }

//   return (
//     <div className="flex-1 flex flex-col overflow-auto">
//       <ChatHeader />

//       <div className="flex-1 overflow-y-auto p-4 space-y-4">
//         {messages.map((message) => (
//           <div
//             key={message._id}
//             className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`} /* If i am owner of the msg, it should start at end, otherwise, at start */
//             ref={messageEndRef}
//           >
//             <div className=" chat-image avatar">
//               <div className="size-10 rounded-full border">
//                 <img
//                   src={
//                     message.senderId === authUser._id
//                       ? authUser.profilePic || "/avatar.png"
//                       : selectedUser.profilePic || "/avatar.png"
//                   } /* shows dp of the user who has sent the image */
//                   alt="profile pic"
//                 />
//               </div>
//             </div>
//             <div className="chat-header mb-1">
//               <time className="text-xs opacity-50 ml-1">
//                 {formatMessageTime(message.createdAt)}
//               </time>
//             </div>
//             <div className="chat-bubble flex flex-col">
//               {message.image && (
//                 <img
//                   src={message.image}
//                   alt="Attachment"
//                   className="sm:max-w-[200px] rounded-md mb-2"
//                 />
//               )}
//               {message.text && <p>{decryptMessage(message.text)}</p>}
//             </div>
//           </div>
//         ))}
//       </div>

//       <MessageInput />
//     </div>
//   );
// };
// export default ChatContainer;