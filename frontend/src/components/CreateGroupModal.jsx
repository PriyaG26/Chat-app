import { Dialog } from "@headlessui/react";

import { useForm } from "react-hook-form";
import { useAuthStore } from "../store/useAuthStore";

import { axiosInstance } from "../lib/axios.js";

// Accept 'users' as a prop here
export default function CreateGroupModal({ isOpen, onClose, onGroupCreated, users: allAppUsers }) {
  const { authUser } = useAuthStore();
  // Removed local state 'users' since we're getting it from props
  // const [users, setUsers] = useState([]); 

  // No longer need to fetch users directly in the modal,
  // as they are passed down as 'allAppUsers' prop.
  // const { getUsers, users:appusers, selectedUser, setSelectedUser, isUsersLoading } = useChatStore(); 
  // useEffect(() => {
  //  getUsers();
  // }, [getUsers]);


  const {
    register,
    handleSubmit,
    reset,
    watch,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm({
    defaultValues: {
      groupName: "",
      members: [],
    },
  });

  // const selectedMembers = watch("members");

  // Filter users based on the prop, excluding the authenticated user
  // This replaces your previous useEffect for fetching users
  const selectableUsers = allAppUsers.filter((u) => u._id !== authUser._id);

  const onSubmit = async (data) => {
    if (!data.groupName) {
      setError("groupName", {
        type: "manual",
        message: "Group name is required",
      });
      return;
    }

    if (data.members.length === 0) {
      setError("members", {
        type: "manual",
        message: "Select at least one user",
      });
      return;
    }

    try {
      const res = await axiosInstance.post("/groups/create", {
        groupName: data.groupName,
        members: data.members,
        admin: authUser._id, // Ensure the admin is correctly sent if needed by your backend
      });

      onGroupCreated(res.data);
      onClose();
      reset();
    } catch (err) {
      console.error("Failed to create group:", err);
      // You might want to display an error message to the user here
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white dark:bg-neutral p-6 rounded w-full max-w-md">
          <Dialog.Title className="text-lg font-bold mb-4">Create Group</Dialog.Title>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Group Name */}
            <input
              type="text"
              placeholder="Group Name"
              {...register("groupName", { required: true })}
              className="input input-bordered w-full dark:bg-zinc-700 dark:text-white"
            />
            {errors.groupName && (
              <p className="text-sm text-red-500">Group name is required</p>
            )}

            {/* User Checkboxes */}
            <div className="space-y-2 h-48 overflow-y-auto border p-2 rounded dark:border-zinc-700">
              {selectableUsers.length > 0 ? (
                selectableUsers.map((user) => (
                  <label
                    key={user._id}
                    className="flex items-center gap-2 cursor-pointer dark:text-gray-300"
                  >
                    <input
                      type="checkbox"
                      value={user._id}
                      {...register("members")}
                      className="checkbox checkbox-sm"
                      onChange={() => clearErrors("members")} // Clear error when any checkbox is toggled
                    />
                    <span>{user.fullName}</span>
                  </label>
                ))
              ) : (
                <p className="text-sm text-gray-500">No users available</p>
              )}
            </div>
            {errors.members && (
              <p className="text-sm text-red-500">{errors.members.message}</p>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between">
              <button type="submit" className="btn btn-primary">
                Create
              </button>
              <button
                type="button"
                onClick={() => {
                  reset();
                  onClose();
                }}
                className="text-sm text-blue-500 dark:text-blue-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}



// import { Dialog } from "@headlessui/react";
// import { useState, useEffect } from "react";
// import { useChatStore } from "../store/useChatStore"; 
// import { useAuthStore } from "../store/useAuthStore";
// import { axiosInstance } from "../lib/axios.js"; 

// export default function CreateGroupModal({ isOpen, onClose, authUser, onGroupCreated }) {
//   const [groupName, setGroupName] = useState("");
//   const [users, setUsers] = useState([]);
//   const [selectedUserIds, setSelectedUserIds] = useState([]);
   

//   // Fetch all users (excluding self)
//   useEffect(() => {
//     if (!isOpen) return;
//     axiosInstance.get("/users").then((res) => {
//       const filtered = res.data.filter((u) => u._id !== authUser._id);
//       setUsers(filtered);
//     });
//   }, [isOpen, authUser._id]);

//   const toggleUser = (id) => {
//     setSelectedUserIds((prev) =>
//       prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
//     );
//   };

//   const handleCreateGroup = async () => {
//     if (!groupName || selectedUserIds.length < 1) return;

//     try {
//       const res = await axiosInstance.post("/groups/create", {
//         name: groupName,
//         members: selectedUserIds,
//         admin: authUser._id,
//       });
//       onGroupCreated(res.data);
//       onClose();
//       setGroupName("");
//       setSelectedUserIds([]);
//     } catch (err) {
//       console.error("Failed to create group:", err);
//     }
//   };

//   return (
//     <Dialog open={isOpen} onClose={onClose} className="relative z-50">
//       <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
//       <div className="fixed inset-0 flex items-center justify-center p-4">
//         <Dialog.Panel className="bg-white dark:bg-neutral p-6 rounded w-full max-w-md">
//           <Dialog.Title className="text-lg font-bold mb-4">Create Group</Dialog.Title>

//           <input
//             className="input input-bordered w-full mb-4"
//             placeholder="Group Name"
//             value={groupName}
//             onChange={(e) => setGroupName(e.target.value)}
//           />

//           <div className="space-y-2 h-48 overflow-y-auto mb-4">
//             {users.map((user) => (
//               <label key={user._id} className="flex items-center space-x-2 cursor-pointer">
//                 <input
//                   type="checkbox"
//                   checked={selectedUserIds.includes(user._id)}
//                   onChange={() => toggleUser(user._id)}
//                 />
//                 <span>{user.fullName}</span>
//               </label>
//             ))}
            
//           </div>

//           <div className="flex justify-between">
//             <button onClick={handleCreateGroup} className="btn btn-primary">
//               Create
//             </button>
//             <button onClick={onClose} className="text-sm text-blue-500">
//               Cancel 
//             </button>
//           </div>
//         </Dialog.Panel>
//       </div>
//     </Dialog>
//   );
// }
