//zustand is a global state management tool to manage/store the login state 
//this file contains different states and functions that can be used across different components
import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";
//in short, we are creating hooks
export const useAuthStore = create((set,get) => ({ //first arg is a callback function where we'd like to return an object
    authUser: null, //we dont know if the user is authenticated
     isSigningUp: false,
     isLoggingIn: false,
     isUpdatingProfile: false,
    isCheckingAuth: true, //as soon as we refresh our page, we will start to check if the user is authenticated or not
    onlineUsers:[], //initially this is empty, as soon as user logs in, they should be able to see all the online users 
    socket: null,



  checkAuth: async () => { //when page is refreshed, we want to check if the user is still authenticated. we can also insert a loading state
    try {
        //in the axios file, we have already implemented that base url is gonna be (our url)
      const res = await axiosInstance.get("/auth/check"); //the request is sent to the endpoint /auth/check

      set({ authUser: res.data });
       get().connectSocket(); //when the page is refreshed, we want to get connected if the user is authenticated
    } catch (error) {
      console.log("Error in checkAuth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => { //when all the fields of the form are validated and the user has signed up successfully
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      toast.success("Account created successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged in successfully");

      get().connectSocket() ;
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isLoggingIn: false });
    }
  },
  
  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true }); //profile is getting updated
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data }); //set auth user with newly updated data
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("error in update profile:", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return; //if user is not authenticated, dont even try to connect to the socket

    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id,
      },
    });
    socket.connect();

    set({ socket: socket }); //set the socket value that we declared above

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });
  },

  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },

}));