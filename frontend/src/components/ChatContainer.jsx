import React, { useEffect, useRef } from 'react';
import { useChatStore } from '../store/useChatStore.js';
import MessageInput from './MessageInput.jsx';
import ChatHeader from './ChatHeader.jsx';
import MessageSkeleton from './skeletons/MessageSkeleton.jsx';
import { useAuthStore } from '../store/useAuthStore.js';
import {formatMessageOTime} from "../lib/utils.js";

const ChatContainer = () => {
  const { messages, getMessages, areMessagesLoading, selectedUser, initializeMessageListener } =
    useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  // Initialize message listener when component mounts
  useEffect(() => {
    initializeMessageListener();
  }, [initializeMessageListener]);

  // Get messages when selected user changes
  useEffect(() => {
    if (selectedUser && selectedUser._id) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser, getMessages]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (areMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }
  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />
      <div className="flex-1 overflow-y-auto p-4 flex flex-col">
        {messages.map((message, index) => (
          <div
            key={message._id}
            className={`chat ${message.senderId === authUser._id ? 'chat-end' : 'chat-start'}`}
            style={{
              alignSelf: message.senderId === authUser._id ? 'flex-end' : 'flex-start',
              marginTop: message.senderId === authUser._id ? 'auto' : '4px',
              marginBottom: message.senderId === authUser._id ? '4px' : 'auto'
            }}
          >
            <div className="chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={
                    message.senderId === authUser._id
                      ? authUser.profilePic || '/avatar.png'
                      : selectedUser.profilePic || '/avatar.png'
                  }
                  alt="profile pic"
                />
              </div>
            </div>
            <div className="chat-header mb-1">
              <time className="text-xs opacity-50 ml-1">
                {formatMessageOTime(message.createdAt)}
              </time>
            </div>
            <div className="chat-bubble flex flex-col">
              {message.image && (
                <img
                  src={message.image}
                  alt="Attachment"
                  className="sm:max-w-[200px] rounded-md mb-2"
                />
              )}
              {message.text && <p>{message.text}</p>}
            </div>
          </div>
        ))}
        {/* Empty div at the end for auto-scrolling */}
        <div ref={messageEndRef} />
      </div>
      <MessageInput />
    </div>
  );
};

export default ChatContainer;
