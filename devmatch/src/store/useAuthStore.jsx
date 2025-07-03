import { create } from "zustand";
import { axiosInstance } from "../lib/axios.jsx";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import {useChatStore} from './useChatStore.jsx'
import { getUserFromStorage, saveUserToStorage, clearUserFromStorage, getUserId } from '../utils/userUtils';

const BASE_URL = process.env.NODE_ENV === "development"
  ? "http://localhost:5000"
  : "http://localhost:5000";

export const useAuthStore = create((set, get) => ({
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,

  onlineUsers: [],
  authUser: getUserFromStorage(),
  socket: null,
  isCheckingAuth: true,

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      const { user, token } = res.data;
      saveUserToStorage(user);
      localStorage.setItem("token", token);
      set({ authUser: user });
      toast.success("Account created successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed");
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      const { user, token } = res.data;
      saveUserToStorage(user);
      localStorage.setItem("token", token);
      set({ authUser: user });
      toast.success("Logged in successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      clearUserFromStorage();
      useNavigate('/login');
      set({ authUser: null, onlineUsers: [] });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      // Even if logout API fails, clear local storage
      clearUserFromStorage();
      set({ authUser: null, onlineUsers: [] });
      get().disconnectSocket();
      toast.error(error.response?.data?.message || "Logout failed");
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      const updatedUser = res.data.user;
      saveUserToStorage(updatedUser); 
      set({ authUser: updatedUser });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("error in update profile:", error);
      toast.error(error.response?.data?.message || "Update failed");
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser, socket } = get();
    if (!authUser || socket?.connected) return;

    const userId = getUserId(authUser);
    if (!userId) {
      console.error('No user ID found for socket connection');
      return;
    }

    const newSocket = io(BASE_URL, {
      query: {
        userId: userId,
      },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id, 'for user:', userId);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    newSocket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
    });

    newSocket.connect();
    set({ socket: newSocket });

    newSocket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });

    newSocket.on("newMessage", (message) => {
      const { selectedUser } = useChatStore.getState();
      if (selectedUser && 
          (message.senderId === selectedUser._id || 
           message.receiverId === selectedUser._id)) {
        useChatStore.getState().setMessages([
          ...useChatStore.getState().messages,
          message
        ]);
      }
    });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket?.connected) socket.disconnect();
    set({ socket: null });
  },

  // Sync with AuthContext
  syncWithAuthContext: (user) => {
    if (user) {
      set({ authUser: user });
      get().connectSocket();
    } else {
      set({ authUser: null });
      get().disconnectSocket();
    }
  },

  setAuthUser: (user) => set({ authUser: user }),

  fetchUser: async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await axiosInstance.get('/auth/me', { params: { token } });
      set({ authUser: res.data });
    } catch (err) {
      // Optionally handle error (e.g., logout or show error)
    }
  },

}));
