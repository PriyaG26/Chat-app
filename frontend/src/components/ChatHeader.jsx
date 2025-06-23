import { X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { formatTime } from "../lib/utils";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const authUser = useAuthStore.getState().authUser; // Get the current authenticated user

  // If no user/group is selected, don't render the header
  if (!selectedUser) {
    return null;
  }

  // Determine avatar content based on whether it's a group or direct chat
  let avatarContent;
  if (selectedUser.isGroup) {
    // For groups, display the first letter of the group name
    const initial = selectedUser.groupName ? selectedUser.groupName.charAt(0).toUpperCase() : 'G'; // 'G' for generic Group
    avatarContent = (
      <div className="size-10 rounded-full flex items-center justify-center bg-blue-500 text-white font-bold text-lg">
        {initial}
      </div>
    );
  } else {
    // For direct messages, display the profile picture
    avatarContent = (
      <img src={selectedUser.profilePic || "/avatar.png"} alt={selectedUser.fullName} />
    );
  }

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="avatar">
            <div className="size-10 rounded-full relative overflow-hidden"> {/* Added overflow-hidden */}
              {avatarContent}
              {/* Show online dot only for direct messages that are online */}
              {!selectedUser.isGroup && onlineUsers.includes(selectedUser._id) && (
                <span className="badge badge-success badge-sm absolute -bottom-0.5 -right-0.5 border-none"></span>
              )}
            </div>
          </div>

          {/* Chat Info (User or Group) */}
          <div>
            <h3 className="font-medium">
              {selectedUser.isGroup ? selectedUser.groupName : selectedUser.fullName}
            </h3>
            <p className="text-sm text-base-content/70">
              {selectedUser.isGroup ? (
                // For groups, display "You" followed by other member names
                (() => {
                  const otherMembers = selectedUser.members
                    .filter((member) => member._id !== authUser._id) // Filter out the current user
                    .map((member) => member.fullName); // Get full names of other members

                  // Prepend "You" if there are other members, or just "You" if you're the only one
                  if (otherMembers.length > 0) {
                    return `You, ${otherMembers.join(", ")}`;
                  } else {
                    return "You"; // This case means you're the only member, which might be unusual for a group
                  }
                })()
              ) : (
                // For direct messages, display online status or last seen
                onlineUsers.includes(selectedUser._id)
                  ? "Online"
                  : `Last seen: ${formatTime(selectedUser.lastSeen)}`
              )}
            </p>
          </div>
        </div>

        {/* Close button */}
        <button onClick={() => setSelectedUser(null)}>
          <X />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;




// import { X } from "lucide-react";
// import { useAuthStore } from "../store/useAuthStore";
// import { useChatStore } from "../store/useChatStore";
// import { formatTime } from "../lib/utils"
 
// const ChatHeader = () => {
//   const { selectedUser, setSelectedUser } = useChatStore();
//   const { onlineUsers } = useAuthStore();

//   return (
//     <div className="p-2.5 border-b border-base-300">
//       <div className="flex items-center justify-between">
//         <div className="flex items-center gap-3">
//           {/* Avatar */}
//           <div className="avatar"> 
//             <div className="size-10 rounded-full relative">
//               <img src={selectedUser.profilePic || "/avatar.png"} alt={selectedUser.fullName} />
//             </div>
//           </div>

//           {/* User info */}
//           <div>
//             <h3 className="font-medium">{selectedUser.fullName}</h3>
//             <p className="text-sm text-base-content/70">
//               {onlineUsers.includes(selectedUser._id) ? "Online" : `Last seen: ${formatTime(selectedUser.lastSeen)}`}
//             </p>
//           </div>
//         </div>

//         {/* Close button */}
//         <button onClick={() => setSelectedUser(null)}>
//           <X />
//         </button>
//       </div>
//     </div>
//   );
// };
// export default ChatHeader;