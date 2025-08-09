import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import Messages from "./Messages";
import SendMessage from "./SendMessage";

let socket;

const ChatBox = () => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    socket = io("http://localhost:5000");

    socket.on("message", (message) => {
      setMessages((messages) => [...messages, message]);
    });

    return () => {
      socket.disconnect();
      socket.off();
    };
  }, []);

  const sendMessage = (message) => {
    socket.emit("sendMessage", message);
  };

  return (
    <div>
      <h2>Chat</h2>
      <Messages messages={messages} />
      <SendMessage sendMessage={sendMessage} />
    </div>
  );
};

export default ChatBox;