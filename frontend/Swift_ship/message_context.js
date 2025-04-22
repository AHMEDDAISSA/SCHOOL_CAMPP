// MessageContext.js
import React, { createContext, useState } from 'react';

const MessageContext = createContext();

export const MessageProvider = ({ children }) => {
  const [selectedMessage, setSelectedMessage] = useState(null);

  return (
    <MessageContext.Provider value={{ selectedMessage, setSelectedMessage }}>
      {children}
    </MessageContext.Provider>
  );
};

export default MessageContext;
