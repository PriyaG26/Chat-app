import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [], //we'd like to update this in real time
  users: [], 
  selectedUser: null, //so that we can see "select a chat to start conversation"
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`); //pass user id to tell the function which chat are we trying to access
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get(); //get the selected users and messages. It is coming from zustand, it says call the get function and restructre the staes according to yourself
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData); //we send the request to our endpoint and message data to our api. new message gets created
      set({ messages: [...messages, res.data] }); //append the newly created/started convo to the chat list
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return; //return if no user is selected

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => { //keep all prev msgs in chat, add new msg to it
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      set({
        messages: [...get().messages, newMessage],
      });
    });
  },

  unsubscribeFromMessages: () => { //when we close the window 
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));