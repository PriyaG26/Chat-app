/// Sidebar.jsx
import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { UserPlus2 } from "lucide-react";
import CreateGroupModal from "./CreateGroupModal";
import toast from "react-hot-toast"; // Make sure to import toast

const Sidebar = () => {
  const { authUser } = useAuthStore();
  // Include addGroupToState in the destructuring
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading, getGroups, groups, addGroupToState } = useChatStore();

  const { onlineUsers } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);


  useEffect(() => {
    getUsers();
    if (authUser?._id) {
        getGroups(authUser._id);
    }
  }, [getUsers, getGroups, authUser?._id]); // Dependency array: authUser._id for re-fetching when user changes

  const filteredUsers = showOnlineOnly
    ? users.filter((user) => onlineUsers.includes(user._id))
    : users;

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsGroupModalOpen(true)}
            className="p-1.5 rounded hover:bg-primary/20 transition-colors"
            title="Create Group"
          >
            <UserPlus2 className="w-5 h-5 text-primary" />
          </button>
          <span className="font-medium hidden lg:block">Create Group</span>
        </div>
        <div className="mt-3 hidden lg:flex items-center gap-2">
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm"
            />
            <span className="text-sm">Show online only</span>
          </label>
          <span className="text-xs text-zinc-500">({onlineUsers.length - 1} online)</span>
        </div>
      </div>

      <div className="overflow-y-auto w-full py-3">
        {/* Display Groups */}
        {groups.length > 0 && (
            <>
                <div className="px-3 py-2 text-sm font-semibold text-gray-500 hidden lg:block">Groups</div>
                {groups.map((group) => (
                    <button
                        key={group._id}
                        onClick={() => setSelectedUser(group)}
                        className={`w-full p-3 flex items-center gap-3 hover:bg-base-300 transition-colors ${
                            selectedUser?._id === group._id ? "bg-base-300 ring-1 ring-base-300" : ""
                        }`}
                    >
                        <div className="relative mx-auto lg:mx-0">
                            <div className="size-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">
                                {/* Use groupName as per your schema */}
                                {group.groupName ? group.groupName[0].toUpperCase() : 'G'} 
                            </div>
                        </div>

                        <div className="hidden lg:block text-left min-w-0">
                            {/* Use groupName as per your schema */}
                            <div className="font-medium truncate">{group.groupName}</div> 
                            <div className="text-sm text-zinc-400">Group Chat</div>
                        </div>
                    </button>
                ))}
            </>
        )}

        {/* Separator if both groups and users are present */}
        {groups.length > 0 && filteredUsers.length > 0 && (
            <div className="border-t border-base-300 my-2 mx-3 hidden lg:block"></div>
        )}

        {/* Display Individual Users */}
        {filteredUsers.length > 0 && (
             <>
                <div className="px-3 py-2 text-sm font-semibold text-gray-500 hidden lg:block">Direct Messages</div>
                {filteredUsers.map((user) => (
                    <button
                        key={user._id}
                        onClick={() => setSelectedUser(user)}
                        className={`
                            w-full p-3 flex items-center gap-3
                            hover:bg-base-300 transition-colors
                            ${selectedUser?._id === user._id ? "bg-base-300 ring-1 ring-base-300" : ""}
                        `}
                    >
                        <div className="relative mx-auto lg:mx-0">
                            <img
                                src={user.profilePic || "/avatar.png"}
                                alt={user.fullName}
                                className="size-12 object-cover rounded-full"
                            />
                            {onlineUsers.includes(user._id) && (
                                <span
                                    className="absolute bottom-0 right-0 size-3 bg-green-500
                                    rounded-full ring-2 ring-zinc-900"
                                />
                            )}
                        </div>

                        <div className="hidden lg:block text-left min-w-0">
                            <div className="font-medium truncate">{user.fullName}</div>
                            <div className="text-sm text-zinc-400">
                                {onlineUsers.includes(user._id) ? "Online" : "Offline"}
                            </div>
                        </div>
                    </button>
                ))}
             </>
        )}

        {/* Message if no users/groups */}
        {groups.length === 0 && filteredUsers.length === 0 && (
            <div className="text-center text-zinc-500 py-4">No contacts or groups available</div>
        )}
      </div>

      {isGroupModalOpen && (
        <CreateGroupModal
          isOpen={isGroupModalOpen}
          onClose={() => setIsGroupModalOpen(false)}
          authUser={authUser}
          users={users}
          onGroupCreated={(newGroup) => {
            // Option 1: Re-fetch all groups (simple, but might be less efficient for many groups)
            // getGroups(authUser._id); // This will still work

            // Option 2 (Better): Add the new group directly to the state
            // Make sure your backend's createGroup controller returns the created group
            // with `groupName` and `_id` and other necessary fields.
            addGroupToState(newGroup); 
            
            console.log("New Group created:", newGroup);
            toast.success(`Group "${newGroup.groupName || newGroup.name}" created!`); // Use groupName or name for toast
          }}
        />
      )}
    </aside>
  );
};
export default Sidebar;



// import { useEffect, useState } from "react";
// import { useChatStore } from "../store/useChatStore";
// import { useAuthStore } from "../store/useAuthStore";
// import SidebarSkeleton from "./skeletons/SidebarSkeleton";
// import { UserPlus2 } from "lucide-react";
// import CreateGroupModal from "./CreateGroupModal";

// const Sidebar = () => {
//   const { authUser } = useAuthStore();
//   const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading, getGroups, groups } = useChatStore();

//   const { onlineUsers } = useAuthStore();
//   const [showOnlineOnly, setShowOnlineOnly] = useState(false);
//   const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);


//   useEffect(() => {
//     getUsers();
//      if (authUser?._id) getGroups(authUser._id);
//   }, [getUsers, getGroups, authUser]);

//   const filteredUsers = showOnlineOnly
//     ? users.filter((user) => onlineUsers.includes(user._id))
//     : users;

//   if (isUsersLoading) return <SidebarSkeleton />;

//   return (
//     <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
//       <div className="border-b border-base-300 w-full p-5">
//         <div className="flex items-center gap-2">
//         <button
//   onClick={() => setIsGroupModalOpen(true)}
//   className="p-1.5 rounded hover:bg-primary/20 transition-colors"
//   title="Create Group"
// >
//   <UserPlus2 className="w-5 h-5 text-primary" />
// </button>
// <span className="font-medium hidden lg:block">Create Group</span></div>
//         <div className="mt-3 hidden lg:flex items-center gap-2">
//           <label className="cursor-pointer flex items-center gap-2">
//             <input
//               type="checkbox"
//               checked={showOnlineOnly}
//               onChange={(e) => setShowOnlineOnly(e.target.checked)}
//               className="checkbox checkbox-sm"
//             />
//             <span className="text-sm">Show online only</span>
//           </label>
//           <span className="text-xs text-zinc-500">({onlineUsers.length - 1} online)</span>
//         </div>
//       </div>

//       <div className="overflow-y-auto w-full py-3">
//         {groups.map((group) => (
//   <button
//     key={group._id}
//     onClick={() => setSelectedUser(group)} // or use a new `setSelectedGroup(group)`
//     className={`w-full p-3 flex items-center gap-3 hover:bg-base-300 transition-colors ${
//       selectedUser?._id === group._id ? "bg-base-300 ring-1 ring-base-300" : ""
//     }`}
//   >
//     <div className="relative mx-auto lg:mx-0">
//       <div className="size-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">
//         {group.name[0].toUpperCase()}
//       </div>
//     </div>

//     <div className="hidden lg:block text-left min-w-0">
//       <div className="font-medium truncate">{group.name}</div>
//       <div className="text-sm text-zinc-400">Group Chat</div>
//     </div>
//   </button>
// ))}
//         {filteredUsers.map((user) => (
//           <button
//             key={user._id}
//             onClick={() => setSelectedUser(user)}
//             className={`
//               w-full p-3 flex items-center gap-3
//               hover:bg-base-300 transition-colors
//               ${selectedUser?._id === user._id ? "bg-base-300 ring-1 ring-base-300" : ""}
//             `}
//           >
//             <div className="relative mx-auto lg:mx-0">
//               <img
//                 src={user.profilePic || "/avatar.png"}
//                 alt={user.name}
//                 className="size-12 object-cover rounded-full"
//               />
//               {onlineUsers.includes(user._id) && (
//                 <span
//                   className="absolute bottom-0 right-0 size-3 bg-green-500
//                   rounded-full ring-2 ring-zinc-900"
//                 />
//               )}
//             </div>

//             <div className="hidden lg:block text-left min-w-0">
//               <div className="font-medium truncate">{user.fullName}</div>
//               <div className="text-sm text-zinc-400">
//                 {onlineUsers.includes(user._id) ? "Online" : "Offline"}
//               </div>
//             </div>
//           </button>
//         ))}

//         {filteredUsers.length === 0 && (
//           <div className="text-center text-zinc-500 py-4">No online users</div>
//         )}
//       </div>
//       {isGroupModalOpen && (
//         <CreateGroupModal
//           isOpen={isGroupModalOpen}
//           onClose={() => setIsGroupModalOpen(false)}
//           authUser={authUser}
//           // Pass the 'users' array to the CreateGroupModal
//           users={users} // <--- ADD THIS LINE
//           onGroupCreated={(newGroup) => {
//             getUsers()
//             console.log("New Group:", newGroup);
//           }}
//         />
//       )}
//     </aside>
//   );
// };
// export default Sidebar;