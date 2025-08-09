import React from "react";

const Messages = ({ messages }) => {
  return (
    <div>
      {messages.map((message, i) => (
        <div key={i}>{message.text}</div>
      ))}
    </div>
  );
};

export default Messages;
