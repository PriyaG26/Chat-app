// In store/useChatStore.js
import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import { encryptMessage } from "../lib/utils";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  groups: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isGroupsLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load users");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getGroups: async (userId) => {
    set({ isGroupsLoading: true });
    try {
      const res = await axiosInstance.get(`/groups/user/${userId}`);
      set({ groups: res.data });
    } catch (err) {
      console.error("Failed to fetch groups:", err);
      toast.error("Failed to load groups");
    } finally {
      set({ isGroupsLoading: false });
    }
  },

  addGroupToState: (newGroup) => {
    set((state) => ({
      groups: [...state.groups, newGroup],
    }));
  },

  // MODIFIED: getMessages to handle both direct and group messages
  getMessages: async (conversationId, isGroup = false) => { // <-- Added isGroup parameter
    set({ isMessagesLoading: true });
    try {
      let endpoint;
      if (isGroup) {
        endpoint = `/messages/group/${conversationId}`; // <-- New backend endpoint for group messages
      } else {
        endpoint = `/messages/${conversationId}`; // <-- Existing endpoint for direct messages
      }
      const res = await axiosInstance.get(endpoint);
      set({ messages: res.data });
    } catch (error) {
      console.error("Failed to fetch messages:", error);
      toast.error(error.response?.data?.message || "Failed to load messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get(); // No need for authUser here, it's just for sending

    if (!selectedUser) {
      toast.error("Please select a chat to send a message.");
      return;
    }

    try {
      const encryptedText = messageData.text ? encryptMessage(messageData.text) : "";

      let endpoint;
      let payload = { ...messageData, text: encryptedText };

      if (selectedUser.isGroup) {
        endpoint = `/messages/send/group/${selectedUser._id}`;
        // payload.groupId = selectedUser._id; // Backend should get groupId from params
      } else {
        endpoint = `/messages/send/${selectedUser._id}`;
        // payload.receiverId = selectedUser._id; // Backend should get receiverId from params
      }

      const res = await axiosInstance.post(endpoint, payload);
      console.log("Message sent, received from backend:", res.data); // Keep this for debugging
      set({ messages: [...messages, res.data] });
    } catch (error) {
      console.error("Send message error:", error.response || error);
      toast.error(error.response?.data?.message || "Failed to send message.");
    }
  },

  // MODIFIED: subscribeToMessages to handle both direct and group messages
  subscribeToMessages: () => {
    const { authUser } = useAuthStore.getState(); // Get authUser from auth store directly here
    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      const currentSelectedUser = get().selectedUser;
      if (!currentSelectedUser || !authUser) return; // Need both selected chat and current user

      // Determine the actual senderId from the incoming message for comparison
      const incomingSenderId = typeof newMessage.senderId === 'object' && newMessage.senderId !== null
                               ? newMessage.senderId._id
                               : newMessage.senderId;

      // Check if the message is from the current user (you)
      const isMyOwnMessage = incomingSenderId === authUser._id;

      // Check if the message belongs to the currently selected conversation
      let belongsToSelectedChat = false;

      if (currentSelectedUser.isGroup) {
        // If selected is a group, check if message has the same groupId
        belongsToSelectedChat = newMessage.groupId === currentSelectedUser._id;
      } else {
        // If selected is a direct message, check if it's from/to the selected user
        belongsToSelectedChat =
          (incomingSenderId === currentSelectedUser._id && newMessage.receiverId === authUser._id) ||
          (incomingSenderId === authUser._id && newMessage.receiverId === currentSelectedUser._id);
      }

      // If it's your own message for the currently selected chat,
      // it's already added by the `sendMessage` function, so prevent duplicates.
      if (isMyOwnMessage && belongsToSelectedChat) {
          return;
      }

      // If it's an incoming message (not your own) and it belongs to the selected chat, add it.
      if (belongsToSelectedChat) {
        set({ messages: [...get().messages, newMessage] });
      }
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));





// import { create } from "zustand";
// import toast from "react-hot-toast";
// import { axiosInstance } from "../lib/axios";
// import { useAuthStore } from "./useAuthStore";
// import { encryptMessage } from "../lib/utils";

// export const useChatStore = create((set, get) => ({
//   messages: [], //we'd like to update this in real time
//   users: [], 
//   groups: [], 
//   selectedUser: null, //so that we can see "select a chat to start conversation"
//   isUsersLoading: false,
//   isMessagesLoading: false,
//     isGroupsLoading: false,

//   getUsers: async () => {
//     set({ isUsersLoading: true });
//     try {
//       const res = await axiosInstance.get("/messages/users");
//       set({ users: res.data });
//     } catch (error) {
//       toast.error(error.response.data.message);
//     } finally {
//       set({ isUsersLoading: false });
//     }
//   },

//   getGroups: async (userId) => {
//     set({ isGroupsLoading: true });
//     try {
//       // FIX: Changed to /groups/user/${userId} to match backend route
//       const res = await axiosInstance.get(`/groups/user/${userId}`); 
//       set({ groups: res.data });
//     } catch (err) {
//       console.error("Failed to fetch groups:", err); // Log the actual error
//       toast.error("Failed to load groups");
//     } finally {
//       set({ isGroupsLoading: false });
//     }
//   },

//   // OPTIONAL: Add a function to immediately add a new group to the state
//   addGroupToState: (newGroup) => {
//     set((state) => ({
//       groups: [...state.groups, newGroup],
//     }));
//   },

//   getMessages: async (userId) => {
//     set({ isMessagesLoading: true });
//     try {
//       const res = await axiosInstance.get(`/messages/${userId}`); //pass user id to tell the function which chat are we trying to access
//       set({ messages: res.data });
//     } catch (error) {
//       toast.error(error.response.data.message);
//     } finally {
//       set({ isMessagesLoading: false });
//     }
//   },

//   // In store/useChatStore.js
// sendMessage: async (messageData) => {
//   const { selectedUser, messages } = get(); 
  
//   if (!selectedUser) {
//     toast.error("Please select a chat to send a message.");
//     return;
//   }

//   try {
//     const encryptedText = messageData.text ? encryptMessage(messageData.text) : "";
    
//     let endpoint;
//     let payload = { ...messageData, text: encryptedText };

//     if (selectedUser.isGroup) { // Check if the selected conversation is a group
//       endpoint = `/messages/send/group/${selectedUser._id}`; // New group message endpoint
//       payload.groupId = selectedUser._id; // Add groupId to the payload
//     } else {
//       endpoint = `/messages/send/${selectedUser._id}`; // Existing direct message endpoint
//       payload.receiverId = selectedUser._id; // Add receiverId to the payload
//     }

//     //also need to ensure your backend `sendMessage` handles both scenarios
//     const res = await axiosInstance.post(endpoint, payload); 
//     console.log("Message received from backend:", res.data); 
//     set({ messages: [...messages, res.data] }); 
//   } catch (error) {
//     console.log(error)
//     toast.error(error.response.data.message || "Failed to send message.");
//   }
// },

//   // sendMessage: async (messageData) => {
//   //   const { selectedUser, messages } = get(); //get the selected users and messages. It is coming from zustand, it says call the get function and restructre the staes according to yourself
    
//   //   try {
//   //     const encryptedText = messageData.text
//   //     ? encryptMessage(messageData.text)
//   //     : "";
//   //     console.log(encryptedText)
//   //     const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, {...messageData, text: encryptedText,}); //we send the request to our endpoint and message data to our api. new message gets created
//   //     set({ messages: [...messages, res.data] }); //append the newly created/started convo to the chat list
//   //   } catch (error) {
//   //     toast.error(error.response.data.message);
//   //   }
//   // },

//   subscribeToMessages: () => {
//     const { selectedUser } = get();
//     if (!selectedUser) return; //return if no user is selected

//     const socket = useAuthStore.getState().socket;

//     socket.on("newMessage", (newMessage) => { //keep all prev msgs in chat, add new msg to it
//       const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
//       if (!isMessageSentFromSelectedUser) return;

//       set({
//         messages: [...get().messages, newMessage],
//       });
//     });
//   },

//   unsubscribeFromMessages: () => { //when we close the window 
//     const socket = useAuthStore.getState().socket;
//     socket.off("newMessage");
//   },

//   setSelectedUser: (selectedUser) => set({ selectedUser }),
// }));