import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});
  const [onlineUsers, setOnlineUsers] = useState([]);

  const { socket, axios } = useContext(AuthContext);

  // Function to get all users for the sidebar
  const getUsers = async () => {
    try {
      const { data } = await axios.get("/api/messages/users");
      if (data.success) {
        setUsers(data.filteredUsers || []);
        setUnseenMessages(data.unseenMessages || {});
      } else {
        toast.error(data.message || "Failed to fetch users.");
      }
    } catch (error) {
      toast.error(error.message || "Something went wrong while fetching users.");
    }
  };

  // Function to get messages for selected user
  const getMessages = async (userId) => {
    try {
      const { data } = await axios.get(`/api/messages/${userId}`);
      if (data.success) {
        setMessages(data.messages || []);
      } else {
        toast.error(data.message || "Failed to fetch messages.");
      }
    } catch (error) {
      toast.error(error.message || "Something went wrong while fetching messages.");
    }
  };

  // Function to send message to selected user
  const sendMessage = async (messageData) => {
    try {
      const { data } = await axios.post(`/api/messages/send/${selectedUser._id}`, messageData);
      if (data.success) {
        setMessages((prev) => [...prev, data.newMessage]);
      } else {
        toast.error(data.message || "Failed to send message.");
      }
    } catch (error) {
      toast.error(error.message || "Something went wrong while sending the message.");
    }
  };

  // Function to handle incoming messages via socket
  const subscribeToMessages = () => {
    if (!socket) return;

    socket.on("newMessage", (newMessage) => {
      if (selectedUser && newMessage.senderId === selectedUser._id) {
        newMessage.seen = true;
        setMessages((prev) => [...prev, newMessage]);
        axios.put(`/api/messages/mark/${newMessage._id}`);
      } else {
        setUnseenMessages((prev) => ({
          ...prev,
          [newMessage.senderId]: prev[newMessage.senderId] ? prev[newMessage.senderId] + 1 : 1,
        }));
      }
    });

    // Listen for online users
    socket.on("getOnlineUsers", (onlineUserIds) => {
      setOnlineUsers(onlineUserIds);
    });
  };

  // Function to clean up socket listener
  const unsubscribeFromMessages = () => {
    if (socket) socket.off("newMessage");
    if (socket) socket.off("getOnlineUsers"); // Clean up listener for online users
  };

  useEffect(() => {
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [socket, selectedUser]);

  const value = {
    messages,
    users,
    selectedUser,
    getUsers,
    sendMessage,
    setSelectedUser,
    unseenMessages,
    setUnseenMessages,
    getMessages,
    onlineUsers, // Provide onlineUsers state to children
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
