//in this. we will make an instance whc=ich we can use throughout our application
//we can just call the exported instance and an instance will be created. we will only use this and not the native fetch method
import axios from "axios";

export const axiosInstance = axios.create({
   baseURL: import.meta.env.MODE === "development" ? "http://localhost:5001/api" : "/api",
  withCredentials: true, //to send cookies in every request
});